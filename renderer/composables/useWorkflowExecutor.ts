/**
 * 工作流执行编排器
 *
 * 顺序执行多步骤检测工作流：连接相机 → 拍照 → 推理 → 保存结果 → 下一步
 * 提供响应式状态供 UI 组件订阅
 */

import { ref, reactive, computed, toRefs } from 'vue'
import {
  type DetectionResult,
  type InferenceService,
  getBackendUrl,
  resolveInferenceUrl,
  fetchInferenceServices,
  parseInferenceResult,
  postInference,
  captureFromNetworkCamera,
  captureFromUsbCamera
} from '../utils/inspection'

export interface WorkflowStepData {
  id?: string
  orderIndex: number
  cameraId: string | null
  productId: string | null
  timeoutMs?: number
  camera?: any
  product?: any
}

export interface WorkflowData {
  id?: string
  name: string
  description?: string
  steps: WorkflowStepData[]
}

export interface StepResult {
  stepIndex: number
  stepId?: string
  cameraId?: string
  productId?: string
  status: 'pending' | 'capturing' | 'inferring' | 'completed' | 'failed'
  imagePath?: string
  dataUrl?: string
  detections: DetectionResult[]
  isAnomaly: boolean
  anomalyCount: number
  errorMessage?: string
  duration?: number
  /** 推理服务未启动/不可用，跳过推理 */
  inferenceSkipped?: boolean
}

