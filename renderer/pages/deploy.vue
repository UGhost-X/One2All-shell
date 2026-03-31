<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRuntimeConfig } from '#app'
import { Play, Square, Trash2, RefreshCw, Server, Box, Loader2, Zap, FolderOpen, CheckCircle, XCircle, Clock, ImageIcon, BarChart3, FileText, X, Database, Plus, Minus } from 'lucide-vue-next'
import Switch from '@/components/ui/switch/Switch.vue'
import Progress from '@/components/ui/progress/Progress.vue'
import UiButton from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import UiSelect from '@/components/ui/select/Select.vue'
import UiSelectContent from '@/components/ui/select/SelectContent.vue'
import UiSelectItem from '@/components/ui/select/SelectItem.vue'
import UiSelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import UiSelectValue from '@/components/ui/select/SelectValue.vue'

definePageMeta({ keepalive: true })

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const toast = inject<any>('toast')

interface Product {
  id: number
  name: string
  model: string
}

const products = ref<Product[]>([])
const productId = ref<number | null>(null)
const productName = ref('')
const apiBase = ref('')

const loadSettings = async () => {
  if (window.electronAPI) {
    const settings = await window.electronAPI.getSettings()
    if (settings?.backendMode === 'remote' && settings?.backendUrl) {
      const url = new URL(settings.backendUrl)
      apiBase.value = url.hostname
    } else if (settings?.backendIp) {
      apiBase.value = settings.backendIp
    } else {
      apiBase.value = 'localhost'
    }
  } else {
    apiBase.value = 'localhost'
  }
}
loadSettings()

interface DeployableModel {
  task_uuid: string
  labels: string[]
  model_paths: Record<string, string>
  onnx_status?: Record<string, boolean>
  created_at?: string
}

interface ServiceHealth {
  healthy: boolean
  process_alive: boolean
  port_listening: boolean
  service_responsive: boolean
  message: string
}

interface DeployService {
  service_id: string
  task_uuid: string
  project_id: string
  port: number
  status: string
  inference_url?: string
  labels: string[]
  model_count?: number
  created_at?: string
  device?: string
  health?: ServiceHealth
}

const selectedDevice = ref<Record<string, 'GPU' | 'CPU'>>({})
const deviceOpen = ref<Record<string, boolean>>({})

const deployableModels = ref<DeployableModel[]>([])
const services = ref<DeployService[]>([])
const isLoadingModels = ref(false)
const isLoadingServices = ref(false)
const startingUuid = ref<string | null>(null)
const stoppingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const isProductSelectOpen = ref(false)

// 推理测试相关
const inferenceFileInput = ref<HTMLInputElement | null>(null)
const inferenceImageUrl = ref('')
const inferenceFile = ref<File | null>(null)
const inferenceCanvasRef = ref<HTMLCanvasElement | null>(null)
const inferenceCanvasResultRef = ref<HTMLCanvasElement | null>(null)
const selectedInferenceService = ref('')
const isInferring = ref(false)
const inferenceResult = ref<any>(null)
const detectionResults = ref<Array<{ label: string; score: number; bbox: [number, number, number, number]; isAnomaly?: boolean; error?: number; threshold?: number; alignmentStrategy?: string }>>([])
const classificationResults = ref<Array<{ label: string; score: number }>>([])
const inferenceServiceOpen = ref(false)

// 日志查看相关
const showLogModal = ref(false)
const logServiceId = ref('')
const logContent = ref('')
const isLoadingLogs = ref(false)
const logLines = ref('100')
const logLinesOpen = ref(false)

// 服务日志展示相关
const serviceLogs = ref<Record<string, { content: string; loading: boolean; nextLine: number }>>({})
const isLoadingAllLogs = ref(false)
const autoRefreshLogs = ref(true)
const logsRefreshInterval = ref<number | null>(null)
const activeLogPolling = ref<string[]>([])

// 内存库展示相关
interface MemoryBankInfo {
  category: string
  positive_count: number
  negative_count: number
  positive_samples?: string[]
  negative_samples?: string[]
}

interface ServiceMemoryBanks {
  service_id: string
  task_uuid: string
  banks: MemoryBankInfo[]
}

const memoryBanks = ref<ServiceMemoryBanks[]>([])
const isLoadingMemoryBanks = ref(false)
const selectedMemoryBankService = ref<string>('')
const memoryBankModalOpen = ref(false)
const currentMemoryBank = ref<MemoryBankInfo | null>(null)
const currentBankType = ref<'positive' | 'negative'>('positive')

