import { defineEventHandler, getQuery, createError, readBody } from 'h3'
import { MockInferenceServer } from '../../utils/mock-inference-server'

const pythonApiBase = process.env.PYTHON_PUBLIC_API_BASE || 'http://localhost:8000'

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
const runningServers: Map<string, MockInferenceServer> = new Map()
const convertProgress: Map<string, ConvertProgress> = new Map()

function getAvailablePort(): number {
  return Math.floor(Math.random() * (10000 - 8000 + 1)) + 8000
}

export default defineEventHandler(async (event) => {
  const path = event.path
  const method = event.method

  if (path === '/api/deploy/list' && method === 'GET') {
    return {
      services: Array.from(runningServices.values())
    }
  }

  if (path === '/api/deploy/progress' && method === 'GET') {
    const query = getQuery(event)
    const taskUuid = query.task_uuid as string
    if (taskUuid && convertProgress.has(taskUuid)) {
      return convertProgress.get(taskUuid)
    }
    return null
  }

  if (path.startsWith('/api/deploy/models/') && method === 'GET') {
    const projectId = path.split('/api/deploy/models/')[1]
    
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
        modelInfo.labels.push(model.label)
        modelInfo.model_paths[model.label] = model.best_model_path || ''
      }

      for (const [taskUuid, modelInfo] of modelMap) {
        const onnxStatus: Record<string, boolean> = {}
        for (const label of modelInfo.labels) {
          try {
            const checkRes = await fetch(
              `${pythonApiBase}/convert/onnx/model/${projectId}/${taskUuid}/${label}`
            )
            if (checkRes.ok) {
              const checkData = await checkRes.json()
              onnxStatus[label] = checkData.has_onnx || false
            } else {
              onnxStatus[label] = false
            }
          } catch {
            onnxStatus[label] = false
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

  if (path === '/api/deploy/start' && method === 'POST') {
    const taskUuid = 'pending'
    
    convertProgress.set(taskUuid, {
      currentStep: 0,
      totalSteps: 0,
      stepName: '检查模型状态',
      status: 'pending',
      message: '正在检查模型状态...',
      convertedLabels: []
    })

    try {
      const body = await readBody(event)
      const { project_id, task_uuid, labels } = body

      if (!project_id || !task_uuid) {
        convertProgress.delete(task_uuid)
        throw createError({
          statusCode: 400,
          message: '缺少必要参数 project_id 或 task_uuid'
        })
      }

      const labelsToProcess = labels || []
      const totalLabels = labelsToProcess.length
      const totalSteps = totalLabels + 1

      const labelsToConvert: string[] = []
      let onnxAvailable = true

      for (const label of labelsToProcess) {
        try {
          const checkRes = await fetch(
            `${pythonApiBase}/convert/onnx/model/${project_id}/${task_uuid}/${label}`
          )
          if (checkRes.ok) {
            const checkData = await checkRes.json()
            if (!checkData.has_onnx) {
              labelsToConvert.push(label)
              onnxAvailable = false
            }
          } else {
            labelsToConvert.push(label)
            onnxAvailable = false
          }
        } catch {
          labelsToConvert.push(label)
          onnxAvailable = false
        }
      }

      convertProgress.set(task_uuid, {
        currentStep: 1,
        totalSteps,
        stepName: '检查完成',
        status: onnxAvailable ? 'completed' : 'converting',
        message: onnxAvailable ? '所有模型已转换为 ONNX' : `需要转换 ${labelsToConvert.length} 个模型`,
        convertedLabels: onnxAvailable ? labelsToProcess : []
      })

      for (let i = 0; i < labelsToConvert.length; i++) {
        const label = labelsToConvert[i]
        
        convertProgress.set(task_uuid, {
          currentStep: i + 2,
          totalSteps,
          stepName: `转换模型: ${label}`,
          status: 'converting',
          message: `正在将模型 "${label}" 转换为 ONNX 格式...`,
          convertedLabels: labelsToProcess.slice(0, i)
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
          
          if (!convertData.success) {
            throw new Error(convertData.error || '转换失败')
          }

          convertProgress.set(task_uuid, {
            currentStep: i + 2,
            totalSteps,
            stepName: `转换完成: ${label}`,
            status: 'converting',
            message: `模型 "${label}" 转换成功`,
            convertedLabels: labelsToProcess.slice(0, i + 1)
          })
        } catch (convertErr: any) {
          convertProgress.set(task_uuid, {
            currentStep: i + 2,
            totalSteps,
            stepName: `转换失败: ${label}`,
            status: 'error',
            message: `模型 "${label}" 转换失败: ${convertErr.message}`,
            convertedLabels: labelsToProcess.slice(0, i),
            failedLabel: label
          })
          throw createError({
            statusCode: 400,
            message: `模型 "${label}" 转换失败: ${convertErr.message}`
          })
        }
      }

      convertProgress.set(task_uuid, {
        currentStep: totalSteps,
        totalSteps,
        stepName: '启动服务',
        status: 'completed',
        message: '所有模型转换完成，正在启动服务...',
        convertedLabels: labelsToProcess
      })

      const serviceId = `svc_${Date.now()}_${task_uuid.slice(0, 8)}`
      const port = getAvailablePort()

      // 启动模拟推理服务器
      const server = new MockInferenceServer(port, labelsToProcess)
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
        created_at: new Date().toISOString()
      }

      runningServices.set(serviceId, service)

      convertProgress.set(task_uuid, {
        currentStep: totalSteps,
        totalSteps,
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
    } catch (err: any) {
      throw createError({
        statusCode: err.statusCode || 500,
        message: err.message || '启动服务失败'
      })
    }
  }

  if (path.startsWith('/api/deploy/stop/') && method === 'POST') {
    const serviceId = path.split('/api/deploy/stop/')[1]
    
    const service = runningServices.get(serviceId)
    if (!service) {
      throw createError({
        statusCode: 404,
        message: '服务不存在'
      })
    }

    // 停止推理服务器
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

  if (path === '/api/deploy/inference' && method === 'POST') {
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
        throw new Error(`推理请求失败: ${inferenceRes.status}`)
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

  if (path === '/api/deploy/inference-services' && method === 'GET') {
    return {
      services: Array.from(runningServices.values()).filter(s => s.status === 'running')
    }
  }

  if (path.startsWith('/api/deploy/') && method === 'DELETE') {
    const serviceId = path.split('/api/deploy/')[1]
    
    const service = runningServices.get(serviceId)
    if (!service) {
      throw createError({
        statusCode: 404,
        message: '服务不存在'
      })
    }

    // 停止推理服务器
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
