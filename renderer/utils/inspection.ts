/**
 * 共享的拍照/推理/解析工具函数
 * 供 index.vue（单品模式）和 useWorkflowExecutor（工作流模式）共用
 */

export interface DetectionResult {
  label: string
  score: number
  bbox: [number, number, number, number]
  segmentation?: number[]
  isAnomaly: boolean
  visible: boolean
  pos_id?: string
  workpiece_id?: number | string
  workpiece_key?: string
  anomaly_type?: string
  category?: string
  modelIsAnomaly?: boolean
  // 工作流扩展字段
  workflowStepIndex?: number
  workflowStepName?: string
}

export interface InferenceService {
  service_id: string
  task_uuid?: string
  inference_url?: string
  status?: string
  project_id?: string
}

/**
 * 从 cameraServiceUrl 构建后端 API 地址
 */
export function getBackendUrl(cameraServiceUrl: string, path: string): string {
  const base = cameraServiceUrl.endsWith('/') ? cameraServiceUrl.slice(0, -1) : cameraServiceUrl
  return `${base}${path}`
}

/**
 * 将推理服务 URL 中的 localhost 替换为实际后端地址
 */
export function resolveInferenceUrl(inferenceUrl: string, cameraServiceUrl: string): string {
  let url = inferenceUrl.replace('0.0.0.0', 'localhost')
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const base = cameraServiceUrl.endsWith('/') ? cameraServiceUrl.slice(0, -1) : cameraServiceUrl
    if (base) {
      try {
        const urlObj = new URL(base)
        url = url.replace('localhost', urlObj.hostname).replace('127.0.0.1', urlObj.hostname)
      } catch { /* ignore */ }
    }
  }
  return url
}

/**
 * 获取指定产品的可用推理服务列表
 */
export async function fetchInferenceServices(
  cameraServiceUrl: string,
  productId?: string
): Promise<InferenceService[]> {
  try {
    const projectId = productId || ''
    const url = projectId
      ? getBackendUrl(cameraServiceUrl, `/deploy/http/services?project_id=${projectId}&include_health=true`)
      : getBackendUrl(cameraServiceUrl, '/deploy/http/services?include_health=true')
    const res = await fetch(url)
    const data = await res.json()
    return (data.services || []).filter((s: any) => s.status === 'running')
  } catch (err) {
    console.error('Failed to fetch inference services:', err)
    return []
  }
}

/**
 * 解析推理结果 JSON，归一化为统一的 DetectionResult 数组
 */
export function parseInferenceResult(rawData: any): DetectionResult[] {
  const result = rawData.status === 'success' && rawData.result ? rawData.result : rawData
  let allResults: any[] = []

  if (result.workpiece_results && Array.isArray(result.workpiece_results)) {
    allResults = result.workpiece_results.flatMap((wp: any, idx: number) =>
      (wp.results || []).map((r: any) => ({
        ...r,
        workpiece_id: wp.workpiece_id || idx,
        workpiece_key: wp.workpiece_key || `wp${idx}`
      }))
    )
  } else if (result.workpieces && Array.isArray(result.workpieces)) {
    allResults = result.workpieces.flatMap((wp: any, idx: number) =>
      (wp.results || []).map((r: any) => ({
        ...r,
        workpiece_id: wp.workpiece_id || idx,
        workpiece_key: wp.workpiece_key || `wp${idx}`
      }))
    )
  } else if (result.results && Array.isArray(result.results)) {
    allResults = result.results
  } else if (result.detections && Array.isArray(result.detections)) {
    allResults = result.detections
  }

  if (allResults.length > 0) {
    return allResults.map((r: any) => ({
      label: r.category || r.label || '未知',
      score: (r.anomaly_score || r.score || 0) * 100,
      bbox: r.bbox_clipped || r.bbox_in_pred || r.bbox || r.box || [0, 0, 0, 0],
      segmentation: r.segmentation_in_pred || r.segmentation || [],
      isAnomaly: r.is_anomaly || r.anomaly === true || false,
      visible: true,
      pos_id: r.pos_id,
      workpiece_id: r.workpiece_id,
      workpiece_key: r.workpiece_key,
      anomaly_type: r.anomaly_type || (r.is_anomaly ? 'anomaly' : 'normal'),
      category: r.category,
      modelIsAnomaly: r.is_anomaly || r.anomaly === true || false
    }))
  }

  return []
}

/**
 * 发送推理请求到指定的推理服务
 *
 * @param dataUrl - base64 图像数据
 * @param inferenceUrl - 推理服务的 /predict 地址
 * @param serviceId - 服务 ID
 * @param signal - 可选的 AbortSignal
 * @returns 原始响应 JSON
 */