const loadServiceLog = async (serviceId: string, incremental = false) => {
  if (!serviceId) return
  const current = serviceLogs.value[serviceId]
  const currentContent = current?.content || ''

  const fromLine = incremental ? (current?.nextLine || 0) : -1

  if (!incremental) {
    serviceLogs.value[serviceId] = { content: currentContent, loading: true, nextLine: fromLine }
  }

  try {
    const res = await fetch(`/api/deploy/http/service/${serviceId}/logs?lines=${logLines.value}&from_line=${fromLine}`)
    if (res.ok) {
      const data = await res.json()
      const newLogs = data.logs || ''
      const nextLine = data.next_line || 0

      if (incremental) {
        if (newLogs) {
          const separator = currentContent && !currentContent.endsWith('\n') ? '\n' : ''
          serviceLogs.value[serviceId] = {
            content: currentContent + separator + newLogs,
            loading: false,
            nextLine: nextLine
          }
        } else {
          serviceLogs.value[serviceId] = {
            content: currentContent,
            loading: false,
            nextLine: nextLine
          }
        }
      } else {
        serviceLogs.value[serviceId] = {
          content: newLogs,
          loading: false,
          nextLine: nextLine
        }
      }
    } else {
      if (!incremental) {
        serviceLogs.value[serviceId] = { content: t('deploy.loadLogsFailed'), loading: false, nextLine: 0 }
      }
    }
  } catch (err: any) {
    console.error('Failed to load service logs:', err)
    if (!incremental) {
      serviceLogs.value[serviceId] = { content: t('deploy.loadLogsFailed'), loading: false, nextLine: 0 }
    }
  }
}

const loadAllServiceLogs = async (incremental = false) => {
  if (services.value.length === 0) return
  isLoadingAllLogs.value = true
  await Promise.all(services.value.map(s => loadServiceLog(s.service_id, incremental)))
  isLoadingAllLogs.value = false
}

const refreshAllLogs = () => {
  loadAllServiceLogs(false)
}

const startLogsAutoRefresh = () => {
  if (logsRefreshInterval.value) return
  logsRefreshInterval.value = window.setInterval(() => {
    if (activeLogPolling.value.length === 0) {
      stopLogsAutoRefresh()
      return
    }
    const activeServices = [...activeLogPolling.value]
    activeServices.forEach(serviceId => {
      const service = services.value.find(s => s.service_id === serviceId)
      if (service && service.status !== 'stopped') {
        loadServiceLog(serviceId, true)
      } else {
        removeServiceLogPolling(serviceId)
      }
    })
  }, 3000)
}
const addServiceLogPolling = (serviceId: string) => {
  if (!activeLogPolling.value.includes(serviceId)) {
    activeLogPolling.value.push(serviceId)
  }
  if (autoRefreshLogs.value) {
    startLogsAutoRefresh()
  }
}

const removeServiceLogPolling = (serviceId: string) => {
  const index = activeLogPolling.value.indexOf(serviceId)
  if (index > -1) {
    activeLogPolling.value.splice(index, 1)
  }
}

const stopLogsAutoRefresh = () => {
  if (logsRefreshInterval.value) {
    clearInterval(logsRefreshInterval.value)
    logsRefreshInterval.value = null
  }
}

watch(autoRefreshLogs, (enabled) => {
  if (enabled) {
    startLogsAutoRefresh()
  } else {
    stopLogsAutoRefresh()
  }
})

// 在图片上绘制检测框
const drawDetectionBoxes = (imageUrl: string, detections: Array<{ label: string; score: number; bbox: [number, number, number, number]; isAnomaly?: boolean; error?: number; threshold?: number; alignmentStrategy?: string }>) => {
  const drawOnCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      detections.forEach((det, index) => {
        const [x, y, width, height] = det.bbox

        const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
        const color = det.isAnomaly ? '#ef4444' : colors[index % colors.length]

        ctx.strokeStyle = color
        ctx.lineWidth = Math.max(2, img.width / 200)
        ctx.strokeRect(x, y, width, height)

        const anomalyText = det.isAnomaly ? `[${t('deploy.anomaly')}] ` : ''
        const labelText = `${anomalyText}${det.label} ${(det.score).toFixed(1)}%`
        ctx.font = `bold ${Math.max(12, img.width / 50)}px sans-serif`
        const textMetrics = ctx.measureText(labelText)
        const textHeight = Math.max(16, img.width / 40)
        const padding = 4

        ctx.fillStyle = color
        ctx.fillRect(x, y - textHeight - padding * 2, textMetrics.width + padding * 2, textHeight + padding * 2)

        ctx.fillStyle = '#ffffff'
        ctx.fillText(labelText, x + padding, y - padding - 2)
      })
    }
    img.src = imageUrl
  }

  drawOnCanvas(inferenceCanvasRef.value)
  drawOnCanvas(inferenceCanvasResultRef.value)
}

// 运行中的服务（包括启动中、运行中、异常等状态）
const runningServices = computed(() => services.value.filter(s => 
  s.status === 'running' || 
  s.status === 'active' || 
  s.status === 'starting' ||
  s.status === 'unhealthy'
))

const loadProducts = async () => {
  if (window.electronAPI) {
    const list = await window.electronAPI.getProducts()
    products.value = list || []
  }
}

const onProductChange = (id: string) => {
  productId.value = id ? Number(id) : null
  const product = products.value.find(p => p.id === productId.value)
  productName.value = product?.name || ''
  loadDeployableModels()
  loadServices()
  
  if (productId.value) {
    startServicesPolling()
  } else {
    stopServicesPolling()
  }
}

