import { defineEventHandler, getQuery, createError, readBody } from 'h3'
import { InferenceServer } from '../../utils/inference-server'
import fs from 'fs'
import path from 'path'

const pythonApiBase = process.env.PYTHON_PUBLIC_API_BASE || 'http://localhost:8000'
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

async function resolveModelPath(serverPath: string): Promise<string> {
  if (!serverPath) return ''
  
  if (path.isAbsolute(serverPath) && fs.existsSync(serverPath)) {
    return serverPath
  }
  
  let normalizedPath = serverPath.replace(/^\/+/, '').replace(/\\/g, '/')
  
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
  
  console.log(`[Deploy] resolveModelPath: serverPath=${serverPath}, normalizedPath=${normalizedPath}, localPath=${localPath}, exists=${fs.existsSync(localPath)}`)
  
  const tempDir = path.join(process.cwd(), 'temp_models')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }
  
  const fileName = path.basename(serverPath)
  const tempPath = path.join(tempDir, fileName)
  
  if (!fs.existsSync(tempPath)) {
    try {
      const staticUrl = `${pythonApiBase}/static/${normalizedPath.replace(/ /g, '%20')}`
      console.log(`[Deploy] Trying to download from: ${staticUrl}`)
      
      const response = await fetch(staticUrl)
      if (response.ok) {
        const buffer = await response.arrayBuffer()
        fs.writeFileSync(tempPath, Buffer.from(buffer))
        console.log(`[Deploy] Downloaded model to: ${tempPath}`)
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
  const eventPath = event.path
  const method = event.method

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
        
        if (model.is_unified_structure) {
          modelInfo.labels = model.labels || []
          for (const label of modelInfo.labels) {
            modelInfo.model_paths[label] = model.model_path || ''
          }
        } else {
          modelInfo.labels.push(model.label)
          modelInfo.model_paths[model.label] = model.model_path || ''
        }
      }

      for (const [taskUuid, modelInfo] of modelMap) {
        const onnxStatus: Record<string, boolean> = {}
        const configStatus: Record<string, boolean> = {}
        
        for (const label of modelInfo.labels) {
          try {
            const checkRes = await fetch(
              `${pythonApiBase}/convert/onnx/model/${projectId}/${taskUuid}/${label}`
            )
            if (checkRes.ok) {
              const checkData = await checkRes.json()
              onnxStatus[label] = checkData.has_onnx || false
              
              const projectRoot = getProjectRoot()
              const configPath = path.join(
                projectRoot, 
                'output', 
                projectId, 
                taskUuid, 
                label, 
                'best_model', 
                'inference_config.yaml'
              )
              configStatus[label] = fs.existsSync(configPath)
            } else {
              onnxStatus[label] = false
              configStatus[label] = false
            }
          } catch {
            onnxStatus[label] = false
            configStatus[label] = false
          }
        }
        modelInfo.onnx_status = onnxStatus
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
      const { project_id, task_uuid, labels } = body

      if (!project_id || !task_uuid) {
        throw createError({
          statusCode: 400,
          message: '缺少必要参数 project_id 或 task_uuid'
        })
      }

      const labelsToProcess = labels || []
      
      if (labelsToProcess.length === 0) {
        throw createError({
          statusCode: 400,
          message: '请至少选择一个模型进行部署'
        })
      }

      const modelInfoRes = await fetch(`${pythonApiBase}/project/${project_id}/models`)
      const modelInfoData = await modelInfoRes.json()
      
      const taskModel = modelInfoData.models?.find((m: any) => m.task_uuid === task_uuid)
      if (!taskModel) {
        throw createError({
          statusCode: 404,
          message: '未找到模型信息'
        })
      }

      const modelPaths: Record<string, string> = {}
      const configPaths: Record<string, string> = {}
      const missingConfigs: string[] = []

      for (const label of labelsToProcess) {
        const serverModelPath = taskModel.model_path || ''
        const serverLabelPath = serverModelPath.endsWith('/') ? serverModelPath : serverModelPath + '/'
        
        const onnxPath = await resolveModelPath(serverLabelPath + 'best_model/model.onnx')
        const configPath = await resolveModelPath(serverLabelPath + 'best_model/inference_config.yaml')

        console.log(`[Deploy] Checking ONNX path: ${onnxPath}, exists=${fs.existsSync(onnxPath)}`)

        if (!fs.existsSync(onnxPath)) {
          throw createError({
            statusCode: 400,
            message: `模型 ${label} 的ONNX文件不存在: ${onnxPath}，请先进行转换`
          })
        }

        if (!fs.existsSync(configPath)) {
          missingConfigs.push(label)
        }

        modelPaths[label] = onnxPath
        configPaths[label] = configPath
      }

      if (missingConfigs.length > 0) {
        console.warn(`[Deploy] Missing config files for: ${missingConfigs.join(', ')}`)
      }

      const serviceId = `svc_${Date.now()}_${task_uuid.slice(0, 8)}`
      const port = getAvailablePort()

      const primaryLabel = labelsToProcess[0]
      const primaryModelPath = modelPaths[primaryLabel]
      const primaryConfigPath = configPaths[primaryLabel]

      convertProgress.set(task_uuid, {
        currentStep: 1,
        totalSteps: 2,
        stepName: '正在启动推理服务...',
        status: 'converting',
        message: `正在加载模型: ${primaryLabel}`,
        convertedLabels: []
      })

      try {
        const server = new InferenceServer(port, primaryModelPath, primaryConfigPath, labelsToProcess)
        await server.start()
        runningServers.set(serviceId, server)

        const service: DeployService = {
          service_id: serviceId,
          task_uuid,
          project_id: String(project_id),
          port,
          status: 'running',
          inference_url: `http://localhost:${port}`,
          labels: labelsToProcess,
          model_count: labelsToProcess.length,
          created_at: new Date().toISOString(),
          model_paths: modelPaths
        }

        runningServices.set(serviceId, service)

        convertProgress.set(task_uuid, {
          currentStep: 2,
          totalSteps: 2,
          stepName: '服务已启动',
          status: 'completed',
          message: `服务启动成功，端口: ${port}`,
          convertedLabels: labelsToProcess
        })

        setTimeout(() => {
          convertProgress.delete(task_uuid)
        }, 5000)

        return {
          status: 'success',
          service_id: serviceId,
          port,
          inference_url: service.inference_url,
          labels: labelsToProcess,
          model_count: labelsToProcess.length
        }
      } catch (serverErr: any) {
        convertProgress.set(task_uuid, {
          currentStep: 0,
          totalSteps: 2,
          stepName: '启动失败',
          status: 'error',
          message: serverErr.message || '服务启动失败',
          convertedLabels: []
        })
        throw createError({
          statusCode: 500,
          message: `启动推理服务失败: ${serverErr.message}`
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
    
    const service = runningServices.get(serviceId)
    if (!service) {
      throw createError({
        statusCode: 404,
        message: '服务不存在'
      })
    }

    const server = runningServers.get(serviceId)
    if (server) {
      await server.stop()
      runningServers.delete(serviceId)
    }

    service.status = 'stopped'
    runningServices.delete(serviceId)

    return {
      status: 'success',
      message: '服务已停止'
    }
  }

  if (eventPath === '/api/deploy/inference' && method === 'POST') {
    try {
      const body = await readBody(event)
      const { image, service_id } = body

      if (!image || !service_id) {
        throw createError({
          statusCode: 400,
          message: '缺少必要参数 image 或 service_id'
        })
      }

      const service = runningServices.get(service_id)
      if (!service) {
        throw createError({
          statusCode: 404,
          message: '服务不存在或未启动'
        })
      }

      if (service.status !== 'running') {
        throw createError({
          statusCode: 400,
          message: '服务未在运行'
        })
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')

      const inferenceRes = await fetch(`${service.inference_url}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBuffer.toString('base64')
        })
      })

      if (!inferenceRes.ok) {
        const errorData = await inferenceRes.json().catch(() => ({}))
        throw new Error(errorData.error || `推理请求失败: ${inferenceRes.status}`)
      }

      const result = await inferenceRes.json()
      return {
        status: 'success',
        result
      }
    } catch (err: any) {
      throw createError({
        statusCode: err.statusCode || 500,
        message: err.message || '推理失败'
      })
    }
  }

  if (eventPath === '/api/deploy/inference-services' && method === 'GET') {
    return {
      services: Array.from(runningServices.values()).filter(s => s.status === 'running')
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
    
    const service = runningServices.get(serviceId)
    if (!service) {
      throw createError({
        statusCode: 404,
        message: '服务不存在'
      })
    }

    const server = runningServers.get(serviceId)
    if (server) {
      await server.stop()
      runningServers.delete(serviceId)
    }

    runningServices.delete(serviceId)

    return {
      status: 'success',
      message: '服务已删除'
    }
  }

  throw createError({
    statusCode: 404,
    message: 'API not found'
  })
})
