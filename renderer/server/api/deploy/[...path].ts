import { defineEventHandler, getQuery, createError, readBody, getRequestURL, readFormData } from 'h3'
import { InferenceServer } from '../../utils/inference-server'
import { getSettings, getPythonApiBase, getInferenceHost } from '../../utils/settings'
import fs from 'fs'
import path from 'path'

const modelOutputBase = process.env.MODEL_OUTPUT_BASE || process.cwd()

interface ModelInfo {
  task_uuid: string
  labels: string[]
  model_paths: Record<string, string>
  onnx_status?: Record<string, boolean>
  created_at?: string
}

interface DeployService {
  service_id: string
  task_uuid: string
  project_id: string
  port: number
  status: string
  inference_url: string
  labels: string[]
  model_count: number
  created_at?: string
  model_paths: Record<string, string>
  service_type?: 'grpc' | 'http'
  device?: string
}

interface ConvertProgress {
  currentStep: number
  totalSteps: number
  stepName: string
  status: 'pending' | 'converting' | 'completed' | 'error'
  message: string
  convertedLabels: string[]
  failedLabel?: string
}

const runningServices: Map<string, DeployService> = new Map()
const runningServers: Map<string, InferenceServer> = new Map()
const convertProgress: Map<string, ConvertProgress> = new Map()

interface OnnxConversionResult {
  task_uuid: string
  label: string
  onnx_path: string
  config_path: string
  converted_at: string
  status: 'pending' | 'converting' | 'completed' | 'error'
  message?: string
}
const onnxConversions: Map<string, OnnxConversionResult> = new Map()

function getAvailablePort(): number {
  return Math.floor(Math.random() * (10000 - 8000 + 1)) + 8000
}

function getProjectRoot(): string {
  if (process.cwd().includes('renderer')) {
    return path.join(process.cwd(), '..', '..')
  }
  return process.cwd()
}

async function resolveModelPath(serverPath: string, pythonApiBase: string): Promise<string> {
  if (!serverPath) return ''

  if (path.isAbsolute(serverPath) && fs.existsSync(serverPath)) {
    return serverPath
  }

  let normalizedPath = serverPath.replace(/^\/+/,'').replace(/\\/g, '/')

  if (normalizedPath.startsWith('home/')) {
    const parts = normalizedPath.split('/')
    const outputIndex = parts.indexOf('output')
    if (outputIndex !== -1) {
      normalizedPath = parts.slice(outputIndex).join('/')
    }
  }

  const localPath = path.join(modelOutputBase, normalizedPath)

  if (fs.existsSync(localPath)) {
    return localPath
  }


  const tempDir = path.join(process.cwd(), 'temp_models')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  const fileName = path.basename(serverPath)
  const tempPath = path.join(tempDir, fileName)

  if (!fs.existsSync(tempPath)) {
    try {
      const staticUrl = `${pythonApiBase}/static/${normalizedPath.replace(/ /g, '%20')}`

      const response = await fetch(staticUrl)
      if (response.ok) {
        const buffer = await response.arrayBuffer()
        fs.writeFileSync(tempPath, Buffer.from(buffer))
        return tempPath
      }
    } catch (downloadErr: any) {
      console.warn(`[Deploy] Failed to download model: ${downloadErr.message}`)
    }
  } else {
    return tempPath
  }

  return localPath
}

