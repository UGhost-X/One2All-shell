<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRuntimeConfig } from '#app'
import { Play, Square, Trash2, RefreshCw, Server, Box, Loader2, Zap, FolderOpen, CheckCircle, XCircle, Clock, ImageIcon, BarChart3 } from 'lucide-vue-next'
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

const selectedDevice = ref<'GPU' | 'CPU'>('GPU')
const deviceOpen = ref(false)

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

        const anomalyText = det.isAnomaly ? '[异常] ' : ''
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
  console.log('[Deploy] loadDeployableModels called, productId:', productId.value)
  if (!productId.value) {
    console.log('[Deploy] No productId, skipping')
    deployableModels.value = []
    return
  }
  isLoadingModels.value = true
  try {
    const url = `/api/deploy/models/${productId.value}`
    console.log('[Deploy] Fetching:', url)
    const res = await fetch(url)
    console.log('[Deploy] Response status:', res.status)
    const data = await res.json()
    console.log('[Deploy] Response data:', data)
    deployableModels.value = data.models || []
  } catch (err) {
    console.error('Failed to load deployable models:', err)
    toast?.error('加载可部署模型失败')
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
    services.value = data.services || []
  } catch (err) {
    console.error('Failed to load services:', err)
  } finally {
    isLoadingServices.value = false
  }
}