export async function postInference(
  dataUrl: string,
  inferenceUrl: string,
  serviceId: string,
  signal?: AbortSignal
): Promise<any> {
  const blob = await fetch(dataUrl, signal ? { signal } : undefined).then(r => r.blob())
  const formData = new FormData()
  formData.append('service_id', serviceId)
  formData.append('file', blob, 'capture.jpg')

  const res = await fetch(`${inferenceUrl}/predict`, {
    method: 'POST',
    body: formData,
    signal
  })

  return await res.json()
}

/**
 * 通过网络相机拍照（通过 Electron IPC）
 *
 * @param cameraName - 相机名称
 * @param cameraConfig - 相机配置（含 IP、供应商等）
 * @param params - 曝光/增益/偏移等参数
 * @returns 成功时返回 base64 data URL，失败返回 null
 */
export async function captureFromNetworkCamera(
  cameraName: string,
  cameraConfig: any,
  params?: {
    exposureTime?: number
    gain?: number
    offsetX?: number
    offsetY?: number
    width?: number
    height?: number
    vendor?: string
    ipAddress?: string
  }
): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  const api = (window as any).electronAPI
  if (!api?.captureFromCamera) {
    return { success: false, error: 'electronAPI 不可用' }
  }

  // 更新相机参数
  if (api.updateCameraParameters && params) {
    await api.updateCameraParameters(cameraName, {
      exposureTime: params.exposureTime,
      gain: params.gain,
      offsetX: params.offsetX,
      offsetY: params.offsetY
    })
  }

  const result = await api.captureFromCamera(cameraName)

  if (result.success && result.data) {
    const base64Data = result.data.image_base64 || result.data.base64 || result.data.image || result.data
    if (base64Data) {
      const dataUrl = typeof base64Data === 'string'
        ? `data:image/jpeg;base64,${base64Data}`
        : `data:image/jpeg;base64,${base64Data}`
      return { success: true, dataUrl }
    }
  }

  return { success: false, error: result.error || result.message || '拍照失败' }
}

/**
 * 通过 USB 相机拍照（使用 MediaDevices API）
 *
 * @param deviceId - 可选的设备 ID
 * @param exposureValue - 曝光值 (0-200)
 * @param gainValue - 增益值 (0-1957)
 * @returns 成功时返回 base64 data URL
 */
export async function captureFromUsbCamera(
  deviceId?: string,
  exposureValue: number = 117,
  gainValue: number = 1
): Promise<string> {
  const constraints: MediaStreamConstraints = {
    video: {
      ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      exposureMode: 'manual'
    } as MediaTrackConstraints
  }

  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  try {
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities()
      const settings: any = {}

      if (capabilities.exposureTime) {
        const min = capabilities.exposureTime.min || 100
        const max = capabilities.exposureTime.max || 10000
        settings.exposureTime = min + (exposureValue / 200) * (max - min)
      } else if (capabilities.exposureCompensation) {
        const min = capabilities.exposureCompensation.min || -2
        const max = capabilities.exposureCompensation.max || 2
        settings.exposureCompensation = min + (exposureValue / 200) * (max - min)
      }

      if (capabilities.iso) {
        const min = capabilities.iso.min || 100
        const max = capabilities.iso.max || 6400
        settings.iso = Math.round(min + (gainValue / 1957) * (max - min))
      } else if (capabilities.brightness) {
        const min = capabilities.brightness.min || 0
        const max = capabilities.brightness.max || 255
        settings.brightness = min + (gainValue / 1957) * (max - min)
      }

      if (Object.keys(settings).length > 0) {
        await videoTrack.applyConstraints({ advanced: [settings] })
      }

      await new Promise(resolve => setTimeout(resolve, 300))
    }

    const video = document.createElement('video')
    video.srcObject = stream
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play()
        resolve(true)
      }
    })

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }

    return canvas.toDataURL('image/jpeg')
  } finally {
    stream.getTracks().forEach(track => track.stop())
  }
}

/**
 * 保存拍照图片到产品目录（通过 Electron IPC）
 */
export async function saveCaptureImage(
  productId: string,
  dataUrl: string,
  fileName?: string
): Promise<string> {
  const api = (window as any).electronAPI
  if (!api?.saveImage) {
    throw new Error('electronAPI.saveImage 不可用')
  }
  const name = fileName || `capture_${Date.now()}.jpg`
  return await api.saveImage({ productId, fileName: name, dataUrl })
}
