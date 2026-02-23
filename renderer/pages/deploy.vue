<script setup lang="ts">
import { computed, ref, onMounted, inject, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRuntimeConfig } from '#app'
import { Play, Square, Trash2, RefreshCw, Server, Box, Clock, CheckCircle, XCircle, Loader2, Zap, FolderOpen } from 'lucide-vue-next'
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
const apiBase = ''

interface DeployableModel {
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

const deployableModels = ref<DeployableModel[]>([])
const services = ref<DeployService[]>([])
const isLoadingModels = ref(false)
const isLoadingServices = ref(false)
const startingUuid = ref<string | null>(null)
const stoppingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const isProductSelectOpen = ref(false)
const showDeployProgress = ref(false)
const deployProgress = ref<ConvertProgress | null>(null)
const deployProgressInterval = ref<number | null>(null)
const currentDeployTask = ref<string | null>(null)

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
    const res = await fetch(`/api/deploy/list`)
    const data = await res.json()
    services.value = (data.services || []).filter((s: DeployService) => s.project_id === String(productId.value))
  } catch (err) {
    console.error('Failed to load services:', err)
  } finally {
    isLoadingServices.value = false
  }
}

const startService = async (taskUuid: string, labels?: string[]) => {
  startingUuid.value = taskUuid
  currentDeployTask.value = taskUuid
  showDeployProgress.value = true
  deployProgress.value = {
    currentStep: 0,
    totalSteps: labels?.length || 1,
    stepName: '检查模型状态',
    status: 'pending',
    message: '正在检查模型状态...',
    convertedLabels: []
  }

  if (deployProgressInterval.value) {
    clearInterval(deployProgressInterval.value)
  }

  const pollProgress = async () => {
    try {
      const res = await fetch(`/api/deploy/progress?task_uuid=${taskUuid}`)
      if (res.ok) {
        const data = await res.json()
        if (data) {
          deployProgress.value = data
        }
      }
    } catch (err) {
      // 忽略404错误，因为progress可能还没创建
      if ((err as any)?.status !== 404) {
        console.error('Failed to poll progress:', err)
      }
    }
  }

  deployProgressInterval.value = window.setInterval(pollProgress, 1000)

  try {
    const res = await fetch(`/api/deploy/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: String(productId.value),
        task_uuid: taskUuid,
        labels: labels
      })
    })
    const data = await res.json()

    if (data.status === 'success') {
      await pollProgress()
      setTimeout(() => {
        showDeployProgress.value = false
        toast?.success(`服务启动成功，端口: ${data.port}`)
        loadServices()
      }, 2000)
    } else {
      await pollProgress()
      if (deployProgress.value) {
        deployProgress.value.status = 'error'
        deployProgress.value.message = data.message || '启动服务失败'
      }
      setTimeout(() => {
        showDeployProgress.value = false
        toast?.error(data.message || '启动服务失败')
      }, 3000)
    }
  } catch (err: any) {
    console.error('Failed to start service:', err)
    if (deployProgress.value) {
      deployProgress.value.status = 'error'
      deployProgress.value.message = err.message || '启动服务失败'
    }
    setTimeout(() => {
      showDeployProgress.value = false
      toast?.error(err.message || '启动服务失败')
    }, 3000)
  } finally {
    startingUuid.value = null
    if (deployProgressInterval.value) {
      clearInterval(deployProgressInterval.value)
      deployProgressInterval.value = null
    }
    setTimeout(() => {
      currentDeployTask.value = null
    }, 5000)
  }
}

const stopService = async (serviceId: string) => {
  stoppingId.value = serviceId
  try {
    const res = await fetch(`/api/deploy/stop/${serviceId}`, {
      method: 'POST'
    })
    const data = await res.json()
    if (data.status === 'success') {
      toast?.success('服务已停止')
      await loadServices()
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

const hasOnnxModel = (model: DeployableModel) => {
  if (!model.onnx_status) return false
  return Object.values(model.onnx_status).some(status => status === true)
}

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || ''
  if (s === 'running' || s === 'active') return { variant: 'default', label: '运行中', icon: CheckCircle }
  if (s === 'stopped' || s === 'inactive') return { variant: 'secondary', label: '已停止', icon: Square }
  if (s === 'starting') return { variant: 'outline', label: '启动中', icon: Loader2 }
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
  }
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

          <div class="space-y-4">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <Zap class="h-5 w-5" />
              使用说明
            </h2>
            <div class="text-sm text-muted-foreground space-y-2 bg-muted/50 rounded-lg p-4">
              <p>1. 在上方选择要部署的模型组，点击"启动服务"</p>
              <p>2. 服务启动后，会分配一个端口号</p>
              <p>3. 调用推理接口示例：</p>
              <pre class="bg-background p-3 rounded text-xs overflow-x-auto mt-2"><code>POST http://localhost:{port}/predict
Content-Type: multipart/form-data

# 上传图片文件
# 返回: {"results": {"螺丝": {"mask_mean": 0.95}, ...}}</code></pre>
              <p class="mt-2">4. 指定模型推理：</p>
              <pre class="bg-background p-3 rounded text-xs overflow-x-auto mt-2"><code>POST http://localhost:{port}/predict_base64
Content-Type: application/json

{
  "image": "base64编码的图片",
  "labels": ["螺丝", "孔洞"]
}</code></pre>
            </div>
          </div>
        </template>
      </div>

      <Teleport to="body">
        <div v-if="showDeployProgress" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="bg-background border rounded-lg shadow-lg p-6 w-[480px] max-w-[90vw]">
            <h3 class="text-lg font-semibold mb-4">部署进度</h3>
            
            <div class="space-y-4">
              <div v-if="deployProgress" class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">{{ deployProgress.stepName }}</span>
                  <span class="text-muted-foreground">{{ deployProgress.currentStep }} / {{ deployProgress.totalSteps }}</span>
                </div>
                
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all duration-300"
                    :class="{
                      'bg-primary': deployProgress.status === 'pending',
                      'bg-blue-500': deployProgress.status === 'converting',
                      'bg-green-500': deployProgress.status === 'completed',
                      'bg-red-500': deployProgress.status === 'error'
                    }"
                    :style="{ width: `${(deployProgress.currentStep / Math.max(deployProgress.totalSteps, 1)) * 100}%` }"
                  ></div>
                </div>

                <div class="flex items-center gap-2 text-sm">
                  <Loader2 v-if="deployProgress.status === 'converting'" class="h-4 w-4 animate-spin text-blue-500" />
                  <CheckCircle v-else-if="deployProgress.status === 'completed'" class="h-4 w-4 text-green-500" />
                  <XCircle v-else-if="deployProgress.status === 'error'" class="h-4 w-4 text-red-500" />
                  <Clock v-else class="h-4 w-4 text-muted-foreground" />
                  <span :class="{
                    'text-muted-foreground': deployProgress.status === 'pending',
                    'text-blue-500': deployProgress.status === 'converting',
                    'text-green-500': deployProgress.status === 'completed',
                    'text-red-500': deployProgress.status === 'error'
                  }">{{ deployProgress.message }}</span>
                </div>

                <div v-if="deployProgress.convertedLabels.length > 0" class="flex flex-wrap gap-1">
                  <Badge 
                    v-for="label in deployProgress.convertedLabels" 
                    :key="label" 
                    variant="secondary"
                    class="text-xs"
                  >
                    <CheckCircle class="h-3 w-3 mr-1" />
                    {{ label }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
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
