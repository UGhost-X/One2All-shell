<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, inject, watch, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { Play, Square, Trash2, RefreshCw, Box, Loader2, FolderOpen, CheckCircle, XCircle, FileText, X } from 'lucide-vue-next'
import Switch from '@/components/ui/switch/Switch.vue'

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
const toast = inject<any>('toast')

interface Product {
  id: string
  name: string
  model: string
}

const products = ref<Product[]>([])
const productId = ref<string | null>(null)
const productName = ref('')
const apiBase = ref('')
const isInitialized = ref(false)

const loadSettings = async () => {
  if (typeof window !== 'undefined' && window.electronAPI) {
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
if (typeof window !== 'undefined') {
  loadSettings()
}

const backendPort = '8000'
const getBackendUrl = (path: string) => `http://${apiBase.value}:${backendPort}${path}`

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



const loadServiceLog = async (serviceId: string, incremental = false) => {
  if (!serviceId) return
  const current = serviceLogs.value[serviceId]
  const currentContent = current?.content || ''

  const fromLine = incremental ? (current?.nextLine || 0) : -1

  if (!incremental) {
    serviceLogs.value[serviceId] = { content: currentContent, loading: true, nextLine: fromLine }
  }

  try {
    const res = await fetch(getBackendUrl(`/deploy/http/service/${serviceId}/logs?lines=${logLines.value}&from_line=${fromLine}`))
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
    } else if (res.status === 404) {
      // 服务不存在，停止轮询
      removeServiceLogPolling(serviceId)
      if (!incremental) {
        serviceLogs.value[serviceId] = { content: t('deploy.serviceNotFound'), loading: false, nextLine: 0 }
      }
    } else {
      if (!incremental) {
        serviceLogs.value[serviceId] = { content: t('deploy.loadLogsFailed'), loading: false, nextLine: 0 }
      }
    }
  } catch (err: any) {
    console.error('Failed to load service logs:', err)
    // 网络错误，停止轮询
    removeServiceLogPolling(serviceId)
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
  productId.value = id || null
  const product = products.value.find(p => String(p.id) === String(productId.value))
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
    const url = getBackendUrl(`/project/${productId.value}/models`)
    const res = await fetch(url)
    const data = await res.json()
    const allModels = data.models || []

    const modelMap = new Map<string, DeployableModel>()
    for (const model of allModels) {
      if (!modelMap.has(model.task_uuid)) {
        modelMap.set(model.task_uuid, {
          task_uuid: model.task_uuid,
          labels: [],
          model_paths: {},
          onnx_status: model.onnx_status || {},
          created_at: model.created_at
        })
      }
      const existingModel = modelMap.get(model.task_uuid)!
      if (model.labels && Array.isArray(model.labels)) {
        existingModel.labels = [...new Set([...existingModel.labels, ...model.labels])]
      }
      if (model.model_paths) {
        Object.assign(existingModel.model_paths, model.model_paths)
      }
    }

    const uniqueModels = Array.from(modelMap.values())

    for (const model of uniqueModels) {
      try {
        const records = await window.electronAPI.getTrainingRecordsByTaskUuid(model.task_uuid)
        if (records && records.length > 0) {
          model.created_at = records[0].createdAt || records[0].startTime || records[0].created_at
        }
      } catch (e) {
        console.warn('[Deploy] Failed to get training record for', model.task_uuid, e)
      }
    }

    deployableModels.value = uniqueModels.sort((a: DeployableModel, b: DeployableModel) => {
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
    const url = getBackendUrl(`/deploy/http/services?project_id=${productId.value}&include_health=true`)
    const res = await fetch(url)
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



const startService = async (taskUuid: string, labels?: string[]) => {
  startingUuid.value = taskUuid
  
  try {
    // 先停止该模型的其他运行中服务
    const existingServices = getServicesForUuid(taskUuid)
    for (const svc of existingServices) {
      if (svc.status === 'running' || svc.status === 'starting') {
        try {
          await fetch(getBackendUrl(`/deploy/http/service/${svc.service_id}/stop`), { method: 'POST' })
          removeServiceLogPolling(svc.service_id)
          delete serviceLogs.value[svc.service_id]
        } catch (e) {
          console.warn(`停止已有服务失败: ${svc.service_id}`, e)
        }
      }
    }
    
    const res = await fetch(getBackendUrl('/deploy/http'), {
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

    if (data.success) {
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
    const res = await fetch(getBackendUrl(`/deploy/http/service/${serviceId}/stop`), { method: 'POST' })
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
    const res = await fetch(getBackendUrl(`/deploy/http/service/${serviceId}`), {
      method: 'DELETE'
    })

    if (res.ok || res.status === 404) {
      toast?.success(t('deploy.messages.deleteSuccess'))
      const serviceIndex = services.value.findIndex(s => s.service_id === serviceId)
      if (serviceIndex > -1) {
        services.value.splice(serviceIndex, 1)
      }
      removeServiceLogPolling(serviceId)
      delete serviceLogs.value[serviceId]
      const hasServicesToCheck = services.value.some(s =>
        s.status !== 'running' && s.status !== 'stopped'
      )
      if (!hasServicesToCheck) {
        stopServicesPolling()
      }
    } else {
      const data = await res.json().catch(() => ({}))
      toast?.error(data.message || t('deploy.messages.deleteFailed'))
    }
  } catch (err) {
    console.error('Failed to delete service:', err)
    const serviceIndex = services.value.findIndex(s => s.service_id === serviceId)
    if (serviceIndex > -1) {
      services.value.splice(serviceIndex, 1)
    }
    removeServiceLogPolling(serviceId)
    delete serviceLogs.value[serviceId]
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
    const res = await fetch(getBackendUrl(`/deploy/http/service/${logServiceId.value}/logs?lines=${logLines.value}`))
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
    const res = await fetch(getBackendUrl(`/deploy/http/service/${serviceId}/health`))
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
  if (isInitialized.value) return
  isInitialized.value = true

  await loadProducts()

  const qProductId = route.query.productId
  const qProductName = route.query.productName

  if (qProductId) {
    productId.value = String(qProductId)
    productName.value = String(qProductName || '')
  } else {
    const savedProductId = localStorage.getItem('selectedProductId')
    if (savedProductId) {
      productId.value = savedProductId
      const product = products.value.find(p => String(p.id) === savedProductId)
      if (product) {
        productName.value = product.name
      }
    } else if (products.value.length > 0) {
      const firstProduct = products.value[0]
      productId.value = String(firstProduct.id)
      productName.value = firstProduct.name
    }
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

onActivated(async () => {
  await loadSettings()
  if (productId.value) {
    await loadServices()
  }
})

watch(() => route.query.productId, async (newProductId) => {
  const newId = newProductId ? String(newProductId) : null
  if (newId && newId !== productId.value) {
    productId.value = newId
    productName.value = String(route.query.productName || '')
    loadDeployableModels()
    loadServices()
    
    if (productId.value) {
      startServicesPolling()
    } else {
      stopServicesPolling()
    }
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
                      <UiSelectItem value="50">50</UiSelectItem>
                      <UiSelectItem value="100">100</UiSelectItem>
                      <UiSelectItem value="200">200</UiSelectItem>
                      <UiSelectItem value="500">500</UiSelectItem>
                      <UiSelectItem value="1000">1000</UiSelectItem>
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



        </template>
      </div>

    </main>



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
                  <UiSelectItem value="50">50</UiSelectItem>
                  <UiSelectItem value="100">100</UiSelectItem>
                  <UiSelectItem value="200">200</UiSelectItem>
                  <UiSelectItem value="500">500</UiSelectItem>
                  <UiSelectItem value="1000">1000</UiSelectItem>
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