export function useWorkflowExecutor() {
  const isExecuting = ref(false)
  const currentStepIndex = ref(-1)
  // 使用 reactive 对象而非 ref(Map)，确保 .set() 等变更能被 Vue 跟踪
  const stepStatuses = reactive<Record<number, string>>({})
  const stepResults = ref<StepResult[]>([])
  const currentExecutionId = ref<string | null>(null)
  const abortController = ref<AbortController | null>(null)

  // 相机服务 URL（后端地址）
  const cameraServiceUrl = ref('')

  // 汇总计算
  const overallAnomaly = computed(() =>
    stepResults.value.some(r => r.isAnomaly)
  )
  const totalAnomalyCount = computed(() =>
    stepResults.value.reduce((sum, r) => sum + r.anomalyCount, 0)
  )
  const completedSteps = computed(() =>
    stepResults.value.filter(r => r.status === 'completed').length
  )
  const failedSteps = computed(() =>
    stepResults.value.filter(r => r.status === 'failed').length
  )

  /**
   * 加载后端 URL
   */
  async function loadCameraServiceUrl() {
    const api = (window as any).electronAPI
    if (api?.getSettings) {
      try {
        const settings = await api.getSettings()
        cameraServiceUrl.value = settings?.backendUrl || 'http://localhost:8000'
      } catch {
        cameraServiceUrl.value = 'http://localhost:8000'
      }
    }
  }

  /**
   * 确保网络相机已连接（最多重试3次）
   */
  async function ensureCameraConnected(camera: any, maxRetries: number = 3): Promise<boolean> {
    if (!camera.isNetworkCamera) return true
    if (camera.status === 'online') return true

    const api = (window as any).electronAPI
    if (!api?.connectCamera) return false

    const config = camera.config ? JSON.parse(camera.config) : {}
    const connectionParams = {
      ipAddress: camera.ip || config.ipAddress,
      vendor: config.vendor || 'Basler',
      exposureTime: 6084,
      gain: 1.2,
      width: config.width,
      height: config.height
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[Workflow] 相机 "${camera.name}" 连接尝试 ${attempt}/${maxRetries}`)
      try {
        const result = await api.connectCamera(camera.name, connectionParams)
        if (result?.success === true) {
          console.log(`[Workflow] 相机 "${camera.name}" 连接成功 (尝试 ${attempt})`)
          // 刷新相机列表以更新状态
          if (api.getCameras) {
            const cameras = await api.getCameras()
            const updated = cameras.find((c: any) => c.id === camera.id)
            if (updated) Object.assign(camera, updated)
          }
          return true
        }
        console.warn(`[Workflow] 相机 "${camera.name}" 连接失败 (尝试 ${attempt}): ${result?.error || '未知错误'}`)
      } catch (err: any) {
        console.warn(`[Workflow] 相机 "${camera.name}" 连接异常 (尝试 ${attempt}): ${err.message}`)
      }
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }
    return false
  }

  /**
   * 获取相机列表（用于解析步骤中的相机信息）
   */
  async function loadCameras(): Promise<any[]> {
    const api = (window as any).electronAPI
    if (api?.getCameras) {
      return await api.getCameras()
    }
    return []
  }

  /**
   * 获取产品列表（用于解析步骤中的产品信息）
   */
  async function loadProducts(): Promise<any[]> {
    const api = (window as any).electronAPI
    if (api?.getProducts) {
      return await api.getProducts()
    }
    return []
  }

  /**
   * 自动为产品启动推理服务
   * 获取产品的最新模型并调用后端部署
   */
  async function autoStartServiceForProduct(productId: string): Promise<boolean> {
    try {
      // 1. 获取产品的可部署模型
      const modelsUrl = `${cameraServiceUrl.value}/project/${productId}/models`
      const modelsRes = await fetch(modelsUrl)
      if (!modelsRes.ok) {
        console.warn(`[Workflow] 获取产品 ${productId} 模型列表失败: HTTP ${modelsRes.status}`)
        return false
      }
      const modelsData = await modelsRes.json()
      const models = modelsData.models || []
      if (models.length === 0) {
        console.warn(`[Workflow] 产品 ${productId} 没有可部署的模型`)
        return false
      }

      // 2. 选择最新模型（按 created_at 排序）
      const sortedModels = [...models].sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeB - timeA
      })
      const latestModel = sortedModels[0]
      const labels = latestModel.labels || []

      // 3. 启动服务
      console.log(`[Workflow] 正在为产品 ${productId} 启动推理服务 (task_uuid: ${latestModel.task_uuid})`)
      const deployUrl = `${cameraServiceUrl.value}/deploy/http`
      const deployRes = await fetch(deployUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: productId,
          task_uuid: latestModel.task_uuid,
          labels,
          device: 'GPU'
        })
      })
      const deployData = await deployRes.json()
      if (deployData.success) {
        console.log(`[Workflow] 推理服务启动请求成功 (port: ${deployData.port})`)
        return true
      } else {
        console.warn(`[Workflow] 推理服务启动失败: ${deployData.message || '未知错误'}`)
        return false
      }
    } catch (err: any) {
      console.error(`[Workflow] 自动启动推理服务异常: ${err.message}`)
      return false
    }
  }

  /**
   * 等待产品推理服务就绪（轮询最多15秒，必须通过 /health 验证）
   */
  async function waitForServiceReady(productId: string): Promise<InferenceService[]> {
    const maxWaitMs = 15000
    const pollIntervalMs = 2000
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitMs) {
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
      const services = await fetchInferenceServices(cameraServiceUrl.value, productId)
      if (services.length > 0) {
        // 对每个服务调用 /health 端点确认模型已加载
        for (const svc of services) {
          try {
            const healthUrl = resolveInferenceUrl(svc.inference_url || '', cameraServiceUrl.value)
            const healthRes = await fetch(`${healthUrl}/health`, { signal: AbortSignal.timeout(5000) })
            if (healthRes.ok) {
              const healthData = await healthRes.json()
              if (healthData.status === 'healthy' && (healthData.loaded_models?.length > 0 || healthData.total_models > 0)) {
                console.log(`[Workflow] 产品 ${productId} 推理服务已就绪 (models: ${healthData.loaded_models?.join(',') || healthData.total_models})`)
                return services
              }
              console.log(`[Workflow] 服务 /health 返回但模型未就绪: loaded_models=${healthData.loaded_models?.length || 0}`)
            }
          } catch {
            // /health 不可达，继续等待
          }
        }
        console.log(`[Workflow] 服务存在但 /health 未就绪，继续等待...`)
      }
      console.log(`[Workflow] 等待产品 ${productId} 推理服务就绪... (${Math.round((Date.now() - startTime) / 1000)}s)`)
    }
    console.warn(`[Workflow] 产品 ${productId} 推理服务等待超时`)
    return []
  }

  /**
   * 工作流执行前预检：检查后端和相机状态
   * 返回包含警告信息的对象
   */
  async function preflightCheck(enrichedSteps: WorkflowStepData[]): Promise<{
    cameraStatuses: Map<number, { ok: boolean; message: string }>
    warnings: string[]
  }> {
    const warnings: string[] = []
    const cameraStatuses = new Map<number, { ok: boolean; message: string }>()

    // 1. 检查每个步骤的相机状态
    for (let i = 0; i < enrichedSteps.length; i++) {
      const step = enrichedSteps[i]
      const camera = step.camera
      if (!camera) {
        cameraStatuses.set(i, { ok: false, message: '未绑定相机' })
        warnings.push(`步骤 ${i + 1}: 未绑定相机`)
        continue
      }

      if (camera.isNetworkCamera) {
        stepStatuses[i] = 'capturing'  // 显示预检状态
        if (camera.status === 'online') {
          cameraStatuses.set(i, { ok: true, message: '相机在线' })
        } else {
          console.log(`[Workflow] 预检: 步骤 ${i + 1} 相机 "${camera.name}" 离线，尝试连接...`)
          const connected = await ensureCameraConnected(camera, 1) // 预检只尝试1次
          if (connected) {
            cameraStatuses.set(i, { ok: true, message: '相机连接成功' })
          } else {
            cameraStatuses.set(i, { ok: false, message: '相机连接失败' })
            warnings.push(`步骤 ${i + 1}: 相机 "${camera.name}" 连接失败`)
          }
        }
      } else {
        // USB 相机
        cameraStatuses.set(i, { ok: true, message: 'USB相机就绪' })
      }
    }

    return { cameraStatuses, warnings }
  }

  /**
   * 执行单个步骤：拍照 + 推理
   */
  async function executeStep(
    step: WorkflowStepData,
    stepIndex: number
  ): Promise<StepResult> {
    const api = (window as any).electronAPI
    const result: StepResult = {
      stepIndex,
      stepId: step.id,
      cameraId: step.cameraId || undefined,
      productId: step.productId || undefined,
      status: 'pending',
      detections: [],
      isAnomaly: false,
      anomalyCount: 0
    }

    const startTime = Date.now()

    // --- 1. 拍照 ---
    stepStatuses[stepIndex] = 'capturing'
    currentStepIndex.value = stepIndex

    try {
      const camera = step.camera
      if (!camera) {
        throw new Error(`步骤 ${stepIndex + 1}: 未找到相机`)
      }

      // 确保相机已连接
      const connected = await ensureCameraConnected(camera)
      if (!connected) {
        throw new Error(`相机 "${camera.name}" 连接失败`)
      }

      let dataUrl: string

      if (camera.isNetworkCamera) {
        const config = camera.config ? JSON.parse(camera.config) : {}
        const captureResult = await captureFromNetworkCamera(camera.name, config, {
          exposureTime: 6084,
          gain: 1.2,
          vendor: config.vendor || 'Basler',
          ipAddress: camera.ip || config.ipAddress,
          width: config.width,
          height: config.height
        })

        if (!captureResult.success || !captureResult.dataUrl) {
          throw new Error(captureResult.error || '网络相机拍照失败')
        }
        dataUrl = captureResult.dataUrl
      } else {
        // USB 相机
        const config = camera.config ? JSON.parse(camera.config) : {}
        dataUrl = await captureFromUsbCamera(config.deviceId)
      }

      result.dataUrl = dataUrl
      // 工作流拍照仅用于推理，不保存到产品目录（避免替换产品原图）
    } catch (err: any) {
      result.status = 'failed'
      result.errorMessage = err.message || '拍照失败'
      result.duration = Date.now() - startTime
      return result
    }

    // --- 2. 推理 ---
    stepStatuses[stepIndex] = 'inferring'

    try {
      if (!step.productId || !result.dataUrl) {
        // 没有产品，跳过推理
        result.status = 'completed'
        result.inferenceSkipped = true
        result.duration = Date.now() - startTime
        return result
      }

      // 获取推理服务（没找到则自动尝试启动，最多重试3次）
      let services = await fetchInferenceServices(cameraServiceUrl.value, step.productId)
      let autoStartAttempt = 0

      while (services.length === 0 && autoStartAttempt < 3) {
        autoStartAttempt++
        console.log(`[Workflow] 步骤 ${stepIndex + 1}: 产品 ${step.productId} 无可用推理服务，尝试自动启动 (${autoStartAttempt}/3)`)
        const started = await autoStartServiceForProduct(step.productId!)
        if (started) {
          // 等待服务就绪
          services = await waitForServiceReady(step.productId!)
        }
        if (services.length === 0 && autoStartAttempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      if (services.length === 0) {
        // 自动启动失败 — 步骤算完成（拍照成功），但标记推理被跳过
        console.warn(`步骤 ${stepIndex + 1}: 产品 ${step.productId} 推理服务自动启动失败`)
        result.status = 'completed'
        result.inferenceSkipped = true
        result.duration = Date.now() - startTime
        return result
      }

      const service = services[0]
      const inferenceUrl = resolveInferenceUrl(service.inference_url || '', cameraServiceUrl.value)
      const rawData = await postInference(
        result.dataUrl,
        inferenceUrl,
        service.service_id,
        abortController.value?.signal
      )

      const detections = parseInferenceResult(rawData)
      result.detections = detections.map(d => ({
        ...d,
        workflowStepIndex: stepIndex,
        workflowStepName: step.product?.name || `步骤 ${stepIndex + 1}`
      }))
      result.isAnomaly = detections.some(d => d.isAnomaly)
      result.anomalyCount = detections.filter(d => d.isAnomaly).length
      result.status = 'completed'
    } catch (err: any) {
      if (err.name === 'AbortError') {
        result.status = 'failed'
        result.errorMessage = '工作流被中断'
      } else {
        result.status = 'failed'
        result.errorMessage = err.message || '推理失败'
      }
    }

    result.duration = Date.now() - startTime
    return result
  }

  /**
   * 保存步骤结果到数据库
   */
  async function saveStepResultToDb(result: StepResult) {
    const api = (window as any).electronAPI
    if (!api?.saveStepResult || !currentExecutionId.value) return

    try {
      await api.saveStepResult({
        executionId: currentExecutionId.value,
        stepId: result.stepId || '',
        stepOrderIndex: result.stepIndex,
        cameraId: result.cameraId || null,
        productId: result.productId || null,
        status: result.status,
        imagePath: result.imagePath || null,
        inferenceResult: result.detections.length > 0 ? JSON.stringify(result.detections) : null,
        isAnomaly: result.isAnomaly,
        anomalyCount: result.anomalyCount,
        errorMessage: result.errorMessage || null,
        startedAt: new Date(Date.now() - (result.duration || 0)).toISOString(),
        completedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('保存步骤结果失败:', err)
    }
  }

  /**
   * 执行完整工作流
   */
  async function executeWorkflow(workflow: WorkflowData): Promise<{
    success: boolean
    results: StepResult[]
    allDetections: DetectionResult[]
    executionId: string | null
    /** 因推理服务未启动而跳过推理的步骤数 */
    inferenceSkippedCount: number
    /** 预检警告信息 */
    preflightWarnings: string[]
    error?: string
  }> {
    if (isExecuting.value) {
      return { success: false, results: [], allDetections: [], executionId: null, inferenceSkippedCount: 0, preflightWarnings: [], error: '已有工作流正在执行' }
    }

    isExecuting.value = true
    currentStepIndex.value = -1
    // 重置 stepStatuses
    Object.keys(stepStatuses).forEach(k => delete stepStatuses[Number(k)])
    stepResults.value = []
    abortController.value = new AbortController()

    await loadCameraServiceUrl()

    // 预加载相机和产品数据（补充步骤信息）
    const [cameras, products] = await Promise.all([loadCameras(), loadProducts()])

    // 补充步骤的相机和产品详情
    const enrichedSteps = workflow.steps.map(step => ({
      ...step,
      camera: step.camera || cameras.find((c: any) => c.id === step.cameraId),
      product: step.product || products.find((p: any) => p.id === step.productId)
    }))

    // ====== 预检：检查后端和相机状态（仅警告，不阻断执行） ======
    const preflight = await preflightCheck(enrichedSteps)
    // 后端不通也不终止 — 后续步骤会自动尝试启动服务，相机也会自动重连

    // 创建执行记录
    const api = (window as any).electronAPI
    if (api?.createExecution) {
      try {
        const execution = await api.createExecution({ workflowId: workflow.id! })
        currentExecutionId.value = execution.id
      } catch (err) {
        console.error('创建执行记录失败:', err)
      }
    }

    const results: StepResult[] = []
    let stoppedOnError = false

    // 初始化步骤状态
    enrichedSteps.forEach((_, i) => {
      stepStatuses[i] = 'pending'
    })

    // 顺序执行每个步骤（单步失败不中断，继续执行后续步骤）
    for (let i = 0; i < enrichedSteps.length; i++) {
      // 检查是否被中断
      if (abortController.value?.signal.aborted) {
        break
      }

      const step = enrichedSteps[i]
      const result = await executeStep(step, i)
      results.push(result)

      // 保存到数据库
      await saveStepResultToDb(result)

      if (result.status === 'failed') {
        stoppedOnError = true
        // 不再 break — 继续执行后续步骤，让每个步骤都有机会自动连接相机和启动推理服务
      }
    }

    stepResults.value = results

    // 更新执行记录
    if (api?.updateExecution && currentExecutionId.value) {
      try {
        await api.updateExecution({
          id: currentExecutionId.value,
          status: stoppedOnError ? 'failed' : 'completed'
        })
      } catch (err) {
        console.error('更新执行记录失败:', err)
      }
    }

    isExecuting.value = false

    // 汇总所有检测结果
    const allDetections = results.flatMap(r => r.detections)

    // 统计因推理服务未启动而跳过推理的步骤数
    const inferenceSkippedCount = results.filter(r => r.inferenceSkipped === true).length

    // success = 没有步骤失败 && 没有任何步骤检出异常
    const overallSuccess = !stoppedOnError && !results.some(r => r.isAnomaly)

    return {
      success: overallSuccess,
      results,
      allDetections,
      executionId: currentExecutionId.value,
      inferenceSkippedCount,
      preflightWarnings: preflight.warnings
    }
  }

  /**
   * 中断当前执行
   */
  function abort() {
    if (abortController.value) {
      abortController.value.abort()
    }
    isExecuting.value = false
  }

  /**
   * 重置状态
   */
  function reset() {
    isExecuting.value = false
    currentStepIndex.value = -1
    Object.keys(stepStatuses).forEach(k => delete stepStatuses[Number(k)])
    stepResults.value = []
    currentExecutionId.value = null
    abortController.value = null
  }

  return {
    // 状态
    isExecuting,
    currentStepIndex,
    stepStatuses,
    stepResults,
    currentExecutionId,
    // 计算属性
    overallAnomaly,
    totalAnomalyCount,
    completedSteps,
    failedSteps,
    // 方法
    executeWorkflow,
    abort,
    reset,
    loadCameraServiceUrl
  }
}