export default defineEventHandler(async (event) => {
  const requestURL = getRequestURL(event)
  const eventPath = requestURL.pathname
  const method = event.method

  const settings = await getSettings()
  const pythonApiBase = getPythonApiBase(settings)

  if (eventPath === '/api/deploy/list' && method === 'GET') {
    return {
      services: Array.from(runningServices.values())
    }
  }

  if (eventPath === '/api/deploy/progress' && method === 'GET') {
    const query = getQuery(event)
    const taskUuid = query.task_uuid as string
    if (taskUuid && convertProgress.has(taskUuid)) {
      return convertProgress.get(taskUuid)
    }
    return null
  }

  if (eventPath.startsWith('/api/deploy/models/') && method === 'GET') {
    const projectId = eventPath.split('/api/deploy/models/')[1]

    try {
      const res = await fetch(`${pythonApiBase}/project/${projectId}/models`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      const models: ModelInfo[] = []

      const modelMap = new Map<string, ModelInfo>()

      for (const model of data.models || []) {
        const taskUuid = model.task_uuid

        if (!modelMap.has(taskUuid)) {
          modelMap.set(taskUuid, {
            task_uuid: taskUuid,
            labels: [],
            model_paths: {},
            onnx_status: {}
          })
        }

        const modelInfo = modelMap.get(taskUuid)!

        if (model.is_unified_structure || model.labels) {
          modelInfo.labels = model.labels || []
          for (const label of modelInfo.labels) {
            modelInfo.model_paths[label] = model.model_path || ''
          }
        } else {
          if (model.label) {
            modelInfo.labels.push(model.label)
            modelInfo.model_paths[model.label] = model.model_path || ''
          }
        }
      }

      for (const [taskUuid, modelInfo] of modelMap) {
        models.push(modelInfo)
      }

      return { models }
    } catch (err: any) {
      throw createError({
        statusCode: 500,
        message: `获取模型失败: ${err.message}`
      })
    }
  }

  if (eventPath === '/api/deploy/start' && method === 'POST') {
    try {
      const body = await readBody(event)
      const { project_id, task_uuid, labels, device } = body

      if (!project_id || !task_uuid) {
        throw createError({
          statusCode: 400,
          message: '缺少必要参数 project_id 或 task_uuid'
        })
      }

      const deviceType = device || 'GPU'

      convertProgress.set(task_uuid, {
        currentStep: 1,
        totalSteps: 1,
        stepName: '正在部署HTTP服务...',
        status: 'converting',
        message: '正在调用Python后端启动HTTP服务...',
        convertedLabels: []
      })

      try {
        const deployRes = await fetch(`${pythonApiBase}/deploy/http`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: String(project_id),
            task_uuid: task_uuid,
            device: deviceType
          })
        })

        const deployData = await deployRes.json()

        if (!deployRes.ok || !deployData.success) {
          throw new Error(deployData.message || deployData.error || 'HTTP服务部署失败')
        }

        const serviceId = deployData.service_id
        const port = deployData.port

        const host = getInferenceHost(settings)
        const inferenceUrl = `http://${host}:${port}`
        const service: DeployService = {
          service_id: serviceId,
          task_uuid,
          project_id: String(project_id),
          port,
          status: 'running',
          inference_url: inferenceUrl,
          labels: labels || [],
          model_count: labels?.length || 1,
          created_at: new Date().toISOString(),
          model_paths: {},
          service_type: 'http',
          device: deviceType
        }

        runningServices.set(serviceId, service)

        convertProgress.set(task_uuid, {
          currentStep: 1,
          totalSteps: 1,
          stepName: '服务已启动',
          status: 'completed',
          message: `HTTP服务启动成功，端口: ${port}`,
          convertedLabels: labels || []
        })

        setTimeout(() => {
          convertProgress.delete(task_uuid)
        }, 5000)

        return {
          status: 'success',
          service_id: serviceId,
          port,
          inference_url: inferenceUrl,
          labels: labels || [],
          model_count: labels?.length || 1,
          service_type: 'http',
          device: deviceType
        }
      } catch (serverErr: any) {
        convertProgress.set(task_uuid, {
          currentStep: 0,
          totalSteps: 1,
          stepName: '启动失败',
          status: 'error',
          message: serverErr.message || '服务启动失败',
          convertedLabels: []
        })
        throw createError({
          statusCode: 500,
          message: `启动HTTP服务失败: ${serverErr.message}`
        })
      }
    } catch (err: any) {
      throw createError({
        statusCode: err.statusCode || 500,
        message: err.message || '启动服务失败'
      })
    }
  }

  if (eventPath.startsWith('/api/deploy/stop/') && method === 'POST') {
    const serviceId = eventPath.split('/api/deploy/stop/')[1]

    let service = runningServices.get(serviceId)

    if (!service) {
      try {
        const servicesRes = await fetch(`${pythonApiBase}/deploy/http/services`)
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          for (const svc of servicesData.services || []) {
            const host = getInferenceHost(settings)
            const serviceUrl = `http://${host}:${svc.port}`
            runningServices.set(svc.service_id, {
              service_id: svc.service_id,
              task_uuid: svc.task_uuid || '',
              project_id: svc.project_id || '',
              port: svc.port || 0,
              status: 'running',
              inference_url: serviceUrl,
              labels: svc.labels || [],
              model_count: svc.labels?.length || 1,
              model_paths: {},
              service_type: 'http'
            })
          }
          service = runningServices.get(serviceId)
        }
      } catch (syncErr) {
        console.warn('同步服务列表失败:', syncErr)
      }
    }

    if (!service) {
      throw createError({
        statusCode: 404,
        message: '服务不存在'
      })
    }

    try {
      const stopRes = await fetch(`${pythonApiBase}/deploy/http/service/${serviceId}/stop`, {
        method: 'POST'
      })

      const stopData = await stopRes.json()

      if (!stopRes.ok || !stopData.success) {
        console.warn(`停止服务失败: ${stopData.message || '未知错误'}`)
      }
    } catch (stopErr: any) {
      console.warn(`停止服务请求失败: ${stopErr.message}`)
    }

    service.status = 'stopped'
    runningServices.delete(serviceId)

    try {
      const servicesRes = await fetch(`${pythonApiBase}/deploy/http/services`)
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        runningServices.clear()
        for (const svc of servicesData.services || []) {
          const host = getInferenceHost(settings)
          const serviceUrl = `http://${host}:${svc.port}`
          runningServices.set(svc.service_id, {
            service_id: svc.service_id,
            task_uuid: svc.task_uuid || '',
            project_id: svc.project_id || '',
            port: svc.port || 0,
            status: svc.status || 'running',
            inference_url: serviceUrl,
            labels: svc.labels || [],
            model_count: svc.labels?.length || 1,
            model_paths: {},
            service_type: 'http'
          })
        }
      }
    } catch (refreshErr) {
      console.warn('刷新服务列表失败:', refreshErr)
    }

    return {
      status: 'success',
      message: '服务已停止'
    }
  }

  if (eventPath === '/api/deploy/inference' && method === 'POST') {
    try {
      const formData = await readMultipartFormData(event)
      let imageFile: any = null
      let originalFilename = 'image.jpg'
      let originalType = 'image/jpeg'
      let service_id = ''

      if (formData) {
        for (const field of formData) {
          if (field.name === 'file' && field.data) {
            imageFile = field.data
            if (field.filename) originalFilename = field.filename
            if (field.type) originalType = field.type
          } else if (field.name === 'service_id') {
            service_id = field.data?.toString() || ''
          }
        }
      }

      if (!imageFile || !service_id) {
        throw createError({ statusCode: 400, message: '缺少必要参数 file 或 service_id' })
      }

      const service = runningServices.get(service_id)
      if (!service || service.status !== 'running') {
        throw createError({ statusCode: 404, message: '服务不存在或未运行' })
      }

      const host = getInferenceHost(settings)
      const inferenceUrl = `http://${host}:${service.port}`

      const inferenceFormData = new FormData()

      const blob = new Blob([new Uint8Array(imageFile)], { type: originalType })
      inferenceFormData.append('file', blob, originalFilename)
      inferenceFormData.append('service_id', service_id)


      const inferenceRes = await fetch(`${inferenceUrl}/predict`, {
        method: 'POST',
        body: inferenceFormData
      })

      if (!inferenceRes.ok) {
        const errorText = await inferenceRes.text().catch(() => '{}')
        console.error('Inference error response:', errorText)
        let errorData = {}
        try {
          errorData = JSON.parse(errorText)
        } catch {}
        throw new Error(errorData.error || `推理请求失败: ${inferenceRes.status}`)
      }

      const result = await inferenceRes.json()

      const convertedResult: any = {
        results: result.results || [],
        processing_time: result.processing_time || 0,
        total_detections: result.total_detections || 0,
        anomaly_count: result.anomaly_count || 0
      }

      if (result.workpieces && Array.isArray(result.workpieces)) {
        convertedResult.workpieces = result.workpieces
        convertedResult.total_workpieces = result.total_workpieces || result.workpieces.length
        convertedResult.total_rois_all = result.total_rois_all || 0
        convertedResult.multi_workpiece = result.multi_workpiece || true
      }

      return {
        status: 'success',
        result: convertedResult
      }
    } catch (err: any) {
      throw createError({
        statusCode: err.statusCode || 500,
        message: err.message || '推理失败'
      })
    }
  }

  if (eventPath === '/api/deploy/http/services' && method === 'GET') {
    const query = getQuery(event)
    const projectId = query.project_id as string
    const includeHealth = query.include_health === 'true'

    let servicesUrl = `${pythonApiBase}/deploy/http/services`
    const params = []
    if (projectId) params.push(`project_id=${projectId}`)
    if (includeHealth) params.push('include_health=true')
    if (params.length > 0) servicesUrl += '?' + params.join('&')

    try {
      const httpRes = await fetch(servicesUrl)
      if (!httpRes.ok) {
        throw new Error(`后端服务返回 ${httpRes.status}`)
      }

      const httpData = await httpRes.json()

      const httpServices = httpData.services || []
      const processedServices = httpServices.map((svc: any) => {
        let serviceStatus = 'running'

        if (svc.health) {
          if (!svc.health.healthy) {
            if (!svc.health.process_alive) {
              serviceStatus = 'stopped'
            } else if (!svc.health.port_listening) {
              serviceStatus = 'starting'
            } else if (!svc.health.service_responsive) {
              serviceStatus = 'unhealthy'
            }
          }
        }

        let serviceUrl = svc.inference_url || svc.http_url || `http://localhost:${svc.port}`
        serviceUrl = serviceUrl.replace('0.0.0.0', 'localhost')

        const processedService = {
          ...svc,
          status: serviceStatus,
          inference_url: serviceUrl,
          created_at: svc.created_at ? new Date(svc.created_at * 1000).toISOString() : new Date().toISOString()
        }

        runningServices.set(svc.service_id, {
          service_id: svc.service_id,
          task_uuid: svc.task_uuid || '',
          project_id: svc.project_id || '',
          port: svc.port || 0,
          status: serviceStatus,
          inference_url: serviceUrl,
          labels: svc.labels || [],
          model_count: svc.model_count || 1,
          created_at: processedService.created_at,
          model_paths: {},
          service_type: 'http',
          device: svc.device,
        })

        return processedService
      })

      return {
        ...httpData,
        services: processedServices
      }
    } catch (err: any) {
      console.warn('Failed to fetch HTTP services:', err.message)
      throw createError({
        statusCode: 500,
        message: `获取服务列表失败：${err.message}`
      })
    }
  }

  if (eventPath === '/api/deploy/onnx/convert' && method === 'POST') {
    try {
      const body = await readBody(event)
      const { project_id, task_uuid, label } = body

      if (!project_id || !task_uuid || !label) {
        throw createError({
          statusCode: 400,
          message: '缺少必要参数'
        })
      }

      const conversionKey = `${task_uuid}_${label}`

      if (onnxConversions.has(conversionKey)) {
        const existing = onnxConversions.get(conversionKey)
        if (existing?.status === 'completed') {
          return {
            status: 'success',
            message: '模型已转换',
            result: existing
          }
        }
      }

      onnxConversions.set(conversionKey, {
        task_uuid,
        label,
        onnx_path: '',
        config_path: '',
        converted_at: new Date().toISOString(),
        status: 'converting',
        message: '正在转换...'
      })

      try {
        const convertRes = await fetch(
          `${pythonApiBase}/convert/onnx/convert/${project_id}/${task_uuid}/${label}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }
        )

        if (!convertRes.ok) {
          const errData = await convertRes.json().catch(() => ({}))
          throw new Error(errData.detail || '转换失败')
        }

        const convertData = await convertRes.json()

        if (convertData.success) {
          const projectRoot = getProjectRoot()
          let onnxPath = convertData.onnx_path || `${task_uuid}/${label}/best_model/model.onnx`
          if (!onnxPath.startsWith('output/')) {
            onnxPath = `output/${project_id}/${onnxPath}`
          }

          const fullOnnxPath = path.join(projectRoot, onnxPath)
          const configPath = path.join(path.dirname(fullOnnxPath), 'inference_config.yaml')

          onnxConversions.set(conversionKey, {
            task_uuid,
            label,
            onnx_path: onnxPath,
            config_path: fs.existsSync(configPath) ? configPath : '',
            converted_at: new Date().toISOString(),
            status: 'completed',
            message: '转换成功'
          })

          return {
            status: 'success',
            message: '转换成功',
            result: onnxConversions.get(conversionKey)
          }
        } else {
          throw new Error(convertData.error || '转换失败')
        }
      } catch (convertErr: any) {
        onnxConversions.set(conversionKey, {
          task_uuid,
          label,
          onnx_path: '',
          config_path: '',
          converted_at: new Date().toISOString(),
          status: 'error',
          message: convertErr.message || '转换失败'
        })
        throw createError({
          statusCode: 500,
          message: convertErr.message || '转换失败'
        })
      }
    } catch (err: any) {
      throw createError({
        statusCode: err.statusCode || 500,
        message: err.message || '转换请求失败'
      })
    }
  }

  if (eventPath === '/api/deploy/onnx/status' && method === 'GET') {
    const query = getQuery(event)
    const taskUuid = query.task_uuid as string
    const label = query.label as string

    if (!taskUuid || !label) {
      throw createError({
        statusCode: 400,
        message: '缺少必要参数'
      })
    }

    const conversionKey = `${taskUuid}_${label}`
    const result = onnxConversions.get(conversionKey)

    if (!result) {
      return {
        status: 'not_found',
        message: '未找到转换记录'
      }
    }

    return {
      status: 'success',
      result
    }
  }

  if (eventPath === '/api/deploy/onnx/list' && method === 'GET') {
    const query = getQuery(event)
    const taskUuid = query.task_uuid as string

    let conversions = Array.from(onnxConversions.values())

    if (taskUuid) {
      conversions = conversions.filter(c => c.task_uuid === taskUuid)
    }

    return {
      status: 'success',
      conversions
    }
  }

  if (eventPath.startsWith('/api/deploy/') && method === 'DELETE') {
    const serviceId = eventPath.split('/api/deploy/')[1]

    try {
      const deleteRes = await fetch(`${pythonApiBase}/deploy/http/service/${serviceId}`, {
        method: 'DELETE'
      })

      const deleteData = await deleteRes.json()

      if (!deleteRes.ok || !deleteData.success) {
        console.warn(`删除服务失败: ${deleteData.message || '未知错误'}`)
      }
    } catch (deleteErr: any) {
      console.warn(`删除服务请求失败: ${deleteErr.message}`)
    }

    runningServices.delete(serviceId)

    return {
      status: 'success',
      message: '服务已删除'
    }
  }

  if (eventPath.startsWith('/api/deploy/http/service/') && eventPath.endsWith('/health') && method === 'GET') {
    const pathParts = eventPath.split('/')
    const serviceId = pathParts[pathParts.length - 2]

    try {
      const healthRes = await fetch(`${pythonApiBase}/deploy/http/service/${serviceId}/health`)
      if (!healthRes.ok) {
        throw new Error(`后端服务返回 ${healthRes.status}`)
      }
      const healthData = await healthRes.json()

      const service = runningServices.get(serviceId)
      if (service && healthData.health) {
        let newStatus = 'running'
        if (!healthData.health.healthy) {
          if (!healthData.health.process_alive) {
            newStatus = 'stopped'
          } else if (!healthData.health.port_listening) {
            newStatus = 'starting'
          } else if (!healthData.health.service_responsive) {
            newStatus = 'unhealthy'
          }
        }
        service.status = newStatus
        runningServices.set(serviceId, service)
      }

      return healthData
    } catch (err: any) {
      console.warn(`Failed to fetch health for service ${serviceId}:`, err.message)
      throw createError({
        statusCode: 500,
        message: `获取服务健康状态失败：${err.message}`
      })
    }
  }

  if (eventPath.startsWith('/api/deploy/http/service/') && eventPath.endsWith('/logs') && method === 'GET') {
    const pathParts = eventPath.split('/')
    const serviceId = pathParts[pathParts.length - 2]
    const query = getQuery(event)
    const lines = query.lines || '100'
    const fromLine = query.from_line || '-1'
    try {
      const logsRes = await fetch(`${pythonApiBase}/deploy/http/service/${serviceId}/logs?lines=${lines}&from_line=${fromLine}`)

      if (!logsRes.ok) {
        throw new Error(`后端服务返回 ${logsRes.status}`)
      }
      const logsData = await logsRes.json()
      return logsData
    } catch (err: any) {
      console.warn(`Failed to fetch logs for service ${serviceId}:`, err.message)
      throw createError({
        statusCode: 500,
        message: `获取服务日志失败：${err.message}`
      })
    }
  }

  throw createError({
    statusCode: 404,
    message: '未找到接口'
  })
})