const loadDeployableModels = async () => {
  if (!productId.value) {
    deployableModels.value = []
    return
  }
  isLoadingModels.value = true
  try {
    const url = `/api/deploy/models/${productId.value}`
    const res = await fetch(url)
    const data = await res.json()
    const models = data.models || []
    
    for (const model of models) {
      try {
        const records = await window.electronAPI.getTrainingRecordsByTaskUuid(model.task_uuid)
        if (records && records.length > 0) {
          model.created_at = records[0].createdAt
        }
      } catch (e) {
        console.warn('[Deploy] Failed to get training record for', model.task_uuid, e)
      }
    }
    
    deployableModels.value = models.sort((a: DeployableModel, b: DeployableModel) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
      return timeB - timeA
    })
  } catch (err) {
    console.error('Failed to load deployable models:', err)
    toast?.error(t('deploy.messages.loadModelsFailed'))
  } finally {
    isLoadingModels.value = false
  }
}

const loadServices = async () => {
  if (!productId.value) {
    services.value = []
    return
  }
  isLoadingServices.value = true
  try {
    const res = await fetch(`/api/deploy/http/services?project_id=${productId.value}&include_health=true`)
    const data = await res.json()
    const previousServiceIds = new Set(services.value.map(s => s.service_id))
    // 去重：根据 service_id 去重
    const uniqueServices = (data.services || []).filter((svc: any, index: number, self: any[]) => 
      index === self.findIndex((s) => s.service_id === svc.service_id)
    )
    services.value = uniqueServices
    const currentServiceIds = new Set(services.value.map(s => s.service_id))

    const pollingList = activeLogPolling.value.slice()
    pollingList.forEach((id: string) => {
      const service = services.value.find(s => s.service_id === id)
      if (!service || service.status === 'stopped') {
        removeServiceLogPolling(id)
        delete serviceLogs.value[id]
      }
    })

    await loadAllServiceLogs()
    await loadMemoryBanks()

    // 只将新出现的服务添加到日志轮询
    services.value.forEach(s => {
      if (!previousServiceIds.has(s.service_id)) {
        addServiceLogPolling(s.service_id)
      }
    })
  } catch (err) {
    console.error('Failed to load services:', err)
  } finally {
    isLoadingServices.value = false
  }
}

const loadMemoryBanks = async () => {
  if (services.value.length === 0) {
    memoryBanks.value = []
    return
  }
  isLoadingMemoryBanks.value = true
  try {
    const banks: ServiceMemoryBanks[] = []
    for (const service of services.value) {
      if (service.status !== 'running') continue
      try {
        const res = await fetch(`/api/deploy/http/service/${service.service_id}/memory_banks`)
        if (res.ok) {
          const data = await res.json()
          if (data.banks) {
            banks.push({
              service_id: service.service_id,
              task_uuid: service.task_uuid,
              banks: data.banks
            })
          }
        }
      } catch (err) {
        console.warn(`Failed to load memory banks for service ${service.service_id}:`, err)
      }
    }
    memoryBanks.value = banks
  } catch (err) {
    console.error('Failed to load memory banks:', err)
  } finally {
    isLoadingMemoryBanks.value = false
  }
}

const openMemoryBankModal = (serviceId: string, bank: MemoryBankInfo, type: 'positive' | 'negative') => {
  selectedMemoryBankService.value = serviceId
  currentMemoryBank.value = bank
  currentBankType.value = type
  memoryBankModalOpen.value = true
}

const closeMemoryBankModal = () => {
  memoryBankModalOpen.value = false
  currentMemoryBank.value = null
  selectedMemoryBankService.value = ''
}