const startService = async (taskUuid: string, labels?: string[]) => {
  startingUuid.value = taskUuid
  
  try {
    const res = await fetch(`/api/deploy/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: String(productId.value),
        task_uuid: taskUuid,
        labels: labels,
        device: selectedDevice.value
      })
    })
    const data = await res.json()

    if (data.status === 'success') {
      toast?.success(`服务启动成功，端口: ${data.port}`)
      loadServices()
    } else {
      toast?.error(data.message || '启动服务失败')
    }
  } catch (err: any) {
    console.error('Failed to start service:', err)
    toast?.error(err.message || '启动服务失败')
  } finally {
    startingUuid.value = null
  }
}

const stopService = async (serviceId: string) => {
  stoppingId.value = serviceId
  try {
    const res = await fetch(`/api/deploy/stop/${serviceId}`, {
      method: 'POST'
    })
    const data = await res.json()
    if (data.success) {
      toast?.success('服务已停止')
      await loadServices()
      // 停止后检查是否还有需要轮询的服务
      const hasServicesToCheck = services.value.some(s => 
        s.status !== 'running' && s.status !== 'stopped'
      )
      if (!hasServicesToCheck) {
        stopServicesPolling()
      }
    } else {
      toast?.error(data.message || '停止服务失败')
    }
  } catch (err) {
    console.error('Failed to stop service:', err)
    toast?.error('停止服务失败')
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
      toast?.success('服务已删除')
      await loadServices()
      // 删除后检查是否还有需要轮询的服务
      const hasServicesToCheck = services.value.some(s => 
        s.status !== 'running' && s.status !== 'stopped'
      )
      if (!hasServicesToCheck) {
        stopServicesPolling()
      }
    } else {
      toast?.error(data.message || '删除服务失败')
    }
  } catch (err) {
    console.error('Failed to delete service:', err)
    toast?.error('删除服务失败')
  } finally {
    deletingId.value = null
  }
}

const getServiceForUuid = (taskUuid: string) => {
  return services.value.find(s => s.task_uuid === taskUuid)
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
    toast?.error('请先选择服务并上传图片')
    return
  }

  const selectedService = services.value.find(s => s.service_id === selectedInferenceService.value)
  console.log('[Inference] Selected service:', selectedService)
  console.log('[Inference] All services:', services.value)
  if (!selectedService || !selectedService.http_url) {
    toast?.error('服务信息不正确')
    return
  }

  if (selectedService.status === 'starting') {
    toast?.error('服务正在启动中，请稍后再试')
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
    console.log('[Inference] Response:', data)
    console.log('[Inference] Results:', data.result?.results)

    if (res.ok) {
      inferenceResult.value = data
      
      // 处理 /predict_roi 返回格式 - results 是数组，每个元素是一个标注框的检测结果
      if (data.result?.results && Array.isArray(data.result.results)) {
        const roiResults = data.result.results
        console.log('[Inference] ROI results count:', roiResults.length)
        detectionResults.value = roiResults.map((r: any) => ({
          label: r.category || '未知',
          score: (r.anomaly_score || 0) * 100,
          bbox: r.bbox || r.bbox_clipped || [0, 0, 0, 0],
          isAnomaly: r.is_anomaly || false,
          error: r.error || 0,
          threshold: r.threshold || 0,
          alignmentStrategy: r.alignment_strategy || 'ORB'
        }))
        const anomalyCount = roiResults.filter((r: any) => r.is_anomaly).length
        toast?.success(`检测到 ${detectionResults.value.length} 个目标，异常 ${anomalyCount} 个`)
        if (inferenceImageUrl.value && detectionResults.value.length > 0) {
          setTimeout(() => {
            drawDetectionBoxes(inferenceImageUrl.value, detectionResults.value)
          }, 100)
        }
      }
      // 处理目标检测结果（兼容旧格式）
      else if (data.detections && Array.isArray(data.detections)) {
        detectionResults.value = data.detections.map((d: any) => ({
          label: d.label || d.class || '未知',
          score: (d.score || d.confidence || d.probability || 0) * 100,
          bbox: d.bbox || d.box || [0, 0, 0, 0]
        }))
        toast?.success(`检测到 ${detectionResults.value.length} 个目标`)
        if (inferenceImageUrl.value && detectionResults.value.length > 0) {
          setTimeout(() => {
            drawDetectionBoxes(inferenceImageUrl.value, detectionResults.value)
          }, 100)
        }
      }
      // 处理分类结果
      else if (data.classifications && Array.isArray(data.classifications)) {
        classificationResults.value = data.classifications.map((c: any) => ({
          label: c.label || c.class || '未知',
          score: (c.score || c.confidence || c.probability || 0) * 100
        }))
        toast?.success('推理完成')
      }
      else if (data.predictions && Array.isArray(data.predictions)) {
        classificationResults.value = data.predictions.map((p: any) => ({
          label: p.label || p.name || '未知',
          score: (p.score || p.confidence || p.probability || 0) * 100
        }))
        toast?.success('推理完成')
      }
      else if (data.result?.detections) {
        detectionResults.value = data.result.detections.map((d: any) => ({
          label: d.label || d.class || '未知',
          score: (d.score || d.confidence || d.probability || 0) * 100,
          bbox: d.bbox || d.box || [0, 0, 0, 0]
        }))
        toast?.success(`检测到 ${detectionResults.value.length} 个目标`)
        if (inferenceImageUrl.value && detectionResults.value.length > 0) {
          setTimeout(() => {
            drawDetectionBoxes(inferenceImageUrl.value, detectionResults.value)
          }, 100)
        }
      }
      else {
        toast?.success('推理完成')
      }
    } else {
      toast?.error(data.message || '推理失败')
    }
  } catch (err: any) {
    console.error('Inference error:', err)
    toast?.error(err.message || '推理请求失败')
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
  if (s === 'running' || s === 'active') return { variant: 'default', label: '运行中', icon: CheckCircle }
  if (s === 'stopped' || s === 'inactive') return { variant: 'secondary', label: '已停止', icon: Square }
  if (s === 'starting') return { variant: 'outline', label: '启动中', icon: Loader2 }
  if (s === 'unhealthy') return { variant: 'destructive', label: '异常', icon: XCircle }
  if (s === 'error' || s === 'failed') return { variant: 'destructive', label: '错误', icon: XCircle }
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
  }
})

onUnmounted(() => {
  stopServicesPolling()
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
            <UiSelect 
              v-model:open="isProductSelectOpen"
              :model-value="productId ? String(productId) : ''" 
              @update:model-value="onProductChange"
            >
              <UiSelectTrigger class="w-[200px]">
                <UiSelectValue placeholder="选择项目" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem 
                  v-for="product in products" 
                  :key="product.id" 
                  :value="String(product.id)"
                >
                  {{ product.name }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
            <UiButton variant="outline" size="sm" @click="loadDeployableModels(); loadServices()" :disabled="!productId">
              <RefreshCw class="h-4 w-4 mr-2" />
              刷新
            </UiButton>
          </div>
        </div>

        <Separator />

        <div v-if="!productId" class="text-center py-16">
          <FolderOpen class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p class="text-muted-foreground">请先选择一个项目</p>
        </div>

        <template v-else>
          <div class="space-y-4">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <Box class="h-5 w-5" />
              可部署模型
            </h2>
            
            <div v-if="isLoadingModels" class="flex items-center justify-center py-8">
              <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
            
            <div v-else-if="deployableModels.length === 0" class="text-center py-8 text-muted-foreground">
              暂无可部署的模型，请先完成训练
            </div>
            
            <div v-else class="grid gap-4">
              <div 
                v-for="model in deployableModels" 
                :key="model.task_uuid"
                class="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-sm bg-muted px-2 py-1 rounded">{{ model.task_uuid }}</span>
                      <Badge variant="outline">{{ model.labels?.length || 0 }} 个模型</Badge>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <Badge v-for="label in model.labels" :key="label" variant="secondary" class="text-xs">
                        {{ label }}
                        <span v-if="model.onnx_status?.[label]" class="ml-1 text-[10px] text-green-500">✓ ONNX</span>
                        <span v-else class="ml-1 text-[10px] text-orange-500">⚠ 未转换</span>
                      </Badge>
                    </div>
                    <p class="text-xs text-muted-foreground" v-if="model.created_at">
                      <Clock class="h-3 w-3 inline mr-1" />
                      {{ formatDate(model.created_at) }}
                    </p>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <template v-if="getServiceForUuid(model.task_uuid)">
                      <Badge :variant="getStatusBadge(getServiceForUuid(model.task_uuid).status).variant">
                        <component 
                          :is="getStatusBadge(getServiceForUuid(model.task_uuid).status).icon" 
                          class="h-3 w-3 mr-1"
                          :class="{ 'animate-spin': getServiceForUuid(model.task_uuid).status?.toLowerCase() === 'starting' }"
                        />
                        {{ getStatusBadge(getServiceForUuid(model.task_uuid).status).label }}
                      </Badge>
                      <span class="text-sm text-muted-foreground">
                        端口: {{ getServiceForUuid(model.task_uuid).port }}
                      </span>
                    </template>
                    
                    <template v-if="!getServiceForUuid(model.task_uuid)">
                      <div class="flex items-center gap-2 mb-2">
                        <UiSelect v-model="selectedDevice" :open="deviceOpen" @update:open="deviceOpen = $event">
                          <UiSelectTrigger class="w-20 h-8">
                            <UiSelectValue placeholder="设备" />
                          </UiSelectTrigger>
                          <UiSelectContent>
                            <UiSelectItem value="GPU">GPU</UiSelectItem>
                            <UiSelectItem value="CPU">CPU</UiSelectItem>
                          </UiSelectContent>
                        </UiSelect>
                      </div>
                      <UiButton 
                        size="sm" 
                        @click="startService(model.task_uuid, model.labels)"
                        :disabled="startingUuid === model.task_uuid"
                      >
                        <Loader2 v-if="startingUuid === model.task_uuid" class="h-4 w-4 mr-2 animate-spin" />
                        <Play v-else class="h-4 w-4 mr-2" />
                        启动服务
                      </UiButton>
                    </template>
                    
                    <template v-else>
                      <UiButton 
                        size="sm" 
                        variant="outline"
                        @click="stopService(getServiceForUuid(model.task_uuid).service_id)"
                        :disabled="stoppingId === getServiceForUuid(model.task_uuid).service_id"
                      >
                        <Loader2 v-if="stoppingId === getServiceForUuid(model.task_uuid).service_id" class="h-4 w-4 mr-2 animate-spin" />
                        <Square v-else class="h-4 w-4 mr-2" />
                        停止
                      </UiButton>
                      <UiButton 
                        size="sm" 
                        variant="destructive"
                        @click="deleteService(getServiceForUuid(model.task_uuid).service_id)"
                        :disabled="deletingId === getServiceForUuid(model.task_uuid).service_id"
                      >
                        <Loader2 v-if="deletingId === getServiceForUuid(model.task_uuid).service_id" class="h-4 w-4 mr-2 animate-spin" />
                        <Trash2 v-else class="h-4 w-4 mr-2" />
                        删除
                      </UiButton>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div class="space-y-4">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <Server class="h-5 w-5" />
              运行中的服务
            </h2>
            
            <div v-if="isLoadingServices" class="flex items-center justify-center py-8">
              <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
            
            <div v-else-if="services.length === 0" class="text-center py-8 text-muted-foreground">
              暂无运行中的服务
            </div>
            
            <div v-else class="grid gap-4">
              <div 
                v-for="service in services" 
                :key="service.service_id"
                class="border rounded-lg p-4 bg-card"
              >
                <div class="flex items-start justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <Badge :variant="getStatusBadge(service.status).variant">
                        <component 
                          :is="getStatusBadge(service.status).icon" 
                          class="h-3 w-3 mr-1"
                          :class="{ 'animate-spin': service.status?.toLowerCase() === 'starting' }"
                        />
                        {{ getStatusBadge(service.status).label }}
                      </Badge>
                      <span class="font-mono text-sm">{{ service.service_id }}</span>
                    </div>
                    <div class="text-sm space-y-1">
                      <p><span class="text-muted-foreground">任务UUID:</span> {{ service.task_uuid }}</p>
                      <p><span class="text-muted-foreground">端口:</span> {{ service.port }}</p>
                      <p><span class="text-muted-foreground">推理地址:</span> 
                        <code class="bg-muted px-1 rounded text-xs">{{ service.inference_url }}</code>
                      </p>
                      <p><span class="text-muted-foreground">模型数量:</span> {{ service.model_count }}</p>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <Badge v-for="label in service.labels" :key="label" variant="secondary" class="text-xs">
                        {{ label }}
                      </Badge>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <UiButton 
                      size="sm" 
                      variant="outline"
                      @click="stopService(service.service_id)"
                      :disabled="stoppingId === service.service_id"
                    >
                      <Loader2 v-if="stoppingId === service.service_id" class="h-4 w-4 mr-2 animate-spin" />
                      <Square v-else class="h-4 w-4 mr-2" />
                      停止
                    </UiButton>
                    <UiButton 
                      size="sm" 
                      variant="destructive"
                      @click="deleteService(service.service_id)"
                      :disabled="deletingId === service.service_id"
                    >
                      <Loader2 v-if="deletingId === service.service_id" class="h-4 w-4 mr-2 animate-spin" />
                      <Trash2 v-else class="h-4 w-4 mr-2" />
                      删除
                    </UiButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <!-- 推理测试区域 -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <Zap class="h-5 w-5" />
              推理测试
            </h2>
            
            <div class="grid grid-cols-2 gap-4">
              <!-- 左侧：图片上传和推理 -->
              <div class="space-y-4">
                <!-- 服务选择 -->
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">选择服务:</span>
                  <UiSelect v-model="selectedInferenceService" :open="inferenceServiceOpen" @update:open="inferenceServiceOpen = $event">
                    <UiSelectTrigger class="w-[200px]">
                      <UiSelectValue placeholder="选择推理服务" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                      <UiSelectItem 
                        v-for="service in runningServices" 
                        :key="service.service_id" 
                        :value="service.service_id"
                      >
                        {{ service.service_id }} (端口: {{ service.port }})
                      </UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                </div>

                <!-- 图片上传区域 -->
                <div 
                  class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                  @click="triggerInferenceFileInput"
                >
                  <input 
                    ref="inferenceFileInput" 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    @change="handleInferenceFileChange"
                  />
                  <div v-if="!inferenceImageUrl" class="space-y-2">
                    <ImageIcon class="h-10 w-10 mx-auto text-muted-foreground" />
                    <p class="text-sm text-muted-foreground">点击上传图片进行推理</p>
                  </div>
                  <img 
                    v-else
                    :src="inferenceImageUrl" 
                    class="max-h-48 mx-auto rounded-lg object-contain"
                    alt="待推理图片"
                  />
                </div>

                <!-- 推理按钮 -->
                <UiButton 
                  class="w-full"
                  :disabled="!inferenceImageUrl || !selectedInferenceService || isInferring"
                  @click="runInference"
                >
                  <Loader2 v-if="isInferring" class="h-4 w-4 mr-2 animate-spin" />
                  <Zap v-else class="h-4 w-4 mr-2" />
                  {{ isInferring ? '推理中...' : '开始推理' }}
                </UiButton>
              </div>

              <!-- 右侧：推理结果展示 -->
              <div class="border rounded-lg p-4 bg-card">
                <h3 class="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 class="h-4 w-4" />
                  推理结果
                </h3>
                
                <div v-if="!inferenceResult && !isInferring" class="text-center py-8 text-muted-foreground">
                  <BarChart3 class="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p class="text-sm">暂无推理结果</p>
                </div>

                <div v-else-if="isInferring" class="flex items-center justify-center py-8">
                  <Loader2 class="h-6 w-6 animate-spin text-primary" />
                  <span class="ml-2 text-sm text-muted-foreground">推理中...</span>
                </div>

                <!-- 目标检测结果 -->
                <div v-else-if="detectionResults.length > 0" class="space-y-3">
                  <div v-if="inferenceImageUrl" class="flex justify-center">
                    <canvas 
                      ref="inferenceCanvasResultRef"
                      class="max-w-full rounded-lg border"
                    />
                  </div>
                </div>

                <!-- 分类结果 -->
                <div v-else-if="classificationResults.length > 0" class="space-y-3">
                  <div class="space-y-2 max-h-64 overflow-auto">
                    <div 
                      v-for="item in classificationResults" 
                      :key="item.label"
                      class="p-2 rounded bg-muted"
                    >
                      <div class="flex justify-between items-center text-sm">
                        <span class="font-medium">{{ item.label }}</span>
                        <span class="font-mono">{{ item.score.toFixed(1) }}%</span>
                      </div>
                      <Progress :model-value="item.score" class="h-1.5 mt-1" />
                    </div>
                  </div>
                </div>

                <!-- 原始结果 -->
                <div v-else-if="inferenceResult" class="space-y-2">
                  <pre class="bg-muted p-2 rounded text-xs overflow-auto max-h-64">{{ JSON.stringify(inferenceResult, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>


    </main>
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