const startService = async (taskUuid: string, labels?: string[]) => {
  startingUuid.value = taskUuid
  
  try {
    // 先停止该模型的其他运行中服务
    const existingServices = getServicesForUuid(taskUuid)
    for (const svc of existingServices) {
      if (svc.status === 'running' || svc.status === 'starting') {
        try {
          await fetch(`/api/deploy/stop/${svc.service_id}`, { method: 'POST' })
          removeServiceLogPolling(svc.service_id)
          delete serviceLogs.value[svc.service_id]
        } catch (e) {
          console.warn(`停止已有服务失败: ${svc.service_id}`, e)
        }
      }
    }
    
    const res = await fetch(`/api/deploy/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: String(productId.value),
        task_uuid: taskUuid,
        labels: labels,
        device: selectedDevice.value[taskUuid] || 'GPU'
      })
    })
    const data = await res.json()

    if (data.status === 'success') {
      toast?.success(t('deploy.messages.startSuccess', { port: data.port }))
      await loadServices()
      startServicesPolling()
    } else {
      toast?.error(data.message || t('deploy.messages.startFailed'))
    }
  } catch (err: any) {
    console.error('Failed to start service:', err)
    toast?.error(err.message || t('deploy.messages.startFailed'))
  } finally {
    startingUuid.value = null
  }
}

const stopService = async (serviceId: string) => {
  stoppingId.value = serviceId
  try {
    const res = await fetch(`/api/deploy/stop/${serviceId}`, { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      toast?.success(t('deploy.messages.stopSuccess'))
      
      const serviceIndex = services.value.findIndex(s => s.service_id === serviceId)
      if (serviceIndex > -1) {
        services.value[serviceIndex].status = 'stopped'
      }
      
      removeServiceLogPolling(serviceId)
      delete serviceLogs.value[serviceId]
      
      await loadServices()
      
      const hasServicesToCheck = services.value.some(s =>
        s.status !== 'running' && s.status !== 'stopped'
      )
      if (!hasServicesToCheck) stopServicesPolling()
    } else {
      toast?.error(data.message || t('deploy.messages.stopFailed'))
    }
  } catch (err) {
    toast?.error(t('deploy.messages.stopFailed'))
  } finally {
    stoppingId.value = null
  }
}

const deleteService = async (serviceId: string) => {
  deletingId.value = serviceId
  try {
    const res = await fetch(`/api/deploy/${serviceId}`, {
      method: 'DELETE'
    })
    const data = await res.json()
    if (data.status === 'success') {
      toast?.success(t('deploy.messages.deleteSuccess'))
      await loadServices()
      removeServiceLogPolling(serviceId)
      delete serviceLogs.value[serviceId]
      // 删除后检查是否还有需要轮询的服务
      const hasServicesToCheck = services.value.some(s =>
        s.status !== 'running' && s.status !== 'stopped'
      )
      if (!hasServicesToCheck) {
        stopServicesPolling()
      }
    } else {
      toast?.error(data.message || t('deploy.messages.deleteFailed'))
    }
  } catch (err) {
    console.error('Failed to delete service:', err)
    toast?.error(t('deploy.messages.deleteFailed'))
  } finally {
    deletingId.value = null
  }
}

const getServiceForUuid = (taskUuid: string) => {
  return services.value.find(s => s.task_uuid === taskUuid)
}

const getServicesForUuid = (taskUuid: string) => {
  return services.value.filter(s => s.task_uuid === taskUuid)
}

// 日志查看函数
const openLogModal = (serviceId: string) => {
  logServiceId.value = serviceId
  logContent.value = ''
  logLines.value = '100'
  showLogModal.value = true
  loadServiceLogs()
}

const closeLogModal = () => {
  showLogModal.value = false
  logServiceId.value = ''
  logContent.value = ''
}

const loadServiceLogs = async () => {
  if (!logServiceId.value) return
  isLoadingLogs.value = true
  try {
    const res = await fetch(`/api/deploy/http/service/${logServiceId.value}/logs?lines=${logLines.value}`)
    if (res.ok) {
      const data = await res.json()
      logContent.value = data.logs || ''
    } else {
      const error = await res.json().catch(() => ({}))
      toast?.error(error.message || '获取日志失败')
    }
  } catch (err: any) {
    console.error('Failed to load service logs:', err)
    toast?.error(err.message || '获取日志失败')
  } finally {
    isLoadingLogs.value = false
  }
}

const refreshLogs = () => {
  loadServiceLogs()
}

// 推理测试函数
const triggerInferenceFileInput = () => {
  inferenceFileInput.value?.click()
}

const handleInferenceFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  inferenceImageUrl.value = dataUrl
  inferenceFile.value = file
  inferenceResult.value = null
  detectionResults.value = []
  classificationResults.value = []
  if (input) input.value = ''
}

const runInference = async () => {
  if (!selectedInferenceService.value || !inferenceImageUrl.value) {
    toast?.error(t('deploy.messages.selectServiceAndImage'))
    return
  }

  const selectedService = services.value.find(s => s.service_id === selectedInferenceService.value)

  if (!selectedService || !selectedService.inference_url) {
    toast?.error(t('deploy.messages.serviceInfoError'))
    return
  }
  if (selectedService.status === 'starting') {
    toast?.error(t('deploy.messages.serviceStarting'))
    return
  }

  isInferring.value = true
  inferenceResult.value = null
  detectionResults.value = []
  classificationResults.value = []

  try {
    const formData = new FormData()
    formData.append('file', inferenceFile.value!)
    formData.append('service_id', selectedInferenceService.value)
    
    const res = await fetch('/api/deploy/inference', {
      method: 'POST',
      body: formData
    })

    const data = await res.json()

    if (res.ok) {
      inferenceResult.value = data
      
      // 处理 /predict_roi 返回格式 - results 是数组，每个元素是一个标注框的检测结果
      if (data.result?.results && Array.isArray(data.result.results)) {
        const roiResults = data.result.results
        detectionResults.value = roiResults.map((r: any) => ({
          label: r.category || t('deploy.unknown'),
          score: (r.anomaly_score || 0) * 100,
          bbox: r.bbox || r.bbox_clipped || [0, 0, 0, 0],
          isAnomaly: r.is_anomaly || false,
          error: r.error || 0,
          threshold: r.threshold || 0,
          alignmentStrategy: r.alignment_strategy || 'ORB'
        }))
        const anomalyCount = roiResults.filter((r: any) => r.is_anomaly).length
        toast?.success(t('deploy.anomalyDetected', { count: detectionResults.value.length, anomaly: anomalyCount }))
        if (inferenceImageUrl.value && detectionResults.value.length > 0) {
          setTimeout(() => {
            drawDetectionBoxes(inferenceImageUrl.value, detectionResults.value)
          }, 100)
        }
      }
      // 处理目标检测结果（兼容旧格式）
      else if (data.detections && Array.isArray(data.detections)) {
        detectionResults.value = data.detections.map((d: any) => ({
          label: d.label || d.class || t('deploy.unknown'),
          score: (d.score || d.confidence || d.probability || 0) * 100,
          bbox: d.bbox || d.box || [0, 0, 0, 0]
        }))
        toast?.success(t('deploy.targetDetected', { count: detectionResults.value.length }))
        if (inferenceImageUrl.value && detectionResults.value.length > 0) {
          setTimeout(() => {
            drawDetectionBoxes(inferenceImageUrl.value, detectionResults.value)
          }, 100)
        }
      }
      // 处理分类结果
      else if (data.classifications && Array.isArray(data.classifications)) {
        classificationResults.value = data.classifications.map((c: any) => ({
          label: c.label || c.class || t('deploy.unknown'),
          score: (c.score || c.confidence || c.probability || 0) * 100
        }))
        toast?.success(t('deploy.inferenceComplete'))
      }
      else if (data.predictions && Array.isArray(data.predictions)) {
        classificationResults.value = data.predictions.map((p: any) => ({
          label: p.label || p.name || t('deploy.unknown'),
          score: (p.score || p.confidence || p.probability || 0) * 100
        }))
        toast?.success(t('deploy.inferenceComplete'))
      }
      else if (data.result?.detections) {
        detectionResults.value = data.result.detections.map((d: any) => ({
          label: d.label || d.class || t('deploy.unknown'),
          score: (d.score || d.confidence || d.probability || 0) * 100,
          bbox: d.bbox || d.box || [0, 0, 0, 0]
        }))
        toast?.success(t('deploy.targetDetected', { count: detectionResults.value.length }))
        if (inferenceImageUrl.value && detectionResults.value.length > 0) {
          setTimeout(() => {
            drawDetectionBoxes(inferenceImageUrl.value, detectionResults.value)
          }, 100)
        }
      }
      else {
        toast?.success(t('deploy.inferenceComplete'))
      }
    } else {
      toast?.error(data.message || t('deploy.inferenceFailed'))
    }
  } catch (err: any) {
    console.error('Inference error:', err)
    toast?.error(err.message || t('deploy.inferenceFailed'))
  } finally {
    isInferring.value = false
  }
}

const hasOnnxModel = (model: DeployableModel) => {
  if (!model.onnx_status) return false
  return Object.values(model.onnx_status).some(status => status === true)
}

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || ''
  if (s === 'running' || s === 'active') return { variant: 'default', label: t('deploy.status.running'), icon: CheckCircle }
  if (s === 'stopped' || s === 'inactive') return { variant: 'secondary', label: t('deploy.status.stopped'), icon: Square }
  if (s === 'starting') return { variant: 'outline', label: t('deploy.status.starting'), icon: Loader2 }
  if (s === 'unhealthy') return { variant: 'destructive', label: t('deploy.status.unhealthy'), icon: XCircle }
  if (s === 'error' || s === 'failed') return { variant: 'destructive', label: t('deploy.status.error'), icon: XCircle }
  return { variant: 'outline', label: status, icon: null }
}

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 轮询定时器
let servicesPollInterval: ReturnType<typeof setInterval> | null = null

// 检查单个服务健康状态
const checkServiceHealth = async (serviceId: string) => {
  try {
    const res = await fetch(`/api/deploy/http/service/${serviceId}/health`)
    if (res.ok) {
      const data = await res.json()
      // 更新本地服务状态
      const serviceIndex = services.value.findIndex(s => s.service_id === serviceId)
      if (serviceIndex !== -1 && data.health) {
        let newStatus = 'running'
        if (!data.health.healthy) {
          if (!data.health.process_alive) {
            newStatus = 'stopped'
          } else if (!data.health.port_listening) {
            newStatus = 'starting'
          } else if (!data.health.service_responsive) {
            newStatus = 'unhealthy'
          }
        }
        services.value[serviceIndex] = {
          ...services.value[serviceIndex],
          status: newStatus,
          health: data.health
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to check health for service ${serviceId}:`, err)
  }
}

const startServicesPolling = () => {
  if (servicesPollInterval) return
  servicesPollInterval = setInterval(() => {
    // 检查是否有需要轮询的服务（非运行状态且未停止）
    const servicesToCheck = services.value.filter(s => 
      s.status !== 'running' && s.status !== 'stopped'
    )
    
    if (servicesToCheck.length === 0) {
      // 没有需要检查的服务，停止轮询
      stopServicesPolling()
      return
    }
    
    // 为每个需要检查的服务检查健康状态
    servicesToCheck.forEach(service => {
      checkServiceHealth(service.service_id)
    })
  }, 3000) // 每3秒刷新一次
}

const stopServicesPolling = () => {
  if (servicesPollInterval) {
    clearInterval(servicesPollInterval)
    servicesPollInterval = null
  }
}

onMounted(async () => {
  await loadProducts()
  
  const qProductId = route.query.productId
  const qProductName = route.query.productName
  if (qProductId) {
    productId.value = Number(qProductId)
    productName.value = String(qProductName || '')
  } else if (products.value.length > 0) {
    // 自动选择第一个项目
    const firstProduct = products.value[0]
    productId.value = firstProduct.id
    productName.value = firstProduct.name
  }
  
  if (productId.value) {
    await loadDeployableModels()
    await loadServices()
    startServicesPolling()
    if (autoRefreshLogs.value) {
      startLogsAutoRefresh()
    }
  }
})

onUnmounted(() => {
  stopServicesPolling()
  stopLogsAutoRefresh()
})
</script>

<template>
  <div class="flex flex-col h-screen bg-background text-foreground overflow-hidden">
    <AppHeader />

    <main class="flex-1 overflow-auto bg-muted/20 p-6">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold">{{ t('common.serviceDeployment') }}</h1>
          </div>
          <div class="flex items-center gap-3">
            <UiButton variant="outline" size="sm" @click="loadDeployableModels(); loadServices()" :disabled="!productId">
              <RefreshCw class="h-4 w-4 mr-2" />
              {{ t('deploy.refresh') }}
            </UiButton>
          </div>
        </div>

        <Separator />

        <div v-if="!productId" class="text-center py-16">
          <FolderOpen class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p class="text-muted-foreground">{{ t('deploy.pleaseSelectProduct') }}</p>
        </div>

        <template v-else>
          <div class="space-y-4">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <Box class="h-5 w-5" />
              {{ t('deploy.deployableModels') }}
            </h2>

            <div v-if="isLoadingModels" class="flex items-center justify-center py-8">
              <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>

            <div v-else-if="deployableModels.length === 0" class="text-center py-8 text-muted-foreground">
              {{ t('deploy.noModels') }}
            </div>
            
            <div v-else class="grid gap-2">
              <div 
                v-for="model in deployableModels" 
                :key="model.task_uuid"
                class="border rounded-md p-2 bg-card hover:bg-accent/50 transition-colors"
              >
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <span class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded truncate">{{ model.created_at ? formatDate(model.created_at) + '@' + model.task_uuid : model.task_uuid }}</span>
                    <template v-if="getServiceForUuid(model.task_uuid)">
                      <Badge :variant="getStatusBadge(getServiceForUuid(model.task_uuid).status).variant" class="text-xs">
                        <component 
                          :is="getStatusBadge(getServiceForUuid(model.task_uuid).status).icon" 
                          class="h-3 w-3 mr-1"
                          :class="{ 'animate-spin': getServiceForUuid(model.task_uuid).status?.toLowerCase() === 'starting' }"
                        />
                        {{ getStatusBadge(getServiceForUuid(model.task_uuid).status).label }}
                      </Badge>
                    </template>
                  </div>
                  
                  <div class="flex items-center gap-2 shrink-0">
                    <template v-if="getServiceForUuid(model.task_uuid)">
                      <span class="text-xs text-muted-foreground">
                        {{ t('deploy.port') }}: {{ getServiceForUuid(model.task_uuid).port }}
                      </span>
                      <UiButton
                        size="sm"
                        variant="outline"
                        class="h-7 text-xs px-2"
                        @click="openLogModal(getServiceForUuid(model.task_uuid).service_id)"
                      >
                        <FileText class="h-3 w-3 mr-1" />
                        {{ t('deploy.viewLogs') }}
                      </UiButton>
                    </template>
                    
                    <template v-if="!getServiceForUuid(model.task_uuid)">
                      <UiSelect :model-value="selectedDevice[model.task_uuid] || 'GPU'" :open="deviceOpen[model.task_uuid]" @update:open="deviceOpen[model.task_uuid] = $event" @update:model-value="selectedDevice[model.task_uuid] = $event">
                        <UiSelectTrigger class="w-20 h-7 text-xs">
                          <UiSelectValue />
                        </UiSelectTrigger>
                        <UiSelectContent class="min-w-0 w-20">
                          <UiSelectItem value="GPU">GPU</UiSelectItem>
                          <UiSelectItem value="CPU">CPU</UiSelectItem>
                        </UiSelectContent>
                      </UiSelect>
                      <UiButton
                        size="sm"
                        class="h-7 text-xs px-2"
                        @click="startService(model.task_uuid, model.labels)"
                        :disabled="startingUuid === model.task_uuid"
                      >
                        <Loader2 v-if="startingUuid === model.task_uuid" class="h-3 w-3 mr-1 animate-spin" />
                        <Play v-else class="h-3 w-3 mr-1" />
                        {{ t('deploy.startService') }}
                      </UiButton>
                    </template>
                    
                    <template v-else>
                      <UiButton
                        size="sm"
                        variant="outline"
                        class="h-7 text-xs px-2"
                        @click="stopService(getServiceForUuid(model.task_uuid).service_id)"
                        :disabled="stoppingId === getServiceForUuid(model.task_uuid).service_id"
                      >
                        <Loader2 v-if="stoppingId === getServiceForUuid(model.task_uuid).service_id" class="h-3 w-3 mr-1 animate-spin" />
                        <Square v-else class="h-3 w-3 mr-1" />
                        {{ t('deploy.stopService') }}
                      </UiButton>
                      <UiButton
                        size="sm"
                        variant="destructive"
                        class="h-7 text-xs px-2"
                        @click="deleteService(getServiceForUuid(model.task_uuid).service_id)"
                        :disabled="deletingId === getServiceForUuid(model.task_uuid).service_id"
                      >
                        <Loader2 v-if="deletingId === getServiceForUuid(model.task_uuid).service_id" class="h-3 w-3 mr-1 animate-spin" />
                        <Trash2 v-else class="h-3 w-3 mr-1" />
                        {{ t('deploy.deleteService') }}
                      </UiButton>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold flex items-center gap-2">
                <FileText class="h-5 w-5" />
                {{ t('deploy.serviceLogs') }}
              </h2>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <Switch v-model="autoRefreshLogs" />
                  <span class="text-sm text-muted-foreground">自动刷新</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">{{ t('deploy.logLines') }}:</span>
                  <UiSelect v-model="logLines" v-model:open="logLinesOpen" @update:model-value="refreshAllLogs">
                    <UiSelectTrigger class="w-[140px]">
                      <UiSelectValue />
                    </UiSelectTrigger>
                    <UiSelectContent class="w-[140px]">
                      <UiSelectItem :value="50">50</UiSelectItem>
                      <UiSelectItem :value="100">100</UiSelectItem>
                      <UiSelectItem :value="200">200</UiSelectItem>
                      <UiSelectItem :value="500">500</UiSelectItem>
                      <UiSelectItem :value="1000">1000</UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                </div>
                <UiButton variant="outline" size="sm" @click="refreshAllLogs" :disabled="isLoadingAllLogs">
                  <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoadingAllLogs }" />
                  {{ t('deploy.refreshLogs') }}
                </UiButton>
              </div>
            </div>

            <div v-if="isLoadingServices" class="flex items-center justify-center py-8">
              <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>

            <div v-else-if="runningServices.length === 0" class="text-center py-8 text-muted-foreground">
              {{ t('deploy.noRunningServices') }}
            </div>
            
            <div v-else class="grid gap-4">
              <div 
                v-for="service in runningServices" 
                :key="service.service_id"
                class="border rounded-lg bg-card overflow-hidden"
              >
                <div class="flex items-center gap-4 p-3 bg-muted/50 border-b text-sm">
                  <span><span class="text-muted-foreground">服务ID:</span> <span class="font-mono">{{ service.service_id }}</span></span>
                  <span><span class="text-muted-foreground">服务地址:</span> <code class="bg-muted px-1 rounded text-xs">{{ service.inference_url }}</code></span>
                </div>
                <div class="p-3">
                  <div class="bg-muted/50 rounded border p-3 font-mono text-xs leading-relaxed h-80 overflow-auto">
                    <div v-if="serviceLogs[service.service_id]?.loading" class="flex items-center justify-center h-full">
                      <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                    <div v-else-if="serviceLogs[service.service_id]?.content" class="whitespace-pre-wrap break-all">{{ serviceLogs[service.service_id]?.content }}</div>
                    <div v-else class="flex items-center justify-center h-full text-muted-foreground">
                      {{ t('deploy.noLogs') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <!-- 内存库展示 -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold flex items-center gap-2">
                <Database class="h-5 w-5" />
                {{ t('deploy.memoryBanks') }}
              </h2>
              <UiButton variant="outline" size="sm" @click="loadMemoryBanks" :disabled="isLoadingMemoryBanks">
                <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoadingMemoryBanks }" />
                {{ t('deploy.refresh') }}
              </UiButton>
            </div>

            <div v-if="isLoadingMemoryBanks" class="flex items-center justify-center py-8">
              <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>

            <div v-else-if="memoryBanks.length === 0" class="text-center py-8 text-muted-foreground">
              {{ t('deploy.noMemoryBanks') }}
            </div>

            <div v-else class="grid gap-4">
              <div
                v-for="serviceBank in memoryBanks"
                :key="serviceBank.service_id"
                class="border rounded-lg bg-card overflow-hidden"
              >
                <div class="flex items-center gap-4 p-3 bg-muted/50 border-b text-sm">
                  <span><span class="text-muted-foreground">服务ID:</span> <span class="font-mono">{{ serviceBank.service_id }}</span></span>
                  <span><span class="text-muted-foreground">任务UUID:</span> <span class="font-mono">{{ serviceBank.task_uuid }}</span></span>
                </div>
                <div class="p-3">
                  <div class="grid gap-2">
                    <div
                      v-for="bank in serviceBank.banks"
                      :key="bank.category"
                      class="border rounded p-3 bg-muted/30"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-sm">{{ bank.category }}</span>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          @click="openMemoryBankModal(serviceBank.service_id, bank, 'positive')"
                          class="flex items-center justify-between p-2 rounded bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                        >
                          <div class="flex items-center gap-2">
                            <Database class="h-4 w-4 text-green-600" />
                            <span class="text-xs font-medium text-green-700">{{ t('deploy.positiveLibrary') }}</span>
                          </div>
                          <span class="text-xs font-bold text-green-700">{{ bank.positive_count }}</span>
                        </button>
                        <button
                          @click="openMemoryBankModal(serviceBank.service_id, bank, 'negative')"
                          class="flex items-center justify-between p-2 rounded bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
                        >
                          <div class="flex items-center gap-2">
                            <Database class="h-4 w-4 text-orange-600" />
                            <span class="text-xs font-medium text-orange-700">{{ t('deploy.negativeLibrary') }}</span>
                          </div>
                          <span class="text-xs font-bold text-orange-700">{{ bank.negative_count }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </template>
      </div>

    </main>

    <!-- 内存库详情对话框 -->
    <div v-if="memoryBankModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-4xl h-[80vh] shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
        <UiCardHeader class="pb-4 shrink-0">
          <div class="flex items-center justify-between">
            <UiCardTitle class="text-lg flex items-center gap-2">
              <Database class="h-5 w-5" :class="currentBankType === 'positive' ? 'text-green-600' : 'text-orange-600'" />
              {{ currentBankType === 'positive' ? t('deploy.positiveLibrary') : t('deploy.negativeLibrary') }} - {{ currentMemoryBank?.category }}
            </UiCardTitle>
            <UiButton variant="ghost" size="icon" class="h-8 w-8" @click="closeMemoryBankModal">
              <X class="h-4 w-4" />
            </UiButton>
          </div>
          <UiCardDescription>
            {{ t('deploy.memoryBankDescription', { count: currentBankType === 'positive' ? currentMemoryBank?.positive_count : currentMemoryBank?.negative_count }) }}
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="flex-1 overflow-hidden py-4">
          <div class="h-full overflow-auto bg-muted/50 rounded-lg border p-4">
            <div v-if="currentBankType === 'positive' && currentMemoryBank?.positive_samples">
              <div class="grid grid-cols-4 gap-2">
                <div
                  v-for="(sample, idx) in currentMemoryBank.positive_samples"
                  :key="idx"
                  class="aspect-square rounded border bg-white flex items-center justify-center text-xs text-muted-foreground"
                >
                  {{ sample }}
                </div>
              </div>
            </div>
            <div v-else-if="currentBankType === 'negative' && currentMemoryBank?.negative_samples">
              <div class="grid grid-cols-4 gap-2">
                <div
                  v-for="(sample, idx) in currentMemoryBank.negative_samples"
                  :key="idx"
                  class="aspect-square rounded border bg-white flex items-center justify-center text-xs text-muted-foreground"
                >
                  {{ sample }}
                </div>
              </div>
            </div>
            <div v-else class="flex items-center justify-center h-full text-muted-foreground">
              {{ t('deploy.noSamples') }}
            </div>
          </div>
        </UiCardContent>

        <UiCardFooter class="pt-4 shrink-0">
          <UiButton variant="outline" class="w-full" @click="closeMemoryBankModal">
            {{ t('common.close') }}
          </UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <!-- 日志查看对话框 -->
    <div v-if="showLogModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-4xl h-[80vh] shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
        <UiCardHeader class="pb-4 shrink-0">
          <div class="flex items-center justify-between">
            <UiCardTitle class="text-lg flex items-center gap-2">
              <FileText class="h-5 w-5 text-primary" />
              {{ t('deploy.serviceLogs') }} - {{ logServiceId }}
            </UiCardTitle>
            <UiButton variant="ghost" size="icon" class="h-8 w-8" @click="closeLogModal">
              <X class="h-4 w-4" />
            </UiButton>
          </div>
          <UiCardDescription>
            {{ t('deploy.logsDescription') }}
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="flex-1 overflow-hidden flex flex-col py-4">
          <!-- 工具栏 -->
          <div class="flex items-center gap-4 mb-4 shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">{{ t('deploy.logLines') }}:</span>
              <UiSelect v-model="logLines" v-model:open="logLinesOpen" @update:model-value="loadServiceLogs">
                <UiSelectTrigger class="w-[140px]">
                  <UiSelectValue />
                </UiSelectTrigger>
                <UiSelectContent class="w-[140px]">
                  <UiSelectItem :value="50">50</UiSelectItem>
                  <UiSelectItem :value="100">100</UiSelectItem>
                  <UiSelectItem :value="200">200</UiSelectItem>
                  <UiSelectItem :value="500">500</UiSelectItem>
                  <UiSelectItem :value="1000">1000</UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </div>
            <UiButton variant="outline" size="sm" @click="refreshLogs" :disabled="isLoadingLogs">
              <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoadingLogs }" />
              {{ t('deploy.refreshLogs') }}
            </UiButton>
          </div>

          <!-- 日志内容 -->
          <div class="flex-1 overflow-auto bg-muted/50 rounded-lg border p-4 font-mono text-xs leading-relaxed">
            <div v-if="isLoadingLogs" class="flex items-center justify-center h-full">
              <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
            <div v-else-if="logContent" class="whitespace-pre-wrap break-all">{{ logContent }}</div>
            <div v-else class="flex items-center justify-center h-full text-muted-foreground">
              {{ t('deploy.noLogs') }}
            </div>
          </div>
        </UiCardContent>

        <UiCardFooter class="pt-4 shrink-0">
          <UiButton variant="outline" class="w-full" @click="closeLogModal">
            {{ t('common.close') }}
          </UiButton>
        </UiCardFooter>
      </UiCard>
    </div>
  </div>
</template>

<style scoped>
.step-nav {
  display: flex;
  align-items: center;
  height: 36px;
}

.step-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 28px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.step-item:not(.step-first) {
  margin-left: -14px;
}

.step-first {
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 0 50%);
}

.step-middle {
  clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 16px 100%, 0 50%);
}

.step-last {
  clip-path: polygon(16px 0, 100% 0, 100% 100%, 16px 100%, 0 50%);
}

.step-active {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
  z-index: 2;
}

.step-inactive {
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
}

.step-label {
  white-space: nowrap;
}
</style>
