<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick, inject, onBeforeUnmount, onActivated, onDeactivated } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRuntimeConfig } from '#app'
import { X, Settings2, Pin, PinOff, Settings, TrendingDown, Activity, ListChecks, Square, Layers, GitCommit, Zap, Terminal, Play } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)
import UiButton from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import Slider from '@/components/ui/slider/Slider.vue'
import UiSelect from '@/components/ui/select/Select.vue'
import UiSelectContent from '@/components/ui/select/SelectContent.vue'
import UiSelectItem from '@/components/ui/select/SelectItem.vue'
import UiSelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import UiSelectValue from '@/components/ui/select/SelectValue.vue'
import Progress from '@/components/ui/progress/Progress.vue'

definePageMeta({ keepalive: true })

const { t } = useI18n()
const route = useRoute()

const isPinned = ref(false)
const togglePin = async () => {
  if (window.electronAPI) {
    isPinned.value = await window.electronAPI.toggleAlwaysOnTop()
  }
}

const config = useRuntimeConfig()
const toast = inject<any>('toast')

const steps = computed(() => [
  { key: 'annotation', label: t('common.dataAnnotation'), to: '/annotation' },
  { key: 'training', label: t('common.dataTraining'), to: '/training' },
  { key: 'deploy', label: t('common.serviceDeployment'), to: '/deploy' }
])

const innerStep = ref<'augment' | 'train' | 'monitor'>('augment')

const productId = ref<number | null>(null)
const productName = ref('')
const baseImageUrl = ref('')
const baseImageSize = ref({ width: 0, height: 0 })
const augmentedImageUrl = ref('')
const isAugmenting = ref(false)
const isAutoAugment = ref(false)
const currentAnnotations = ref<any[]>([])
const augmentedResults = ref<any[]>([])
const labelConfigs = ref<any[]>([])

const versionName = ref('v1.0')
const isSaved = ref(false)
const datasetVersions = ref<any[]>([])
const selectedDatasetVersionId = ref<string>('')
const isVersionSelectOpen = ref(false)

const lastSavedVersionId = ref<number | null>(null)

const showSaveDialog = ref(false)
const showDeleteConfirm = ref(false)
const deletingVersionId = ref<number | null>(null)

const confirmDeleteVersion = (id: number) => {
  deletingVersionId.value = id
  showDeleteConfirm.value = true
  isVersionSelectOpen.value = false
}

const handleDeleteVersion = async () => {
  if (deletingVersionId.value == null) return
  
  try {
    if (selectedDatasetVersionId.value === String(deletingVersionId.value)) {
      selectedDatasetVersionId.value = ''
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    await window.electronAPI.deleteDatasetVersion(deletingVersionId.value)
    toast?.success(t('common.deleteSuccess'))
    if (productId.value) {
      datasetVersions.value = await window.electronAPI.getDatasetVersions(productId.value)
    }
  } catch (err: any) {
    toast?.error(`${t('common.deleteFailed')}: ${err.message}`)
  } finally {
    showDeleteConfirm.value = false
    deletingVersionId.value = null
  }
}
const saveDisplayName = ref('')
const saveVersionName = ref('')
const isSavingDataset = ref(false)

// Reset isSaved when augmented results change
watch(augmentedResults, () => {
  if (isRollingBack.value) return
  isSaved.value = false
})

const currentPreset = ref<'none' | 'basic' | 'standard' | 'heavy' | 'custom'>('none')

const parseVersionIndex = (name: string) => {
  const m = /^v(\d+)$/.exec((name || '').trim())
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

const getNextVersionName = (versions: any[]) => {
  let max = 0
  for (const v of versions || []) {
    const n = parseVersionIndex(v?.versionName)
    if (n != null) max = Math.max(max, n)
  }
  return `v${Math.max(1, max + 1)}`
}

const openSaveDialog = () => {
  if (augmentedResults.value.length === 0) return
  saveDisplayName.value = ''
  saveVersionName.value = getNextVersionName(datasetVersions.value)
  showSaveDialog.value = true
}

const closeSaveDialog = () => {
  showSaveDialog.value = false
}

const confirmSaveDataset = async () => {
  if (!saveDisplayName.value.trim()) {
    toast?.error(t('training.view.nameRequired'))
    return
  }
  if (!saveVersionName.value.trim()) {
    toast?.error(t('training.view.versionRequired'))
    return
  }
  await handleSaveDataset({ displayName: saveDisplayName.value.trim(), versionName: saveVersionName.value.trim() })
}

const handleSaveDataset = async (opts?: { displayName: string; versionName: string }) => {
  if (augmentedResults.value.length === 0) return
  if (!productId.value) return

  try {
    isSavingDataset.value = true
    if (opts?.versionName) versionName.value = opts.versionName

    // Prepare COCO data for all augmented images
    const cocoData = {
      images: augmentedResults.value.map((res, idx) => ({
        id: idx + 1,
        width: res.width,
        height: res.height,
        file_name: `image_${idx + 1}.jpg`
      })),
      annotations: augmentedResults.value.flatMap((res, resIdx) => 
        res.annotations.map((ann: any, annIdx: number) => {
          // Recalculate bbox and area for the augmented image
          const calculateBbox = (points: any, type: string) => {
            if (type === 'rect') return points
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
            for (let i = 0; i < points.length; i += 2) {
              const x = points[i]; const y = points[i+1]
              minX = Math.min(minX, x); minY = Math.min(minY, y)
              maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
            }
            return [minX, minY, maxX - minX, maxY - minY]
          }
          const calculateArea = (points: any, type: string) => {
            if (type === 'rect') return points[2] * points[3]
            let area = 0
            for (let i = 0; i < points.length; i += 2) {
              const j = (i + 2) % points.length
              area += points[i] * points[j + 1]; area -= points[j] * points[i + 1]
            }
            return Math.abs(area) / 2
          }

          const bbox = calculateBbox(ann.points, ann.type)
          const area = calculateArea(ann.points, ann.type)
          let segmentation: number[][] = []
          if (ann.type === 'rect') {
            const [x, y, w, h] = ann.points
            segmentation = [[x, y, x + w, y, x + w, y + h, x, y + h]]
          } else {
            segmentation = [ann.points]
          }

          return {
            id: resIdx * 1000 + annIdx + 1,
            image_id: resIdx + 1,
            category_id: ann.categoryId || 1,
            segmentation,
            area,
            bbox,
            iscrowd: 0
          }
        })
      ),
      categories: labelConfigs.value.map((l, idx) => ({
        id: idx + 1,
        name: l.name,
        supercategory: 'none'
      }))
    }

    const saveResult = await window.electronAPI.saveDataset(JSON.parse(JSON.stringify({
      productId: productId.value,
      versionName: opts?.versionName || versionName.value,
      moduleName: 'data_augmentation',
      images: augmentedResults.value,
      cocoData
    })))

    if (saveResult.success) {
      const savedVersion = await window.electronAPI.saveDatasetVersion(JSON.parse(JSON.stringify({
        productId: productId.value,
        displayName: opts?.displayName || '',
        versionName: opts?.versionName || versionName.value,
        moduleName: 'data_augmentation',
        savePath: saveResult.path,
        imageCount: augmentedResults.value.length,
        config: JSON.stringify({
          preset: currentPreset.value,
          augmentConfig: augmentConfig.value,
          sliceConfig: sliceConfig.value
        })
      })))
      if (savedVersion?.id != null) lastSavedVersionId.value = savedVersion.id

      isSaved.value = true
      toast?.success(t('training.view.saveSuccess'))
      
      // Refresh versions
      datasetVersions.value = await window.electronAPI.getDatasetVersions(productId.value)
      versionName.value = getNextVersionName(datasetVersions.value)
      selectedDatasetVersionId.value = ''
      closeSaveDialog()
    } else {
      throw new Error(saveResult.error)
    }
  } catch (err: any) {
    console.error('Save dataset error:', err)
    toast?.error(`${t('training.view.saveFailed')}: ${err.message}`)
  } finally {
    isSavingDataset.value = false
  }
}

const showUnsavedDialog = ref(false)

const settingsDataPath = ref('')

const trainDatasetVersionId = ref<string>('')
const trainDatasetResults = ref<any[]>([])

const trainProjectVersion = ref('v1')
const trainRunCount = ref(1)
const selectedTrainLabelNames = ref<string[]>([])

// Computed for single-select label selection
const labelSelectionValue = computed({
  get: () => selectedTrainLabelNames.value.length === 0 ? 'all' : selectedTrainLabelNames.value[0],
  set: (val) => {
    if (val === 'all') {
      selectedTrainLabelNames.value = []
    } else {
      selectedTrainLabelNames.value = [val]
    }
  }
})
const trainModelName = ref('STFPM')
const isTrainDatasetVersionOpen = ref(false)
const isTrainStartModeOpen = ref(false)
const isResumeModeOpen = ref(false)
const isLabelSelectOpen = ref(false)
const trainStartMode = ref<'fresh' | 'resume'>('fresh')
const resumeMode = ref<'interrupted' | 'extended'>('interrupted')

const trainRunCountStorageKey = computed(() => {
  const pid = productId.value == null ? '' : String(productId.value)
  const datasetKey = trainDatasetVersionId.value ? `dataset_${String(trainDatasetVersionId.value)}` : 'dataset_current'
  const projectVersionKey = String(trainProjectVersion.value || '')
  const modelKey = String(trainModelName.value || '')
  return `one2all.training.runCount.${pid}.${projectVersionKey}.${datasetKey}.${modelKey}`
})

const trainStartModeStorageKey = computed(() => {
  const pid = productId.value == null ? '' : String(productId.value)
  return `one2all.training.startMode.${pid}`
})

const innerStepStorageKey = computed(() => {
  const pid = productId.value == null ? '' : String(productId.value)
  return `one2all.training.innerStep.${pid}`
})

const parsePositiveInt = (raw: any) => {
  const n = Math.round(Number(raw))
  return Number.isFinite(n) && n > 0 ? n : null
}

watch(trainRunCountStorageKey, (key) => {
  if (!key) return
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(key)
  const n = parsePositiveInt(raw)
  if (n != null) trainRunCount.value = n
}, { immediate: true })

watch(trainStartModeStorageKey, (key) => {
  if (!key) return
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(key)
  if (raw === 'fresh' || raw === 'resume') trainStartMode.value = raw
}, { immediate: true })

watch(innerStepStorageKey, (key) => {
  if (!key) return
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(key)
  if (raw === 'augment' || raw === 'train' || raw === 'monitor') innerStep.value = raw
}, { immediate: true })

watch(trainRunCount, (v) => {
  const key = trainRunCountStorageKey.value
  if (!key) return
  if (typeof window === 'undefined') return
  const n = parsePositiveInt(v)
  if (n != null) window.localStorage.setItem(key, String(n))
})

watch(innerStep, (step) => {
  const key = innerStepStorageKey.value
  if (!key) return
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, step)
})

const resetMonitorState = (opts?: { clearActive?: boolean }) => {
  closeMonitorStream()
  stopGroupPolling()
  monitorStatus.value = ''
  monitorProgress.value = 0
  monitorLogs.value = []
  monitorGroupProgress.value = 0
  monitorGroupStatus.value = ''
  selectedEpoch.value = null
  monitorTaskId.value = 'all'
  if (opts?.clearActive) {
    groupMetrics.value = {}
    trainTasks.value = []
    trainGroupId.value = ''
    currentBaseEpoch.value = 0
  }
}

const loadTaskSnapshot = async (taskId: string) => {
  if (!taskId) return
  try {
    const apiBase = config.public.apiBase || 'http://localhost:8000'
    const url = `${apiBase.replace(/\/$/, '')}/train/status/${encodeURIComponent(taskId)}`
    const res = await fetch(url)
    if (!res.ok) return
    const data = await res.json()
    applyMonitorPayload(taskId, data)
  } catch {
  }
}

const restoreActiveTrainingState = async () => {
  if (typeof window === 'undefined') return false
  const gidKey = trainGroupIdStorageKey.value
  const tasksKey = trainTasksStorageKey.value
  const savedGid = window.localStorage.getItem(gidKey)
  const savedTasksRaw = window.localStorage.getItem(tasksKey)
  if (!savedGid || !savedTasksRaw) return false
  try {
    const savedTasks = JSON.parse(savedTasksRaw)
    if (!Array.isArray(savedTasks) || savedTasks.length === 0) return false
    trainGroupId.value = savedGid
    trainTasks.value = savedTasks
    innerStep.value = 'train'
    activeMonitorTab.value = 'overview'
    monitorTaskId.value = 'all'
    startGroupPolling()
    await Promise.all(savedTasks.map((t: any) => loadTaskSnapshot(String(t?.task_id || ''))))
    return true
  } catch {
    return false
  }
}

const hasAppliedStartModeSideEffects = ref(false)
watch(trainStartMode, async (mode, prev) => {
  const key = trainStartModeStorageKey.value
  if (key && typeof window !== 'undefined') window.localStorage.setItem(key, mode)

  if (!hasAppliedStartModeSideEffects.value) {
    hasAppliedStartModeSideEffects.value = true
    return
  }
  if (mode === prev) return

  if (mode === 'fresh') {
    resetMonitorState({ clearActive: true })
  } else if (mode === 'resume') {
    resetMonitorState()
    await restoreActiveTrainingState()
  }
})

const isTrainingStarting = ref(false)
const isStoppingTask = ref(false)
const isStoppingGroup = ref(false)
const selectedTaskIds = ref<Set<string>>(new Set())

const isAllSelected = computed(() => {
  const cancelableTasks = trainTasks.value.filter(t => 
    ['pending', 'running', 'training', 'starting'].includes(t.status?.toLowerCase() || '')
  )
  return cancelableTasks.length > 0 && cancelableTasks.every(t => selectedTaskIds.value.has(t.task_id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedTaskIds.value.clear()
  } else {
    trainTasks.value.forEach(t => {
      if (['pending', 'running', 'training', 'starting'].includes(t.status?.toLowerCase() || '')) {
        selectedTaskIds.value.add(t.task_id)
      }
    })
  }
}

const toggleTaskSelection = (taskId: string) => {
  if (selectedTaskIds.value.has(taskId)) {
    selectedTaskIds.value.delete(taskId)
  } else {
    selectedTaskIds.value.add(taskId)
  }
}

const batchCancel = async () => {
  if (selectedTaskIds.value.size === 0) return
  
  isStoppingTask.value = true
  try {
    const idsToCancel = Array.from(selectedTaskIds.value)
    // Sequentially or in parallel? Parallel is faster.
    await Promise.all(idsToCancel.map(async (id) => {
      const apiBase = config.public.apiBase || 'http://localhost:8000'
      const url = `${apiBase.replace(/\/$/, '')}/train/stop/${id}`
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) {
        console.error(`Failed to stop task ${id}:`, await res.text())
      }
    }))
    selectedTaskIds.value.clear()
    toast?.success(t('training.monitor.batchCancelSuccess'))
  } catch (err: any) {
    toast?.error(`${t('training.monitor.batchCancelFailed')}: ${err.message}`)
  } finally {
    isStoppingTask.value = false
  }
}
const isResumingTask = ref(false)
const trainTasks = ref<{ label: string; task_id: string; status?: string; progress?: number }[]>([])
const trainGroupId = ref('')

// Storage keys for persisting active training state
const trainGroupIdStorageKey = computed(() => {
  const pid = productId.value == null ? '' : String(productId.value)
  return `one2all.training.activeGroupId.${pid}`
})

const trainTasksStorageKey = computed(() => {
  const pid = productId.value == null ? '' : String(productId.value)
  return `one2all.training.activeTasks.${pid}`
})

// Persistence for active training state
watch(trainGroupId, (id) => {
  const key = trainGroupIdStorageKey.value
  if (!key || typeof window === 'undefined') return
  if (id) {
    window.localStorage.setItem(key, id)
  } else {
    window.localStorage.removeItem(key)
  }
})

watch(trainTasks, (tasks) => {
  const key = trainTasksStorageKey.value
  if (!key || typeof window === 'undefined') return
  if (tasks && tasks.length > 0) {
    window.localStorage.setItem(key, JSON.stringify(tasks))
  } else {
    window.localStorage.removeItem(key)
  }
}, { deep: true })
const monitorGroupProgress = ref(0)
const monitorGroupStatus = ref('')
const activeMonitorTab = ref('overview')

const monitorTaskId = ref('all')
const isTaskSelectOpen = ref(false)
const monitorStatus = ref('')
const monitorProgress = ref(0)
const monitorLogs = ref<string[]>([])
const groupMetrics = ref<Record<string, any[]>>({})
const selectedEpoch = ref<number | null>(null)
let monitorEventSources: Record<string, EventSource> = {}
let groupPollingTimer: any = null

const isMonitorRunning = (status?: string) => {
  const s = String(status || '').toLowerCase()
  return s === 'running' || s === 'training' || s === 'starting' || s === 'pending'
}

const getStatusColor = (status?: string) => {
  const s = String(status || '').toLowerCase()
  if (s === 'completed' || s === 'success') return 'bg-green-500'
  if (s === 'running' || s === 'training' || s === 'starting') return 'bg-blue-500'
  if (s === 'failed' || s === 'error') return 'bg-red-500'
  if (s === 'canceled' || s === 'stopped' || s === 'aborted') return 'bg-gray-400'
  return 'bg-gray-400'
}

const getStatusClass = (status?: string) => {
  const color = getStatusColor(status)
  const s = String(status || '').toLowerCase()
  const isRunning = s === 'running' || s === 'training' || s === 'starting'
  return `${color} ${isRunning ? 'animate-pulse' : ''}`
}

const startGroupPolling = () => {
  stopGroupPolling()
  groupPollingTimer = setInterval(async () => {
    if (!trainGroupId.value) return
    try {
      const apiBase = config.public.apiBase || 'http://localhost:8000'
      const url = `${apiBase.replace(/\/$/, '')}/train/status/group/${trainGroupId.value}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const isGroupCompleted = String(data.status || '').toLowerCase() === 'completed' || String(data.status || '').toLowerCase() === 'success'
        monitorGroupProgress.value = isGroupCompleted ? 100 : (data.progress || 0)
        monitorGroupStatus.value = data.status || ''
        if (Array.isArray(data.tasks)) {
          // Update individual task status/progress in the list
          trainTasks.value = trainTasks.value.map(t => {
            const remote = data.tasks.find((rt: any) => rt.task_id === t.task_id)
            if (remote) {
              const isTaskCompleted = String(remote.status || '').toLowerCase() === 'completed' || String(remote.status || '').toLowerCase() === 'success'
              return { 
                ...t, 
                status: remote.status, 
                progress: isTaskCompleted ? 100 : (remote.progress != null ? Number(remote.progress) : t.progress) 
              }
            }
            return t
          })
        }
        if (data.status === 'completed' || data.status === 'failed') {
          stopGroupPolling()
          // Clear persistence when group is finished
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(trainGroupIdStorageKey.value)
            window.localStorage.removeItem(trainTasksStorageKey.value)
          }
        }
      }
    } catch (err) {
      console.error('Group polling failed:', err)
    }
  }, 3000)
}

const stopGroupPolling = () => {
  if (groupPollingTimer) {
    clearInterval(groupPollingTimer)
    groupPollingTimer = null
  }
}

onBeforeUnmount(() => {
  closeMonitorStream()
  stopGroupPolling()
})

type TrainMetricPoint = {
  epoch: number
  iter: number
  total_iters: number
  loss: number
  lr: number
}

const overallMonitorMetrics = computed<TrainMetricPoint[]>(() => {
  const tasks = trainTasks.value || []
  if (tasks.length === 0) return []

  const acc = new Map<string, { epoch: number; iter: number; total_iters: number; lossSum: number; lrSum: number; count: number }>()

  for (const tItem of tasks) {
    const metrics = groupMetrics.value[tItem.task_id] || []
    for (const m of metrics) {
      const epoch = Number((m as any)?.epoch)
      const iter = Number((m as any)?.iter)
      const totalIters = Number((m as any)?.total_iters)
      const loss = Number((m as any)?.loss)
      const lr = Number((m as any)?.lr)
      if (
        !Number.isFinite(epoch) ||
        !Number.isFinite(iter) ||
        !Number.isFinite(totalIters) ||
        !Number.isFinite(loss) ||
        !Number.isFinite(lr)
      ) continue

      const key = `${epoch}-${iter}`
      const existing = acc.get(key)
      if (existing) {
        existing.total_iters = Math.max(existing.total_iters, totalIters)
        existing.lossSum += loss
        existing.lrSum += lr
        existing.count += 1
      } else {
        acc.set(key, { epoch, iter, total_iters: totalIters, lossSum: loss, lrSum: lr, count: 1 })
      }
    }
  }

  return Array.from(acc.values())
    .map(v => ({
      epoch: v.epoch,
      iter: v.iter,
      total_iters: v.total_iters,
      loss: v.lossSum / v.count,
      lr: v.lrSum / v.count
    }))
    .sort((a, b) => (a.epoch !== b.epoch ? a.epoch - b.epoch : a.iter - b.iter))
})

const cleanedMonitorMetrics = computed<TrainMetricPoint[]>(() => {
  const tid = monitorTaskId.value
  if (tid === 'all') return overallMonitorMetrics.value
  const arr = tid && groupMetrics.value[tid] ? groupMetrics.value[tid] : []
  return (arr || [])
    .map((m: any) => ({
      epoch: Number(m?.epoch),
      iter: Number(m?.iter),
      total_iters: Number(m?.total_iters),
      loss: Number(m?.loss),
      lr: Number(m?.lr)
    }))
    .filter(m =>
      Number.isFinite(m.epoch) &&
      Number.isFinite(m.iter) &&
      Number.isFinite(m.total_iters) &&
      Number.isFinite(m.loss) &&
      Number.isFinite(m.lr)
    )
})

const latestMonitorMetric = computed(() => {
  const tid = monitorTaskId.value
  if (tid && tid !== 'all') {
    const metrics = groupMetrics.value[tid] || []
    if (metrics.length === 0) return null
    const last = metrics[metrics.length - 1]
    return {
      epoch: Number(last.epoch),
      iter: Number(last.iter),
      total_iters: Number(last.total_iters),
      loss: Number(last.loss),
      lr: Number(last.lr)
    }
  }
  
  // Overall mode: average of latest metrics from all tasks
  let totalLoss = 0
  let count = 0
  let maxEpoch = 0
  let maxIter = 0
  let totalIters = 0
  let totalLr = 0

  trainTasks.value.forEach(tItem => {
    const metrics = groupMetrics.value[tItem.task_id] || []
    if (metrics.length > 0) {
      const last = metrics[metrics.length - 1]
      totalLoss += Number(last.loss || 0)
      totalLr += Number(last.lr || 0)
      maxEpoch = Math.max(maxEpoch, Number(last.epoch || 0))
      maxIter = Math.max(maxIter, Number(last.iter || 0))
      totalIters = Math.max(totalIters, Number(last.total_iters || 0))
      count++
    }
  })

  if (count === 0) return null
  return {
    loss: totalLoss / count,
    lr: totalLr / count,
    epoch: maxEpoch,
    iter: maxIter,
    total_iters: totalIters
  }
})

const CHART_COLORS = [
  'hsl(var(--primary))',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4'
]

const currentBaseEpoch = ref(0)

const targetTotalEpochs = computed(() => {
  const additional = Math.round(Number(trainConfig.value.epochs[0] || 10))
  if (trainStartMode.value === 'resume' && resumeMode.value === 'extended') {
    // 1. 如果正在进行续训（已记录基数），优先使用
    if (currentBaseEpoch.value > 0) {
      return currentBaseEpoch.value + additional
    }

    // 2. 如果没有记录基数（例如页面刷新后），尝试从当前 metrics 中推断
    let firstEpoch = 0
    let lastEpoch = 0
    for (const tid in groupMetrics.value) {
      const metrics = groupMetrics.value[tid]
      if (metrics && metrics.length > 0) {
        const e = Number(metrics[0].epoch)
        const l = Number(metrics[metrics.length - 1].epoch)
        if (Number.isFinite(e)) {
          if (firstEpoch === 0 || e < firstEpoch) firstEpoch = e
        }
        if (Number.isFinite(l)) {
          if (lastEpoch === 0 || l > lastEpoch) lastEpoch = l
        }
      }
    }

    if (firstEpoch > 0) {
      // 如果 metrics 从 1 开始，说明这是之前的完整训练数据（配置阶段）
      // 此时总目标 = 已完成(lastEpoch) + 追加(additional)
      if (firstEpoch === 1) {
        return lastEpoch + additional
      }
      // 如果 metrics 从 >1 开始，说明这是续训产生的增量数据
      // 此时总目标 = (起始轮次 - 1) + 追加
      return (firstEpoch - 1) + additional
    }
    
    // 3. 如果没有任何 metrics，回退到 latestMonitorMetric (如果存在)
    if (latestMonitorMetric.value?.epoch) {
      return latestMonitorMetric.value.epoch + additional
    }
  }
  return additional
})

// Auto-expand first running task when tasks update
watch(trainTasks, (tasks) => {
  // 清理不再处于可取消状态的任务选择
  const cancelableIds = new Set(tasks
    .filter(t => ['pending', 'running', 'training', 'starting'].includes(t.status?.toLowerCase() || ''))
    .map(t => t.task_id)
  )
  
  for (const id of selectedTaskIds.value) {
    if (!cancelableIds.has(id)) {
      selectedTaskIds.value.delete(id)
    }
  }

  if (tasks.length > 0) {
    // If no task selected or selected task is 'all', force select one
    if (!monitorTaskId.value || monitorTaskId.value === 'all') {
      const runningTask = tasks.find(t => {
        const s = (t.status || '').toLowerCase()
        return s === 'running' || s === 'training' || s === 'starting'
      })
      const targetTask = runningTask || tasks[0]
      if (targetTask) {
        monitorTaskId.value = targetTask.task_id
        loadTaskSnapshot(targetTask.task_id)
      }
    }
  }
}, { deep: true })

const normalizeProgressPercent = (v: any, status?: string) => {
  const s = String(status || '').toLowerCase()
  if (s === 'completed' || s === 'success') return 100
  let n = Number(v)
  if (!Number.isFinite(n)) return 0
  if (n > 0 && n <= 1) n = n * 100
  const clamped = Math.max(0, Math.min(100, n))
  if (clamped >= 99.9 && s !== 'completed' && s !== 'success') return 99
  return Math.round(clamped)
}

const parseEpochFromEpochIterLabel = (label: any) => {
  const s = String(label ?? '')
  const match = s.match(/(\d+)/)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) ? n : null
}

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: { color: 'rgba(200, 200, 200, 0.1)' },
      ticks: { font: { size: 9 } },
      title: { display: true, text: t('training.monitor.loss'), font: { size: 10 } }
    },
    x: {
      grid: { display: false },
      title: {
        display: true,
        text: selectedEpoch.value === null ? t('training.monitor.axis.epochIter') : t('training.monitor.axis.iter'),
        font: { size: 10 }
      },
      ticks: {
        font: { size: 9 },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: selectedEpoch.value === null ? 12 : 10,
        callback: (_: any, index: number) => {
          const labels = (combinedChartData.value.labels || []) as any[]

          if (selectedEpoch.value !== null) {
            const v = labels[index]
            return v == null ? '' : String(v)
          }

          const label = String(labels[index] ?? '')
          const epoch = parseEpochFromEpochIterLabel(label)
          if (epoch == null) return ''
          return t('training.monitor.axis.epochTick', { epoch })
        }
      }
    }
  },
  plugins: {
    legend: { 
      display: true, 
      position: 'top' as const, 
      align: 'end' as const,
      labels: { boxWidth: 10, font: { size: 10 }, usePointStyle: true } 
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#000',
      bodyColor: '#666',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      padding: 8,
      bodyFont: { size: 10 }
    }
  },
  onClick: (evt: any, elements: any, chart: any) => {
    if (selectedEpoch.value !== null) return
    const points = chart.getElementsAtEventForMode(evt, 'index', { intersect: false }, true)
    if (points.length > 0) {
      const idx = points[0].index
      const label = chart.data.labels[idx]
      const epoch = parseEpochFromEpochIterLabel(label)
      if (epoch != null) {
        selectedEpoch.value = epoch
        if (monitorTaskId.value === 'all') {
          const first = trainTasks.value[0]?.task_id
          if (first) monitorTaskId.value = first
        }
      }
    }
  }
}))

// Custom plugin to draw vertical lines between epochs
const epochLinesPlugin = {
  id: 'epochLines',
  beforeDraw: (chart: any) => {
    if (selectedEpoch.value !== null) return
    const { ctx, chartArea: { top, bottom }, scales: { x } } = chart
    const labels = chart.data.labels
    if (!labels || labels.length < 2) return

    ctx.save()
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)'
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 1

    let lastEpoch = -1
    labels.forEach((label: string, index: number) => {
      const epoch = parseEpochFromEpochIterLabel(label)
      if (epoch != null) {
        if (lastEpoch !== -1 && epoch !== lastEpoch) {
          const xPos = x.getPixelForValue(index) - (x.getPixelForValue(index) - x.getPixelForValue(index - 1)) / 2
          ctx.beginPath()
          ctx.moveTo(xPos, top)
          ctx.lineTo(xPos, bottom)
          ctx.stroke()
        }
        lastEpoch = epoch
      }
    })
    ctx.restore()
  }
}

const combinedChartData = computed(() => {
  if (selectedEpoch.value !== null) {
    const effectiveTaskId = monitorTaskId.value && monitorTaskId.value !== 'all'
      ? monitorTaskId.value
      : (trainTasks.value[0]?.task_id || '')

    if (!effectiveTaskId) return { labels: [], datasets: [] }

    const tItem = trainTasks.value.find(t => t.task_id === effectiveTaskId)
    const taskIdx = trainTasks.value.findIndex(t => t.task_id === effectiveTaskId)
    const color = CHART_COLORS[taskIdx % CHART_COLORS.length] || 'hsl(var(--primary))'

    const metrics = (groupMetrics.value[effectiveTaskId] || [])
      .filter(m => Number(m.epoch) === selectedEpoch.value)
      .map(m => ({ iter: Number(m.iter), loss: Number(m.loss) }))
      .filter(m => Number.isFinite(m.iter) && Number.isFinite(m.loss))
      .sort((a, b) => a.iter - b.iter)

    return {
      labels: metrics.map(m => m.iter),
      datasets: [
        {
          label: tItem?.label || effectiveTaskId,
          data: metrics.map(m => m.loss),
          borderColor: color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          spanGaps: true
        }
      ]
    }
  }

  const tid = monitorTaskId.value
  const visibleTasks = tid && tid !== 'all'
    ? trainTasks.value.filter(t => t.task_id === tid)
    : trainTasks.value

  const allPoints: any[] = []
  visibleTasks.forEach(t => {
    const metrics = groupMetrics.value[t.task_id] || []
    metrics.forEach(m => allPoints.push(m))
  })

  const sortedIters = Array.from(new Set(allPoints.map(p => `${p.epoch}-${p.iter}`)))
    .sort((a, b) => {
      const [e1, i1] = a.split('-').map(Number)
      const [e2, i2] = b.split('-').map(Number)
      return e1 !== e2 ? e1 - e2 : i1 - i2
    })

  const datasets = visibleTasks.map((t) => {
    const metrics = groupMetrics.value[t.task_id] || []
    const dataMap = new Map(metrics.map(m => [`${m.epoch}-${m.iter}`, m.loss]))

    const originalIdx = trainTasks.value.findIndex(task => task.task_id === t.task_id)
    const color = CHART_COLORS[originalIdx % CHART_COLORS.length] || 'hsl(var(--primary))'

    return {
      label: t.label,
      data: sortedIters.map(iter => dataMap.get(iter) ?? null),
      borderColor: color,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.3,
      spanGaps: true
    }
  })

  return {
    labels: sortedIters.map(s => {
      const [e, i] = s.split('-')
      return t('training.monitor.axis.epochIterLabel', { epoch: Number(e), iter: Number(i) })
    }),
    datasets
  }
})

const formatMetricNumber = (v: number) => {
  if (!Number.isFinite(v)) return '-'
  const s = v.toFixed(6)
  return s.replace(/0+$/, '').replace(/\.$/, '')
}

const enrichedLoadedImages = (images: any[]) => {
  return (images || []).map((img: any) => ({
    ...img,
    annotations: (img.annotations || []).map((ann: any) => {
      const labelInfo = labelConfigs.value[ann.categoryId - 1] || {}
      return {
        ...ann,
        color: labelInfo.color || '#3b82f6',
        label: labelInfo.name || `Label ${ann.categoryId}`
      }
    })
  }))
}

const loadTrainDatasetFromVersion = async (id: string) => {
  const v = datasetVersions.value.find(vv => String(vv.id) === String(id))
  if (!v) throw new Error('Version not found')
  const loadResult = await window.electronAPI?.loadDataset?.({ id: v.id, savePath: v.savePath })
  if (!loadResult?.success) throw new Error(loadResult?.error || 'Load failed')
  trainDatasetResults.value = enrichedLoadedImages(loadResult.images || [])
}

const enterTrainStep = async (opts?: { useCurrent?: boolean }) => {
  if (opts?.useCurrent) {
    trainDatasetVersionId.value = ''
    trainDatasetResults.value = JSON.parse(JSON.stringify(augmentedResults.value || []))
    innerStep.value = 'train'
    return
  }

  const preferred =
    (lastSavedVersionId.value != null ? String(lastSavedVersionId.value) : '') ||
    (selectedDatasetVersionId.value ? String(selectedDatasetVersionId.value) : '') ||
    (datasetVersions.value?.[0]?.id != null ? String(datasetVersions.value[0].id) : '')

  if (!preferred) {
    trainDatasetVersionId.value = ''
    trainDatasetResults.value = JSON.parse(JSON.stringify(augmentedResults.value || []))
    innerStep.value = 'train'
    return
  }

  trainDatasetVersionId.value = preferred
  try {
    await loadTrainDatasetFromVersion(preferred)
  } catch (err: any) {
    trainDatasetResults.value = JSON.parse(JSON.stringify(augmentedResults.value || []))
    toast?.error(`${t('training.view.rollbackFailed')}: ${err.message}`)
  }
  innerStep.value = 'train'
}

const handleNextStep = () => {
  if (augmentedResults.value.length > 0 && !isSaved.value) {
    showUnsavedDialog.value = true
    return
  }
  enterTrainStep()
}

const trainDataVersionName = computed(() => {
  if (!trainDatasetVersionId.value) return ''
  const v = datasetVersions.value.find(vv => String(vv.id) === String(trainDatasetVersionId.value))
  return v?.versionName || ''
})

const trainImagesCount = computed(() => trainDatasetResults.value.length)
const trainAnnotationsCount = computed(() => {
  let n = 0
  for (const img of trainDatasetResults.value || []) n += (img.annotations || []).length
  return n
})

watch(trainDatasetVersionId, async (id) => {
  if (!id) return
  if (innerStep.value !== 'train') return
  try {
    await loadTrainDatasetFromVersion(id)
  } catch (err: any) {
    toast?.error(`${t('training.view.rollbackFailed')}: ${err.message}`)
  }
})

const closeMonitorStream = (taskId?: string) => {
  if (taskId) {
    if (monitorEventSources[taskId]) {
      monitorEventSources[taskId].close()
      delete monitorEventSources[taskId]
    }
  } else {
    Object.values(monitorEventSources).forEach(es => es.close())
    monitorEventSources = {}
  }
}

const openMonitorStream = (taskId: string) => {
  if (!taskId || monitorEventSources[taskId]) return
  const apiBase = config.public.apiBase || 'http://localhost:8000'
  const url = `${apiBase.replace(/\/$/, '')}/train/events/${encodeURIComponent(taskId)}`
  console.log(`[openMonitorStream] Opening stream for task: ${taskId}, URL: ${url}`)
  const es = new EventSource(url)
  monitorEventSources[taskId] = es
  
  const onAnyEvent = (e: MessageEvent) => {
    applyMonitorPayload(taskId, (e as any)?.data)
  }
  es.onmessage = onAnyEvent
  es.addEventListener('metrics', onAnyEvent as any)
  es.addEventListener('metric', onAnyEvent as any)
  es.addEventListener('logs', onAnyEvent as any)
  es.addEventListener('log', onAnyEvent as any)
  es.addEventListener('progress', onAnyEvent as any)
  es.addEventListener('status', onAnyEvent as any)
  es.onerror = () => {
    closeMonitorStream(taskId)
  }
}

const normalizeToArray = (v: any): any[] | null => {
  if (!v) return null
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v)
      return normalizeToArray(parsed)
    } catch {
      return null
    }
  }
  if (typeof v === 'object') {
    if (Array.isArray((v as any).metrics)) return (v as any).metrics
    if (Array.isArray((v as any).data)) return (v as any).data
    if (Array.isArray((v as any).items)) return (v as any).items
  }
  return null
}

const mergeMetricPoints = (taskId: string, incoming: any[], mode: 'replace' | 'append') => {
  if (!taskId) return
  console.log(`[mergeMetricPoints] Merging for task: ${taskId}, mode: ${mode}, incoming count: ${incoming?.length}`)
  const current = groupMetrics.value[taskId] || []
  const base = mode === 'replace' ? [] : current
  const merged = base.concat(incoming || [])
  const seen = new Set<string>()
  const out: any[] = []
  for (const m of merged) {
    const epoch = Number((m as any)?.epoch)
    const iter = Number((m as any)?.iter)
    const key = `${epoch}-${iter}`
    if (Number.isFinite(epoch) && Number.isFinite(iter)) {
      if (seen.has(key)) continue
      seen.add(key)
    }
    out.push(m)
  }
  groupMetrics.value[taskId] = out
}

const applyMonitorPayload = (taskId: string, raw: any) => {
  let data: any = raw
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data || '{}')
    } catch {
      data = { message: raw }
    }
  }

  const isCurrentTask = taskId === monitorTaskId.value

  // console.log(`[applyMonitorPayload] Received data for task: ${taskId}, isCurrent: ${isCurrentTask}`, data)

  if (data && typeof data === 'object') {
    if (isCurrentTask && typeof data.status === 'string') monitorStatus.value = data.status
    const isCompleted = String(data.status || '').toLowerCase() === 'completed' || String(data.status || '').toLowerCase() === 'success'
    
    if (isCurrentTask) {
      if (isCompleted) {
        monitorProgress.value = 100
      } else if (data.progress != null && data.progress !== '') {
        const p = Number(data.progress)
        if (Number.isFinite(p)) monitorProgress.value = p
      }
    }
  }

  if (isCurrentTask) {
    const logsCandidate =
      data?.new_logs ??
      data?.logs ??
      data?.log ??
      data?.new_log ??
      data?.message

    const logsArr = normalizeToArray(logsCandidate)
    if (logsArr && logsArr.length > 0) {
      console.log(`[applyMonitorPayload] Appending logs for ${taskId}:`, logsArr)
      monitorLogs.value = monitorLogs.value.concat(logsArr.map((x: any) => String(x)))
    } else if (typeof logsCandidate === 'string' && logsCandidate.trim()) {
      console.log(`[applyMonitorPayload] Appending log for ${taskId}:`, logsCandidate)
      monitorLogs.value = monitorLogs.value.concat([logsCandidate])
    }
  }

  const metricsCandidate =
    data?.new_metrics ??
    data?.metrics ??
    data?.metric ??
    data?.new_metric

  const metricsArr = normalizeToArray(metricsCandidate)
  if (metricsArr && metricsArr.length > 0) {
    const mode: 'replace' | 'append' = data?.new_metrics != null || data?.new_metric != null ? 'append' : 'replace'
    mergeMetricPoints(taskId, metricsArr, mode)
  } else if (Array.isArray(data)) {
    mergeMetricPoints(taskId, data, 'replace')
  }
}

watch(monitorTaskId, (taskId) => {
  monitorStatus.value = ''
  monitorProgress.value = 0
  monitorLogs.value = []
  if (!taskId || taskId === 'all') return

  openMonitorStream(taskId)
})

watch(trainTasks, (tasks) => {
  // Proactively open streams for all tasks in the group to collect metrics for "Overall" view
  // Note: Browser SSE limits might apply, but we try
  for (const t of tasks) {
    if (t.task_id) openMonitorStream(t.task_id)
  }
}, { deep: true })

watch(innerStep, (step) => {
  if (step === 'monitor') {
    monitorTaskId.value = 'all'
    selectedEpoch.value = null
  }
  if (step !== 'train') closeMonitorStream()
})

onActivated(() => {
  if (trainGroupId.value && !groupPollingTimer) startGroupPolling()
  for (const tItem of trainTasks.value) {
    if (tItem.task_id) openMonitorStream(tItem.task_id)
  }
  if (monitorTaskId.value && monitorTaskId.value !== 'all' && !monitorEventSources[monitorTaskId.value]) openMonitorStream(monitorTaskId.value)
  
  // Default to first running task if in overall view or no task selected
  if (monitorTaskId.value === 'all' || !monitorTaskId.value) {
    const runningTask = trainTasks.value.find(t => {
      const s = (t.status || '').toLowerCase()
      return s === 'running' || s === 'training' || s === 'starting'
    })
    const targetTask = runningTask || trainTasks.value[0]
    if (targetTask) {
      monitorTaskId.value = targetTask.task_id
      loadTaskSnapshot(targetTask.task_id)
    }
  }
})

onDeactivated(() => {
  closeMonitorStream()
  stopGroupPolling()
})

const buildTrainCocoData = (results: any[]) => {
  const calculateBbox = (points: any, type: string) => {
    if (type === 'rect') return points
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i]
      const y = points[i + 1]
      minX = Math.min(minX, x); minY = Math.min(minY, y)
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
    }
    return [minX, minY, maxX - minX, maxY - minY]
  }
  const calculateArea = (points: any, type: string) => {
    if (type === 'rect') return points[2] * points[3]
    let area = 0
    for (let i = 0; i < points.length; i += 2) {
      const j = (i + 2) % points.length
      area += points[i] * points[j + 1]
      area -= points[j] * points[i + 1]
    }
    return Math.abs(area) / 2
  }

  const images = (results || []).map((img, idx) => ({
    id: idx + 1,
    width: Number(img.width || 0),
    height: Number(img.height || 0),
    file_name: `image_${idx + 1}.jpg`
  }))

  let annId = 1
  const annotations = (results || []).flatMap((img, idx) => {
    return (img.annotations || []).map((ann: any) => {
      const bbox = calculateBbox(ann.points, ann.type)
      const area = calculateArea(ann.points, ann.type)
      const segmentation = ann.type === 'rect'
        ? [[bbox[0], bbox[1], bbox[0] + bbox[2], bbox[1], bbox[0] + bbox[2], bbox[1] + bbox[3], bbox[0], bbox[1] + bbox[3]]]
        : [ann.points]
      return {
        id: annId++,
        image_id: idx + 1,
        category_id: ann.categoryId || 1,
        bbox,
        points: ann.points,
        segmentation,
        area,
        iscrowd: 0,
        label: ann.label,
        type: ann.type
      }
    })
  })

  const categories = labelConfigs.value.map((l, idx) => ({
    id: idx + 1,
    name: l.name,
    supercategory: 'none'
  }))

  return { images, annotations, categories }
}

const startTraining = async () => {
  if (isTrainingStarting.value) return
  if (!productId.value) return
  if (!trainDatasetResults.value || trainDatasetResults.value.length === 0) {
    toast?.error(t('training.train.noData'))
    return
  }

  isTrainingStarting.value = true
  try {
    const settings = await window.electronAPI?.getSettings?.()
    const basePath = settings?.dataPath || settingsDataPath.value || ''
    const images = trainDatasetResults.value.map((img: any) => String(img.imageUrl || '').split(',')[1] || '')
    const cocoData = buildTrainCocoData(trainDatasetResults.value)

    const apiBase = config.public.apiBase || 'http://localhost:8000'
    const apiUrl = `${apiBase.replace(/\/$/, '')}/train/anomaly`

    const runCountToSend = Math.max(1, Math.round(Number(trainRunCount.value || 1)))
    
    // 计算最终要发送给后端的 epoch
    let additionalEpochs = Math.round(Number(trainConfig.value.epochs[0] || 10))
    let finalEpochs = additionalEpochs
    
    if (trainStartMode.value === 'resume' && resumeMode.value === 'extended') {
      // 完结续训：需要获取已完成的轮数并叠加
      let completedEpochs = latestMonitorMetric.value?.epoch || 0
      
      // 如果 latestMonitorMetric 没有获取到，尝试直接从 groupMetrics 中推断
      if (completedEpochs === 0) {
        for (const tid in groupMetrics.value) {
          const metrics = groupMetrics.value[tid]
          if (metrics && metrics.length > 0) {
            const lastEpoch = Number(metrics[metrics.length - 1].epoch)
            if (lastEpoch > completedEpochs) completedEpochs = lastEpoch
          }
        }
      }
      
      currentBaseEpoch.value = completedEpochs // 记录本次续训的基数
      finalEpochs = completedEpochs + additionalEpochs
      console.log(`[startTraining] Extended resume: completed ${completedEpochs} + additional ${additionalEpochs} = ${finalEpochs}`)
      
      // 确保 finalEpochs 至少比 completedEpochs 大
      if (finalEpochs <= completedEpochs) {
        finalEpochs = completedEpochs + additionalEpochs
      }
    } else {
      currentBaseEpoch.value = 0
    }

    console.log('[startTraining] Resetting state...')
    closeMonitorStream() 
    stopGroupPolling() // Ensure any existing polling is stopped
    monitorTaskId.value = ''
    
    // Explicitly reset all monitor state variables
    monitorStatus.value = ''
    monitorProgress.value = 0
    monitorLogs.value = []
    groupMetrics.value = {}
    selectedEpoch.value = null
    trainTasks.value = []
    trainGroupId.value = ''
    monitorGroupProgress.value = 0
    monitorGroupStatus.value = ''
    
    await nextTick()
    monitorTaskId.value = 'all' // Reset to 'all' after clearing
    
    console.log('[startTraining] State reset complete. groupMetrics:', groupMetrics.value)

    const payload = {
      images,
      coco_data: cocoData,
      base_path: basePath,
      project_id: String(productId.value),
      version: String(trainProjectVersion.value || 'v1'),
      data_version: String(trainDataVersionName.value || versionName.value || 'v1'),
      run_count: runCountToSend,
      model_name: String(trainModelName.value || 'STFPM'),
      train_epochs: finalEpochs,
      batch_size: Math.round(Number(trainConfig.value.batchSize[0] || 8)),
      learning_rate: Number(trainConfig.value.learningRate || 0.01),
      label_names: selectedTrainLabelNames.value.length > 0 ? selectedTrainLabelNames.value : null,
      resume_path: null,
      resume_mode: trainStartMode.value === 'resume' ? resumeMode.value : null
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    
    if (trainStartMode.value === 'fresh') {
      trainRunCount.value = runCountToSend + 1
    }

    trainGroupId.value = data.group_id || ''
    trainTasks.value = Array.isArray(data.tasks) ? data.tasks : []
    await Promise.all(trainTasks.value.map(t => loadTaskSnapshot(String((t as any)?.task_id || ''))))
    monitorTaskId.value = 'all'
    activeMonitorTab.value = 'overview'
    startGroupPolling()
  } catch (err: any) {
    toast?.error(`${t('training.train.startFailed')}: ${err.message}`)
  } finally {
    isTrainingStarting.value = false
  }
}

const stopTask = async (taskId?: string) => {
  const tid = taskId || monitorTaskId.value
  if (!tid || isStoppingTask.value) return
  isStoppingTask.value = true
  try {
    const apiBase = config.public.apiBase || 'http://localhost:8000'
    const url = `${apiBase.replace(/\/$/, '')}/train/stop/${tid}`
    const res = await fetch(url, { method: 'POST' })
    if (res.ok) {
      toast?.success(t('training.monitor.stopTaskSuccess'))
      // Only stop group polling if we're in overall view or stopping the last task
      // For now, simple approach: always check if group polling should continue
      // (The polling itself handles checking task statuses)
    } else {
      throw new Error(await res.text())
    }
  } catch (err: any) {
    toast?.error(`${t('training.monitor.stopTaskFailed')}: ${err.message}`)
  } finally {
    isStoppingTask.value = false
  }
}

const stopGroup = async () => {
  if (isStoppingGroup.value || !trainGroupId.value) return

  isStoppingGroup.value = true
  try {
    const apiBase = config.public.apiBase || 'http://localhost:8000'
    const url = `${apiBase.replace(/\/$/, '')}/train/stop/group/${trainGroupId.value}`
    const res = await fetch(url, { method: 'POST' })
    if (res.ok) {
      toast?.success(t('training.monitor.stopGroupSuccess'))
      stopGroupPolling()
    } else {
      throw new Error(await res.text())
    }
  } catch (err: any) {
    toast?.error(`${t('training.monitor.stopGroupFailed')}: ${err.message}`)
  } finally {
    isStoppingGroup.value = false
  }
}

const resumeTask = async (taskId?: string) => {
  const tid = taskId || monitorTaskId.value
  if (!tid || isResumingTask.value) return
  isResumingTask.value = true
  try {
    const apiBase = config.public.apiBase || 'http://localhost:8000'
    const url = `${apiBase.replace(/\/$/, '')}/train/resume/${tid}`
    const res = await fetch(url, { method: 'POST' })
    if (!res.ok) throw new Error(await res.text())
    toast?.success(t('training.monitor.resumeTaskSuccess'))
    if (trainGroupId.value && !groupPollingTimer) startGroupPolling()
    openMonitorStream(tid)
  } catch (err: any) {
    toast?.error(`${t('training.monitor.resumeTaskFailed')}: ${err.message}`)
  } finally {
    isResumingTask.value = false
  }
}

const resumeGroup = async () => {
  if (isResumingTask.value) return
  isResumingTask.value = true
  try {
    const apiBase = config.public.apiBase || 'http://localhost:8000'
    const url = `${apiBase.replace(/\/$/, '')}/train/resume/group/${trainGroupId.value}`
    const res = await fetch(url, { method: 'POST' })
    if (!res.ok) throw new Error(await res.text())
    toast?.success(t('training.monitor.resumeGroupSuccess') || 'Group resume initiated')
    if (trainGroupId.value && !groupPollingTimer) startGroupPolling()
  } catch (err: any) {
    toast?.error(`${t('training.monitor.resumeGroupFailed') || 'Resume failed'}: ${err.message}`)
  } finally {
    isResumingTask.value = false
  }
}

const presetsData = ref({
  none: {
    horizontal_flip: { enabled: false, prob: [0.5] },
    vertical_flip: { enabled: false, prob: [0.5] },
    rotate: { enabled: false, angle: [30] },
    brightness: { enabled: false, min: 0.8, max: 1.2 },
    contrast: { enabled: false, min: 0.8, max: 1.2 },
    blur: { enabled: false, ksize: [3] },
    pitch: { enabled: false, angle: [0] },
    yaw: { enabled: false, angle: [0] },
    num_results: [1]
  },
  basic: {
    horizontal_flip: { enabled: true, prob: [0.5] },
    vertical_flip: { enabled: true, prob: [0.5] },
    rotate: { enabled: true, angle: [15] },
    brightness: { enabled: true, min: 0.9, max: 1.1 },
    contrast: { enabled: true, min: 0.9, max: 1.1 },
    blur: { enabled: false, ksize: [3] },
    pitch: { enabled: true, angle: [5] },
    yaw: { enabled: true, angle: [5] },
    num_results: [1]
  },
  standard: {
    horizontal_flip: { enabled: true, prob: [0.5] },
    vertical_flip: { enabled: true, prob: [0.5] },
    rotate: { enabled: true, angle: [45] },
    brightness: { enabled: true, min: 0.8, max: 1.2 },
    contrast: { enabled: true, min: 0.8, max: 1.2 },
    blur: { enabled: true, ksize: [3] },
    pitch: { enabled: true, angle: [10] },
    yaw: { enabled: true, angle: [10] },
    num_results: [1]
  },
  heavy: {
    horizontal_flip: { enabled: true, prob: [0.5] },
    vertical_flip: { enabled: true, prob: [0.5] },
    rotate: { enabled: true, angle: [90] },
    brightness: { enabled: true, min: 0.6, max: 1.4 },
    contrast: { enabled: true, min: 0.6, max: 1.4 },
    blur: { enabled: true, ksize: [5] },
    pitch: { enabled: true, angle: [20] },
    yaw: { enabled: true, angle: [20] },
    num_results: [1]
  },
  custom: {
    horizontal_flip: { enabled: true, prob: [0.5] },
    vertical_flip: { enabled: true, prob: [0.5] },
    rotate: { enabled: true, angle: [45] },
    brightness: { enabled: true, min: 0.8, max: 1.2 },
    contrast: { enabled: true, min: 0.8, max: 1.2 },
    blur: { enabled: true, ksize: [3] },
    pitch: { enabled: true, angle: [10] },
    yaw: { enabled: true, angle: [10] },
    num_results: [1]
  }
})

const augmentConfig = computed({
  get: () => presetsData.value[currentPreset.value] || presetsData.value.none,
  set: (val) => {
    presetsData.value[currentPreset.value] = val
  }
})

const applyPreset = (type: 'none' | 'basic' | 'standard' | 'heavy' | 'custom') => {
  currentPreset.value = type
}

const previewImage = ref<string | null>(null)
const selectedIndices = ref<Set<number>>(new Set())

const toggleImageSelection = (index: number) => {
  if (selectedIndices.value.has(index)) {
    selectedIndices.value.delete(index)
  } else {
    selectedIndices.value.add(index)
  }
}

const removeSelectedImages = () => {
  if (selectedIndices.value.size === 0) return
  augmentedResults.value = augmentedResults.value.filter((_, index) => !selectedIndices.value.has(index))
  selectedIndices.value.clear()
  if (augmentedResults.value.length > 0) {
    augmentedImageUrl.value = augmentedResults.value[0].imageUrl
  } else {
    augmentedImageUrl.value = ''
  }
}

const MAX_AUGMENT_RESULTS = 100

const previewImageSize = ref([100]) // Percentage 50-200%

const activeAugmentations = computed(() => {
  const items = []
  if (augmentConfig.value.rotate.enabled) items.push({ value: 'rotate', label: t('training.geometric.rotate') })
  if (augmentConfig.value.brightness.enabled) items.push({ value: 'brightness', label: t('training.visual.brightness') })
  if (augmentConfig.value.contrast.enabled) items.push({ value: 'contrast', label: t('training.visual.contrast') })
  if (augmentConfig.value.blur.enabled) items.push({ value: 'blur', label: t('training.visual.blur') })
  if (augmentConfig.value.pitch.enabled) items.push({ value: 'pitch', label: t('training.geometric.pitch') })
  if (augmentConfig.value.yaw.enabled) items.push({ value: 'yaw', label: t('training.geometric.yaw') })
  return items
})

const sliceDims = computed(() => {
  return [
    { value: 'none', label: t('training.preview.none') },
    ...activeAugmentations.value
  ]
})

// Watch active augmentations to reset X/Y if they are disabled
watch(activeAugmentations, (newVal) => {
  const activeKeys = newVal.map(i => i.value)
  if (sliceConfig.value.x !== 'none' && !activeKeys.includes(sliceConfig.value.x)) {
    sliceConfig.value.x = 'none'
  }
  if (sliceConfig.value.y !== 'none' && !activeKeys.includes(sliceConfig.value.y)) {
    sliceConfig.value.y = 'none'
  }
})

const sliceConfig = ref({
  rows: [3],
  cols: [3],
  x: 'none',
  y: 'none',
})

const parseDatasetConfig = (raw: string) => {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && (parsed.augmentConfig || parsed.sliceConfig || parsed.preset)) {
      return parsed
    }
    return { augmentConfig: parsed }
  } catch {
    return null
  }
}

const isRollingBack = ref(false)
  
  const applyDatasetVersion = async (v: any) => {
    isRollingBack.value = true
    selectedIndices.value.clear()
    const cfg = parseDatasetConfig(v?.config || '')
    if (!cfg) {
      toast?.error(t('training.view.rollbackFailed'))
      isRollingBack.value = false
      return
    }

    try {
      if (v.id) {
        const loadResult = await window.electronAPI.loadDataset({ id: v.id, savePath: v.savePath })
        if (loadResult.success) {
          augmentedResults.value = loadResult.images.map((img: any) => ({
            ...img,
            annotations: img.annotations.map((ann: any) => {
              const labelInfo = labelConfigs.value[ann.categoryId - 1] || {}
              return {
                ...ann,
                color: labelInfo.color || '#3b82f6',
                label: labelInfo.name || `Label ${ann.categoryId}`
              }
            })
          }))
          
          if (augmentedResults.value.length > 0) {
            augmentedImageUrl.value = augmentedResults.value[0].imageUrl
          }
        } else {
          console.warn('Failed to load physical data:', loadResult.error)
          toast?.error(`${t('training.view.rollbackFailed')}: ${loadResult.error}`)
        }
      }
    } catch (err: any) {
      console.error('Error loading dataset version data:', err)
      toast?.error(`${t('training.view.rollbackFailed')}: ${err.message}`)
    }

    if (cfg.sliceConfig) sliceConfig.value = JSON.parse(JSON.stringify(cfg.sliceConfig))
  if (cfg.augmentConfig) {
    if (cfg.preset && cfg.preset !== 'custom' && cfg.preset !== 'none') {
      presetsData.value[cfg.preset] = JSON.parse(JSON.stringify(cfg.augmentConfig))
      currentPreset.value = cfg.preset
    } else {
      presetsData.value.custom = JSON.parse(JSON.stringify(cfg.augmentConfig))
      currentPreset.value = 'custom'
    }
  } else if (cfg.preset) {
    currentPreset.value = cfg.preset
  }

  versionName.value = v?.versionName || versionName.value
  isSaved.value = true
  toast?.success(t('training.view.rollbackSuccess'))
  
  nextTick(() => {
    isRollingBack.value = false
  })
}

// Watch for changes after rollback to generate temporary version
watch([presetsData, sliceConfig], () => {
  if (isRollingBack.value) return
  if (selectedDatasetVersionId.value && isSaved.value) {
    // If we were on a saved version and made changes
    isSaved.value = false
    selectedDatasetVersionId.value = ''
    versionName.value = getNextVersionName(datasetVersions.value)
  }
}, { deep: true })

watch(selectedDatasetVersionId, (id) => {
  if (!id) return
  const v = datasetVersions.value.find(vv => String(vv.id) === String(id))
  if (!v) return
  applyDatasetVersion(v)
})

const isXSelectOpen = ref(false)
const isYSelectOpen = ref(false)

const isMatrixMode = computed(() => sliceConfig.value.x !== 'none' || sliceConfig.value.y !== 'none')

const maxSliceRows = computed(() => {
  const cols = Math.max(1, Math.round(Number(sliceConfig.value.cols[0] ?? 1)))
  return Math.max(1, Math.min(10, Math.floor(MAX_AUGMENT_RESULTS / cols)))
})

const maxSliceCols = computed(() => {
  const rows = Math.max(1, Math.round(Number(sliceConfig.value.rows[0] ?? 1)))
  return Math.max(1, Math.min(10, Math.floor(MAX_AUGMENT_RESULTS / rows)))
})

watch(
  () => [sliceConfig.value.rows[0], sliceConfig.value.cols[0]],
  () => {
    const nextRows = Math.max(1, Math.min(maxSliceRows.value, Math.round(Number(sliceConfig.value.rows[0] ?? 1))))
    const nextCols = Math.max(1, Math.min(maxSliceCols.value, Math.round(Number(sliceConfig.value.cols[0] ?? 1))))
    if (nextRows !== sliceConfig.value.rows[0]) sliceConfig.value.rows = [nextRows]
    if (nextCols !== sliceConfig.value.cols[0]) sliceConfig.value.cols = [nextCols]
  },
  { immediate: true }
)

watch(
  () => [sliceConfig.value.x, sliceConfig.value.y],
  () => {
    if (sliceConfig.value.x !== 'none' && sliceConfig.value.x === sliceConfig.value.y) {
      sliceConfig.value.y = 'none'
    }
    if (sliceConfig.value.x === 'rotate' || sliceConfig.value.y === 'rotate') augmentConfig.value.rotate.enabled = true
    if (sliceConfig.value.x === 'brightness' || sliceConfig.value.y === 'brightness') augmentConfig.value.brightness.enabled = true
    if (sliceConfig.value.x === 'contrast' || sliceConfig.value.y === 'contrast') augmentConfig.value.contrast.enabled = true
  if (sliceConfig.value.x === 'blur' || sliceConfig.value.y === 'blur') augmentConfig.value.blur.enabled = true
  if (sliceConfig.value.x === 'pitch' || sliceConfig.value.y === 'pitch') augmentConfig.value.pitch.enabled = true
  if (sliceConfig.value.x === 'yaw' || sliceConfig.value.y === 'yaw') augmentConfig.value.yaw.enabled = true
},
{ immediate: true }
)

const requestedNumResults = computed(() => {
  const n = isMatrixMode.value
    ? Math.round(Number(sliceConfig.value.rows[0] ?? 1)) * Math.round(Number(sliceConfig.value.cols[0] ?? 1))
    : Math.round(Number(augmentConfig.value.num_results[0] ?? 1))
  return Math.max(1, Math.min(MAX_AUGMENT_RESULTS, n))
})

const previewGridCols = computed(() => {
  if (isMatrixMode.value) return Math.max(1, Math.round(Number(sliceConfig.value.cols[0] ?? 1)))
  const n = augmentedResults.value.length || requestedNumResults.value
  const cols = Math.ceil(Math.sqrt(Math.max(1, n)))
  return Math.max(1, Math.min(6, cols))
})

const trainConfig = ref({
  epochs: [10],
  batchSize: [8],
  learningRate: 0.001
})

const enabledAugmentations = computed(() => {
  const enabled = []
  if (augmentConfig.value.horizontal_flip.enabled) enabled.push(t('training.geometric.horizontalFlip'))
  if (augmentConfig.value.vertical_flip.enabled) enabled.push(t('training.geometric.verticalFlip'))
  if (augmentConfig.value.rotate.enabled) enabled.push(t('training.geometric.rotate'))
  if (augmentConfig.value.brightness.enabled) enabled.push(t('training.visual.brightness'))
  if (augmentConfig.value.contrast.enabled) enabled.push(t('training.visual.contrast'))
  if (augmentConfig.value.blur.enabled) enabled.push(t('training.visual.blur'))
  if (augmentConfig.value.pitch.enabled) enabled.push(t('training.geometric.pitch'))
  if (augmentConfig.value.yaw.enabled) enabled.push(t('training.geometric.yaw'))
  return enabled.length > 0 ? enabled.join('、') : t('training.preview.noAugmentations')
})

const augmentedImageSize = ref({ width: 0, height: 0 })

let autoAugmentTimer: any = null
watch(
  [augmentConfig, sliceConfig],
  () => {
    if (!isAutoAugment.value || isAugmenting.value) return
    if (autoAugmentTimer) clearTimeout(autoAugmentTimer)
    autoAugmentTimer = setTimeout(() => {
      handleAugment()
    }, 800)
  },
  { deep: true }
)

const handleAugment = async () => {
  console.log('handleAugment called', { baseImageUrl: !!baseImageUrl.value, isAugmenting: isAugmenting.value })
  if (!baseImageUrl.value || isAugmenting.value) return

  isAugmenting.value = true
  try {
    const base64Data = baseImageUrl.value.split(',')[1]
    
    // ... (COCO format helpers) ...
    const calculateBbox = (points: any, type: string) => {
      if (type === 'rect') return points // [x, y, w, h]
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i]
        const y = points[i+1]
        minX = Math.min(minX, x); minY = Math.min(minY, y)
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
      }
      return [minX, minY, maxX - minX, maxY - minY]
    }

    const calculateArea = (points: any, type: string) => {
      if (type === 'rect') return points[2] * points[3]
      let area = 0
      for (let i = 0; i < points.length; i += 2) {
        const j = (i + 2) % points.length
        area += points[i] * points[j + 1]
        area -= points[j] * points[i + 1]
      }
      return Math.abs(area) / 2
    }
    
    // ... (Format annotations) ...
    const formattedAnnotations = currentAnnotations.value.map((ann, idx) => {
      const bbox = calculateBbox(ann.points, ann.type)
      const area = calculateArea(ann.points, ann.type)
      let segmentation: number[][] = []
      
      if (ann.type === 'rect') {
        const [x, y, w, h] = ann.points
        segmentation = [[x, y, x + w, y, x + w, y + h, x, y + h]]
      } else {
        segmentation = [ann.points]
      }

      const labelIdx = labelConfigs.value.findIndex(l => l.id === ann.labelId)
      const category_id = labelIdx !== -1 ? labelIdx + 1 : 1

      return {
        id: idx + 1,
        image_id: 1,
        category_id,
        segmentation,
        area,
        bbox,
        iscrowd: 0,
        type: ann.type,
        color: ann.color,
        label: ann.label,
        labelId: ann.labelId
      }
    })

    const cocoData = {
      images: [{
        id: 1,
        width: baseImageSize.value.width,
        height: baseImageSize.value.height,
        file_name: 'image.jpg'
      }],
      annotations: formattedAnnotations,
      categories: labelConfigs.value.map((l, idx) => ({
        id: idx + 1,
        name: l.name,
        supercategory: 'none'
      }))
    }

    const augConfig: any = {}
    if (augmentConfig.value.horizontal_flip.enabled) augConfig.horizontal_flip = {}
    if (augmentConfig.value.vertical_flip.enabled) augConfig.vertical_flip = {}
    if (augmentConfig.value.rotate.enabled) augConfig.rotate = { range: [-augmentConfig.value.rotate.angle[0], augmentConfig.value.rotate.angle[0]] }
    if (augmentConfig.value.brightness.enabled) augConfig.brightness = { range: [augmentConfig.value.brightness.min, augmentConfig.value.brightness.max] }
    if (augmentConfig.value.contrast.enabled) augConfig.contrast = { range: [augmentConfig.value.contrast.min, augmentConfig.value.contrast.max] }
    if (augmentConfig.value.blur.enabled) augConfig.blur = { ksize_range: [1, augmentConfig.value.blur.ksize[0]] }
    if (augmentConfig.value.pitch.enabled) augConfig.pitch = { range: [-augmentConfig.value.pitch.angle[0], augmentConfig.value.pitch.angle[0]] }
    if (augmentConfig.value.yaw.enabled) augConfig.yaw = { range: [-augmentConfig.value.yaw.angle[0], augmentConfig.value.yaw.angle[0]] }
    
    const apiBase = config.public.apiBase || 'http://localhost:8000'
    const apiUrl = `${apiBase.replace(/\/$/, '')}/augment`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_base64: base64Data,
        coco_data: cocoData,
        config: augConfig,
        num_results: requestedNumResults.value,
        gradient_axes: {
          x: isMatrixMode.value ? sliceConfig.value.x : 'none',
          y: isMatrixMode.value ? sliceConfig.value.y : 'none',
        }
      })
    })

    if (!response.ok) throw new Error(`Augmentation failed: ${response.statusText}`)

    const result = await response.json()
    const items = (result.items || []).slice(0, requestedNumResults.value)
    
    augmentedResults.value = items.map((item: any) => {
      const resultCoco = item.coco_data || {}
      const annotations = (resultCoco.annotations || []).map((ann: any) => {
        let points: any = []
        let type = ann.type || (ann.segmentation && ann.segmentation[0]?.length > 8 ? 'polygon' : 'rect')
        
        if (type === 'rect') {
          points = ann.bbox || [0, 0, 0, 0]
        } else {
          const seg = ann.segmentation?.[0] || []
          points = seg
        }
        
        const labelInfo = labelConfigs.value[ann.category_id - 1] || {}
        
        return {
          id: ann.id || Math.random().toString(36).substr(2, 9),
          type,
          points,
          color: ann.color || labelInfo.color || '#3b82f6',
          label: ann.label || labelInfo.name || 'unknown',
          labelId: labelInfo.id,
          categoryId: ann.category_id
        }
      })

      // Get image dimensions from COCO if available
      const imgInfo = resultCoco.images?.[0] || {}
      
      return {
        imageUrl: `data:image/jpeg;base64,${item.image_base64}`,
        annotations,
        width: imgInfo.width || 0,
        height: imgInfo.height || 0,
        params: item.params
      }
    })

    if (augmentedResults.value.length > 0) {
      augmentedImageUrl.value = augmentedResults.value[0].imageUrl
    }
    
    toast?.success(t('training.messages.success'))
  } catch (err: any) {
    console.error('Augment error:', err)
    toast?.error(`${t('training.messages.failed')}: ${err.message || '未知错误'}`)
  } finally {
    isAugmenting.value = false
  }
}

const getSvgPoints = (ann: any) => {
  if (ann.type === 'rect') {
    const [x, y, w, h] = ann.points
    return `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`
  } else {
    // ann.points for polygon is [x1, y1, x2, y2, ...]
    const pts = []
    for (let i = 0; i < ann.points.length; i += 2) {
      pts.push(`${ann.points[i]},${ann.points[i + 1]}`)
    }
    return pts.join(' ')
  }
}

onMounted(async () => {
  if (window.electronAPI) {
    isPinned.value = await window.electronAPI.isAlwaysOnTop()
  }

  if (window.electronAPI?.getSettings) {
    const settings = await window.electronAPI.getSettings()
    if (settings?.dataPath) settingsDataPath.value = settings.dataPath
  }

  const qProductId = route.query.productId
  const qProductName = route.query.productName
  const qImagePath = route.query.imagePath
  if (qProductId) productId.value = Number(qProductId)
  if (qProductName) productName.value = String(qProductName)

  if (productId.value && window.electronAPI) {
    const files = await window.electronAPI.getProductImages(productId.value)
    if (files && files.length > 0) {
      // Use provided image path or default to the first one
      const targetImagePath = (qImagePath as string) || files[0]
      const url = await window.electronAPI.loadImage(targetImagePath)
      baseImageUrl.value = url || ''
      console.log('Loaded image for training:', { path: targetImagePath, hasUrl: !!url })
      
      if (url) {
        const img = new Image()
        img.onload = () => {
          baseImageSize.value = { width: img.width, height: img.height }
        }
        img.src = url
      }
      
      // Load annotations for the selected image
      const ann = await window.electronAPI.getAnnotations(productId.value, targetImagePath)
      if (ann && ann.data) {
        currentAnnotations.value = JSON.parse(ann.data)
      }

      // Load product labels for COCO category_id mapping
      const products = await window.electronAPI.getProducts()
      const product = products.find(p => p.id === productId.value)
      if (product?.scheme) {
        const config = JSON.parse(product.scheme.config)
        labelConfigs.value = config.labels || []
      }

      // Load dataset versions
      datasetVersions.value = await window.electronAPI.getDatasetVersions(productId.value)
      versionName.value = getNextVersionName(datasetVersions.value)

      const restored = await restoreActiveTrainingState()
      if (restored) {
        const key = innerStepStorageKey.value
        if (key && typeof window !== 'undefined') window.localStorage.setItem(key, innerStep.value)
      }

      // Default to basic augmentation
      applyPreset('basic')
    }
  }
})

onBeforeUnmount(() => {
  closeMonitorStream()
  stopGroupPolling()
})
</script>

<template>
  <div class="flex flex-col h-screen bg-background text-foreground overflow-hidden">
    <header class="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 z-20">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">
          <Settings2 class="h-5 w-5" />
        </div>
        <h1 class="text-lg font-bold tracking-tight">{{ t('common.appName') }}</h1>
      </div>

      <div class="flex-1 flex items-center justify-center">
        <nav class="step-nav">
          <NuxtLink
            v-for="(step, index) in steps"
            :key="step.key"
            :to="step.to"
            :class="[
              'step-item',
              index === 0 ? 'step-first' : index === steps.length - 1 ? 'step-last' : 'step-middle',
              route.path === step.to ? 'step-active' : 'step-inactive'
            ]"
          >
            <span class="step-label">{{ step.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <UiButton 
          variant="ghost" 
          size="icon" 
          @click="togglePin"
          :title="isPinned ? t('common.unpin') : t('common.pin')"
          :class="{ 'text-primary bg-primary/10': isPinned }"
        >
          <component :is="isPinned ? PinOff : Pin" class="h-4 w-4" />
        </UiButton>
        
        <NuxtLink :to="{ path: '/settings', query: { from: route.fullPath } }">
          <UiButton variant="ghost" size="icon" :title="t('common.settings')">
            <Settings class="h-4 w-4" />
          </UiButton>
        </NuxtLink>
      </div>
    </header>

    <main class="flex-1 flex flex-col min-h-0 overflow-hidden bg-muted/20 p-8">
      <div class="max-w-[1400px] mx-auto w-full h-full flex flex-col space-y-6">
        <div class="flex items-center justify-center gap-16 shrink-0">
          <button
            class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold"
            :class="innerStep === 'augment' ? 'bg-primary text-primary-foreground border-primary' : ''"
            @click="innerStep = 'augment'"
          >
            1
          </button>
          <div class="h-[2px] w-40 bg-border"></div>
          <button
            class="w-12 h-12 rounded-full border flex items-center justify-center text-lg font-bold"
            :class="innerStep === 'train' ? 'bg-primary text-primary-foreground border-primary' : ''"
            @click="innerStep = 'train'"
          >
            2
          </button>
          <div class="h-[2px] w-40 bg-border"></div>
          <button
            class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold"
            :class="innerStep === 'monitor' ? 'bg-primary text-primary-foreground border-primary' : ''"
            @click="innerStep = 'monitor'"
          >
            3
          </button>
        </div>

        <div v-if="innerStep === 'augment'" class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[400px,1fr] gap-6">
          <aside class="border rounded-xl bg-background p-4 flex flex-col gap-4 overflow-hidden h-full min-h-[500px] md:min-h-0">
            <div class="flex items-center justify-between shrink-0">
              <h3 class="font-bold text-sm">{{ t('training.augmentConfig') }}</h3>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 mr-1">
                  <span class="text-[10px] text-muted-foreground">{{ t('training.autoPreview') }}</span>
                  <input type="checkbox" v-model="isAutoAugment" class="h-3 w-3" />
                </div>
                <UiButton variant="ghost" size="xs" class="h-6 px-2 text-[10px]" @click="applyPreset('none')">{{ t('training.reset') }}</UiButton>
              </div>
            </div>

            <div class="space-y-1.5 shrink-0">
              <Label class="text-[10px] text-muted-foreground">{{ t('training.view.historyVersion') }}</Label>
              <UiSelect v-model="selectedDatasetVersionId" v-model:open="isVersionSelectOpen">
                <UiSelectTrigger class="h-8 text-xs bg-background w-full px-2 gap-2">
                  <UiSelectValue :placeholder="t('training.view.historyVersionPlaceholder')" />
                </UiSelectTrigger>
                <UiSelectContent class="z-[9999] w-[var(--radix-select-trigger-width)] min-w-[240px]">
                  <UiSelectItem v-for="v in datasetVersions" :key="v.id" :value="String(v.id)" class="group pr-2">
                    <div class="flex items-center w-full gap-2">
                      <span class="flex-1 min-w-0 truncate">{{ v.displayName ? `${v.displayName} (${v.versionName})` : v.versionName }}</span>
                      <UiButton 
                        variant="ghost" 
                        size="icon" 
                        class="h-5 w-5 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0" 
                        @click.stop="confirmDeleteVersion(v.id)"
                        @pointerdown.stop
                        @pointerup.stop
                        @mousedown.stop
                        @mouseup.stop
                      >
                        <X class="h-3.5 w-3.5" />
                      </UiButton>
                    </div>
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </div>
            <Separator />
            <!-- 快捷预设 -->
            <div class="grid grid-cols-4 gap-2 shrink-0">
              <UiButton 
                variant="outline" 
                size="sm" 
                class="h-8 text-xs" 
                :class="{ 'bg-primary text-primary-foreground border-primary': currentPreset === 'basic' }"
                @click="applyPreset('basic')"
              >
                {{ t('training.preset.basic') }}
              </UiButton>
              <UiButton 
                variant="outline" 
                size="sm" 
                class="h-8 text-xs" 
                :class="{ 'bg-primary text-primary-foreground border-primary': currentPreset === 'standard' }"
                @click="applyPreset('standard')"
              >
                {{ t('training.preset.standard') }}
              </UiButton>
              <UiButton 
                variant="outline" 
                size="sm" 
                class="h-8 text-xs" 
                :class="{ 'bg-primary text-primary-foreground border-primary': currentPreset === 'heavy' }"
                @click="applyPreset('heavy')"
              >
                {{ t('training.preset.heavy') }}
              </UiButton>
              <UiButton 
                variant="outline" 
                size="sm" 
                class="h-8 text-xs" 
                :class="{ 'bg-primary text-primary-foreground border-primary': currentPreset === 'custom' }"
                @click="applyPreset('custom')"
              >
                {{ t('training.preset.custom') }}
              </UiButton>
            </div>
            
            <Separator />
            
            <div class="space-y-4 flex-1 overflow-y-auto pr-2 pl-1">
              <!-- 几何变换组 -->
              <div class="space-y-2">
                <Label class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{{ t('training.geometric.title') }}</Label>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    @click="augmentConfig.horizontal_flip.enabled = !augmentConfig.horizontal_flip.enabled"
                    :class="['flex items-center justify-center gap-2 h-9 border rounded-md text-xs transition-colors', 
                      augmentConfig.horizontal_flip.enabled ? 'bg-primary/10 border-primary text-primary font-medium' : 'hover:bg-muted']"
                  >
                    {{ t('training.geometric.horizontalFlip') }}
                  </button>
                  <button 
                    @click="augmentConfig.vertical_flip.enabled = !augmentConfig.vertical_flip.enabled"
                    :class="['flex items-center justify-center gap-2 h-9 border rounded-md text-xs transition-colors', 
                      augmentConfig.vertical_flip.enabled ? 'bg-primary/10 border-primary text-primary font-medium' : 'hover:bg-muted']"
                  >
                    {{ t('training.geometric.verticalFlip') }}
                  </button>
                </div>
                
                <div class="p-3 border rounded-lg space-y-3">
                  <div class="flex items-center justify-between">
                    <Label class="text-xs">{{ t('training.geometric.rotate') }}</Label>
                    <input type="checkbox" v-model="augmentConfig.rotate.enabled" class="h-3 w-3" />
                  </div>
                  <div v-if="augmentConfig.rotate.enabled" class="space-y-2">
                    <div class="flex justify-between text-[10px]">
                      <span>{{ t('training.geometric.maxAngle') }}</span>
                      <span>{{ augmentConfig.rotate.angle[0] }}°</span>
                    </div>
                    <Slider v-model="augmentConfig.rotate.angle" :min="0" :max="180" :step="1" />
                  </div>
                </div>

                <div class="p-3 border rounded-lg space-y-3">
                  <div class="flex items-center justify-between">
                    <Label class="text-xs">{{ t('training.geometric.pitch') }}</Label>
                    <input type="checkbox" v-model="augmentConfig.pitch.enabled" class="h-3 w-3" />
                  </div>
                  <div v-if="augmentConfig.pitch.enabled" class="space-y-2">
                    <div class="flex justify-between text-[10px]">
                      <span>{{ t('training.geometric.angleRange') }}</span>
                      <span>±{{ augmentConfig.pitch.angle[0] }}°</span>
                    </div>
                    <Slider v-model="augmentConfig.pitch.angle" :min="0" :max="45" :step="1" />
                  </div>
                </div>

                <div class="p-3 border rounded-lg space-y-3">
                  <div class="flex items-center justify-between">
                    <Label class="text-xs">{{ t('training.geometric.yaw') }}</Label>
                    <input type="checkbox" v-model="augmentConfig.yaw.enabled" class="h-3 w-3" />
                  </div>
                  <div v-if="augmentConfig.yaw.enabled" class="space-y-2">
                    <div class="flex justify-between text-[10px]">
                      <span>{{ t('training.geometric.angleRange') }}</span>
                      <span>±{{ augmentConfig.yaw.angle[0] }}°</span>
                    </div>
                    <Slider v-model="augmentConfig.yaw.angle" :min="0" :max="45" :step="1" />
                  </div>
                </div>
              </div>

              <!-- 视觉效果组 -->
              <div class="space-y-2">
                <Label class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{{ t('training.visual.title') }}</Label>
                
                <div class="p-3 border rounded-lg space-y-3">
                  <div class="flex items-center justify-between">
                    <Label class="text-xs">{{ t('training.visual.brightness') }}</Label>
                    <input type="checkbox" v-model="augmentConfig.brightness.enabled" class="h-3 w-3" />
                  </div>
                  <div v-if="augmentConfig.brightness.enabled" class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <Label class="text-[10px]">{{ t('training.visual.min') }}</Label>
                      <Input type="number" v-model="augmentConfig.brightness.min" step="0.1" class="h-7 text-xs px-2" />
                    </div>
                    <div class="space-y-1">
                      <Label class="text-[10px]">{{ t('training.visual.max') }}</Label>
                      <Input type="number" v-model="augmentConfig.brightness.max" step="0.1" class="h-7 text-xs px-2" />
                    </div>
                  </div>
                </div>

                <div class="p-3 border rounded-lg space-y-3">
                  <div class="flex items-center justify-between">
                    <Label class="text-xs">{{ t('training.visual.contrast') }}</Label>
                    <input type="checkbox" v-model="augmentConfig.contrast.enabled" class="h-3 w-3" />
                  </div>
                  <div v-if="augmentConfig.contrast.enabled" class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <Label class="text-[10px]">{{ t('training.visual.min') }}</Label>
                      <Input type="number" v-model="augmentConfig.contrast.min" step="0.1" class="h-7 text-xs px-2" />
                    </div>
                    <div class="space-y-1">
                      <Label class="text-[10px]">{{ t('training.visual.max') }}</Label>
                      <Input type="number" v-model="augmentConfig.contrast.max" step="0.1" class="h-7 text-xs px-2" />
                    </div>
                  </div>
                </div>

                <div class="p-3 border rounded-lg space-y-3">
                  <div class="flex items-center justify-between">
                    <Label class="text-xs">{{ t('training.visual.blur') }}</Label>
                    <input type="checkbox" v-model="augmentConfig.blur.enabled" class="h-3 w-3" />
                  </div>
                  <div v-if="augmentConfig.blur.enabled" class="space-y-2">
                    <div class="flex justify-between text-[10px]">
                      <span>{{ t('training.visual.ksize') }}</span>
                      <span>{{ augmentConfig.blur.ksize[0] }}</span>
                    </div>
                    <Slider v-model="augmentConfig.blur.ksize" :min="1" :max="15" :step="2" />
                  </div>
                </div>
              </div>

              <!-- 预览模式组 -->
              <div class="space-y-2">
                <Label class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{{ t('training.preview.title') }}</Label>
                <div class="p-3 border rounded-lg space-y-3" :class="isMatrixMode ? 'bg-primary/5 border-primary/20' : 'bg-background'">
                  <div v-if="activeAugmentations.length > 0" class="flex flex-col gap-3">
                    <div class="flex p-0.5 bg-muted rounded-lg h-8">
                      <button 
                        class="flex-1 flex items-center justify-center text-[10px] rounded-md transition-all"
                        :class="!isMatrixMode ? 'bg-background shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'"
                        @click="() => { sliceConfig.x = 'none'; sliceConfig.y = 'none' }"
                      >
                        {{ t('training.preview.random') }}
                      </button>
                      <button 
                        class="flex-1 flex items-center justify-center text-[10px] rounded-md transition-all"
                        :class="isMatrixMode ? 'bg-background shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'"
                        @click="() => { sliceConfig.x = activeAugmentations[0].value; sliceConfig.y = 'none' }"
                      >
                        {{ t('training.preview.matrix') }}
                      </button>
                    </div>
                  </div>
                  
                  <div v-if="isMatrixMode && activeAugmentations.length > 0" class="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div class="grid grid-cols-2 gap-2">
                      <div class="space-y-1">
                        <Label class="text-[10px]">{{ t('training.preview.xAxis') }}</Label>
                        <UiSelect v-model="sliceConfig.x" v-model:open="isXSelectOpen">
                          <UiSelectTrigger class="h-7 text-[10px] bg-background w-full px-2">
                            <UiSelectValue :placeholder="t('training.preview.xAxis')" />
                          </UiSelectTrigger>
                          <UiSelectContent class="z-[9999]">
                            <UiSelectItem v-for="p in activeAugmentations" :key="p.value" :value="p.value">
                              {{ p.label }}
                            </UiSelectItem>
                          </UiSelectContent>
                        </UiSelect>
                      </div>
                      <div class="space-y-1">
                        <Label class="text-[10px]">{{ t('training.preview.yAxis') }}</Label>
                        <UiSelect v-model="sliceConfig.y" v-model:open="isYSelectOpen">
                          <UiSelectTrigger class="h-7 text-[10px] bg-background w-full px-2">
                            <UiSelectValue :placeholder="t('training.preview.yAxis')" />
                          </UiSelectTrigger>
                          <UiSelectContent class="z-[9999]">
                            <UiSelectItem value="none">{{ t('training.preview.noneY') }}</UiSelectItem>
                            <UiSelectItem
                              v-for="p in activeAugmentations.filter(d => d.value !== sliceConfig.x)"
                              :key="p.value"
                              :value="p.value"
                            >
                              {{ p.label }}
                            </UiSelectItem>
                          </UiSelectContent>
                        </UiSelect>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 pt-1">
                      <div class="space-y-1">
                        <div class="flex justify-between text-[10px]">
                          <span>{{ t('training.preview.rows') }}</span>
                          <span>{{ sliceConfig.rows[0] }}</span>
                        </div>
                        <Slider v-model="sliceConfig.rows" :min="1" :max="maxSliceRows" :step="1" />
                      </div>
                      <div class="space-y-1">
                        <div class="flex justify-between text-[10px]">
                          <span>{{ t('training.preview.cols') }}</span>
                          <span>{{ sliceConfig.cols[0] }}</span>
                        </div>
                        <Slider v-model="sliceConfig.cols" :min="1" :max="maxSliceCols" :step="1" />
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="space-y-2">
                    <div class="flex justify-between text-[10px]">
                      <span>{{ t('training.preview.randomCount') }}</span>
                      <span>{{ requestedNumResults }}</span>
                    </div>
                    <Slider v-model="augmentConfig.num_results" :min="1" :max="MAX_AUGMENT_RESULTS" :step="1" />
                  </div>
                  
                  <div class="text-[9px] text-muted-foreground flex justify-between border-t pt-2 mt-2">
                    <span v-if="isMatrixMode">{{ t('training.preview.matrixInfo', { rows: sliceConfig.rows[0], cols: sliceConfig.cols[0] }) }}</span>
                    <span v-else>{{ t('training.preview.randomMode') }}</span>
                    <span>{{ t('training.preview.totalPreview', { count: augmentedResults.length > 0 ? augmentedResults.length : requestedNumResults }) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            <div class="mt-auto pt-4 space-y-2 shrink-0">
              <UiButton class="w-full" variant="secondary" @click="handleAugment" :disabled="isAugmenting">
                {{ isAugmenting ? t('training.preview.generating') : t('training.preview.generate') }}
              </UiButton>
              <UiButton class="w-full" @click="handleNextStep">{{ t('training.view.next') }}</UiButton>
            </div>
          </aside>

          <section class="border rounded-xl bg-background p-4 relative flex flex-col overflow-hidden h-full">
            <div v-if="!baseImageUrl" class="text-muted-foreground flex flex-col items-center justify-center h-full gap-2">
              <div class="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center text-2xl">+</div>
              <p>{{ t('training.view.noImage') }}</p>
            </div>
            <div v-else class="relative w-full h-full flex flex-col min-h-0">
              <!-- Header with switch -->
              <div class="flex items-center justify-between mb-4 px-2 shrink-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold">{{ (augmentedImageUrl || isAugmenting) ? t('training.view.augmentedImage') : t('training.view.originalImage') }}</span>
                  <span v-if="augmentedImageUrl" class="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">{{ t('training.preview.title') }}</span>
                </div>
                
                <div v-if="augmentedImageUrl && !isAugmenting" class="flex items-center gap-2">
                  <div class="flex items-center gap-2 mr-4 border-r pr-4">
                    <span class="text-xs font-medium whitespace-nowrap">{{ t('training.view.zoom') }}</span>
                    <Slider v-model="previewImageSize" :min="50" :max="300" :step="10" class="w-24" />
                    <span class="text-xs w-8">{{ previewImageSize[0] }}%</span>
                  </div>
                  
                  <!-- Selected Actions -->
                  <div v-if="selectedIndices.size > 0" class="flex items-center gap-2 mr-4 border-r pr-4">
                    <span class="text-[10px] text-muted-foreground">{{ t('training.view.selectedCount', { count: selectedIndices.size }) }}</span>
                    <UiButton variant="destructive" size="sm" class="h-8 text-xs px-3" @click="removeSelectedImages">
                      {{ t('training.view.remove') }}
                    </UiButton>
                  </div>

                  <UiButton size="sm" class="h-8 text-xs" @click="openSaveDialog" :disabled="isSaved || isSavingDataset">
                    {{ isSavingDataset ? t('training.view.saving') : t('training.view.saveDataset') }}
                  </UiButton>
                  <UiButton
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0"
                    @click="augmentedImageUrl = ''; augmentedResults = []; selectedIndices.clear()"
                    :title="t('training.view.backToOriginal')"
                  >
                    <X class="h-4 w-4" />
                  </UiButton>
                </div>
              </div>

              <div class="flex-1 min-h-0">
                <div class="relative border rounded-xl overflow-hidden bg-muted/30 flex flex-col min-h-0 h-full">
                  <!-- Loading State -->
                  <div v-if="isAugmenting" class="flex-1 flex flex-col items-center justify-center gap-4">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    <p class="text-sm text-muted-foreground animate-pulse">{{ t('training.view.previewGenerating') }}</p>
                  </div>

                  <!-- Original Image -->
                  <template v-else-if="!augmentedImageUrl">
                    <div class="flex-1 w-full h-full overflow-auto flex items-center justify-center p-4">
                      <div class="relative w-fit">
                        <img :src="baseImageUrl" class="max-w-full max-h-[calc(100vh-300px)] block" />
                        <!-- 原图标注 -->
                        <svg v-if="currentAnnotations.length > 0 && baseImageSize.width" 
                            class="absolute top-0 left-0 w-full h-full pointer-events-none" 
                            :viewBox="`0 0 ${baseImageSize.width} ${baseImageSize.height}`"
                            preserveAspectRatio="xMidYMid meet">
                          <polygon 
                            v-for="ann in currentAnnotations" 
                            :key="ann.id"
                            :points="getSvgPoints(ann)"
                            fill="transparent"
                            :stroke="ann.color"
                            stroke-width="2"
                            vector-effect="non-scaling-stroke"
                          />
                        </svg>
                      </div>
                    </div>
                  </template>

                  <!-- Augmented Results Grid -->
                  <template v-else>
                    <div class="flex-1 w-full h-full overflow-auto bg-muted/30 p-4">
                      <div :class="['grid gap-4 items-center content-start mx-auto transition-all origin-top-left']"
                          :style="{
                            gridTemplateColumns: `repeat(${previewGridCols}, 1fr)`,
                            width: `${previewImageSize[0]}%`
                          }">
                        <div v-for="(res, idx) in augmentedResults" :key="idx" 
                            class="relative group w-full bg-background shadow-sm transition-all cursor-pointer hover:border-primary/50 rounded-lg overflow-hidden border-2 bg-clip-padding"
                            :class="[selectedIndices.has(idx) ? 'border-primary ring-2 ring-primary/20' : 'border-border']"
                            @click="toggleImageSelection(idx)"
                            @dblclick="previewImage = res.imageUrl">
                          <div class="relative w-full">
                            <img :src="res.imageUrl" class="w-full h-auto block" />
                            <!-- 增强图标注 -->
                            <svg v-if="res.annotations.length > 0 && res.width" 
                                class="absolute top-0 left-0 w-full h-full pointer-events-none" 
                                :viewBox="`0 0 ${res.width} ${res.height}`"
                                preserveAspectRatio="xMidYMid meet">
                              <polygon 
                                v-for="ann in res.annotations" 
                                :key="ann.id"
                                :points="getSvgPoints(ann)"
                                fill="transparent"
                                :stroke="ann.color"
                                stroke-width="2"
                                vector-effect="non-scaling-stroke"
                              />
                            </svg>
                          </div>
                          <!-- Selection Indicator -->
                          <div class="absolute top-2 left-2 z-10">
                            <div class="w-4 h-4 rounded border bg-background flex items-center justify-center transition-colors"
                                 :class="[selectedIndices.has(idx) ? 'bg-primary border-primary' : 'border-muted-foreground/30']">
                              <div v-if="selectedIndices.has(idx)" class="w-2 h-2 bg-primary-foreground rounded-full"></div>
                            </div>
                          </div>
                          <!-- Params Info -->
                          <div v-if="res.params" 
                              class="absolute -bottom-[2px] -left-[2px] -right-[15px] bg-black/60 text-white text-[10px] p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 overflow-hidden"
                              :title="Object.entries(res.params).map(([k, v]) => `${t('training.params.' + k)}: ${typeof v === 'number' ? v.toFixed(2) : v}`).join(', ')">
                            <div class="whitespace-nowrap truncate">
                              <span v-for="(val, key, index) in res.params" :key="key">
                                {{ index > 0 ? ', ' : '' }}{{ t('training.params.' + key) }}: {{ typeof val === 'number' ? val.toFixed(2) : val }}
                              </span>
                            </div>
                          </div>
                          <div class="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold z-10">
                            #{{ idx + 1 }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="innerStep === 'train'" class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[360px,1fr] gap-6">
          <aside class="border rounded-xl bg-background p-4 flex flex-col gap-4 overflow-hidden h-full min-h-[500px] md:min-h-0">
            <div class="flex-1 overflow-y-auto pr-2 space-y-4">
              <div class="space-y-1">
                <Label>{{ t('training.train.dataVersion') }}</Label>
                <UiSelect v-model="trainDatasetVersionId" v-model:open="isTrainDatasetVersionOpen">
                  <UiSelectTrigger class="h-9 text-xs bg-background w-full px-2 gap-2">
                    <UiSelectValue :placeholder="t('training.train.dataVersionPlaceholder')" />
                  </UiSelectTrigger>
                  <UiSelectContent class="z-[9999] w-[var(--radix-select-trigger-width)] min-w-[240px]">
                    <UiSelectItem v-for="v in datasetVersions" :key="v.id" :value="String(v.id)" class="pr-2">
                      <div class="flex items-center w-full gap-2">
                        <span class="flex-1 min-w-0 truncate">{{ v.displayName ? `${v.displayName} (${v.versionName})` : v.versionName }}</span>
                      </div>
                    </UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <Label class="text-xs">{{ t('training.train.modelName') }}</Label>
                  <Input v-model="trainModelName" class="h-9 text-xs px-2" />
                </div>
                <div class="space-y-1">
                  <Label class="text-xs">{{ t('training.train.runCount') }}</Label>
                  <Input type="number" v-model="trainRunCount" min="1" step="1" class="h-9 text-xs px-2" />
                </div>
              </div>

              <div class="space-y-1">
                <Label class="text-xs">{{ t('training.train.startMode') }}</Label>
                <UiSelect v-model="trainStartMode" v-model:open="isTrainStartModeOpen">
                  <UiSelectTrigger class="h-9 text-xs bg-background w-full px-2 gap-2">
                    <UiSelectValue :placeholder="t('training.train.startModePlaceholder')" />
                  </UiSelectTrigger>
                  <UiSelectContent class="z-[9999] w-[var(--radix-select-trigger-width)] min-w-[240px]">
                    <UiSelectItem value="fresh">{{ t('training.train.startModeFresh') }}</UiSelectItem>
                    <UiSelectItem value="resume">{{ t('training.train.startModeResume') }}</UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
                <div class="text-[10px] text-muted-foreground">{{ t('training.train.startModeHint') }}</div>
              </div>

              <!-- 续训子模式选择 -->
              <div v-if="trainStartMode === 'resume'" class="space-y-3 p-3 border rounded-lg bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-200">
                <div class="space-y-1">
                  <Label class="text-xs font-bold">{{ t('training.train.resumeMode') }}</Label>
                  <UiSelect v-model="resumeMode" v-model:open="isResumeModeOpen">
                    <UiSelectTrigger class="h-8 text-[11px] bg-background w-full px-2 gap-2">
                      <UiSelectValue :placeholder="t('training.train.resumeMode')" />
                    </UiSelectTrigger>
                    <UiSelectContent class="z-[9999]">
                      <UiSelectItem value="interrupted" class="text-[11px]">{{ t('training.train.resumeModeInterrupted') }}</UiSelectItem>
                      <UiSelectItem value="extended" class="text-[11px]">{{ t('training.train.resumeModeExtended') }}</UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                  <div class="text-[9px] text-muted-foreground leading-tight mt-1">{{ t('training.train.resumeModeHint') }}</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <Label class="text-xs">{{ t('training.train.projectId') }}</Label>
                  <Input :model-value="String(productId ?? '')" disabled class="h-9 text-xs px-2" />
                </div>
                <div class="space-y-1">
                  <Label class="text-xs">{{ t('training.train.projectVersion') }}</Label>
                  <Input v-model="trainProjectVersion" class="h-9 text-xs px-2" />
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between">
                  <Label>{{ trainStartMode === 'resume' && resumeMode === 'extended' ? t('training.train.epochsAdditional') : t('training.train.epochs') }}</Label>
                  <span class="text-xs font-medium">{{ trainConfig.epochs[0] }}</span>
                </div>
                <Slider v-model="trainConfig.epochs" :min="1" :max="100" />
                <div v-if="trainStartMode === 'resume' && resumeMode === 'interrupted'" class="text-[9px] text-amber-600 dark:text-amber-400">
                  {{ t('training.train.resumeModeHint') }}
                </div>
              </div>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <Label>{{ t('training.train.batchSize') }}</Label>
                  <span class="text-xs font-medium">{{ trainConfig.batchSize[0] }}</span>
                </div>
                <Slider v-model="trainConfig.batchSize" :min="1" :max="64" />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">{{ t('training.train.learningRate') }}</Label>
                <Input type="number" v-model="trainConfig.learningRate" step="0.0001" class="h-9 text-xs px-2" />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">{{ t('training.train.labelSelection') }}</Label>
                <UiSelect v-model="labelSelectionValue" v-model:open="isLabelSelectOpen">
                  <UiSelectTrigger class="h-9 text-xs">
                    <UiSelectValue :placeholder="t('training.train.allCategories')" />
                  </UiSelectTrigger>
                  <UiSelectContent class="z-[9999] w-[var(--radix-select-trigger-width)] min-w-[240px]">
                    <UiSelectItem value="all">
                      {{ t('training.train.allCategories') }}
                    </UiSelectItem>
                    <UiSelectItem v-for="label in labelConfigs" :key="label.name" :value="label.name">
                      {{ label.name }}
                    </UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>
            </div>

            <div class="mt-auto pt-4 shrink-0">
              <Separator class="mb-4" />
              <UiButton class="w-full" @click="startTraining" :disabled="isTrainingStarting || trainDatasetResults.length === 0">
                {{ isTrainingStarting ? t('training.train.starting') : t('training.train.start') }}
              </UiButton>
            </div>
          </aside>
          <section class="flex flex-col gap-4 min-h-0 h-full overflow-hidden">
            <!-- 1. Tabs Header -->
            <div class="flex items-center justify-between border-b shrink-0 bg-background px-4">
              <div class="flex gap-6">
                <button 
                  v-for="tab in ['overview', 'metrics', 'logs']" 
                  :key="tab"
                  class="h-12 text-sm font-medium transition-all relative px-1 capitalize"
                  :class="activeMonitorTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
                  @click="activeMonitorTab = tab"
                >
                  {{ t('training.monitor.tabs.' + tab) }}
                  <div v-if="activeMonitorTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                </button>
              </div>

              <!-- Top Controls (Empty as per user request to move buttons and remove select) -->
              <div class="flex items-center gap-3 py-2">
              </div>
            </div>

            <!-- 2. Tab Content Area -->
            <div class="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
              <!-- Overview Tab -->
              <div v-if="activeMonitorTab === 'overview'" class="space-y-6 animate-in fade-in duration-300">
                <!-- KPI Cards -->
                <div class="grid grid-cols-4 gap-4 shrink-0">
                  <!-- Task Progress -->
                  <div class="group border bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[120px] relative ">
                    <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Activity class="w-12 h-12 text-primary" />
                    </div>
                    <div class="flex justify-between items-start relative z-10">
                      <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{ t('training.monitor.progress') }}</span>
                    </div>
                    <div class="space-y-2.5 relative z-10">
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-black tabular-nums tracking-tight text-primary">{{ monitorTaskId && monitorTaskId !== 'all' ? normalizeProgressPercent(trainTasks.find(t => t.task_id === monitorTaskId)?.progress, trainTasks.find(t => t.task_id === monitorTaskId)?.status) : normalizeProgressPercent(monitorGroupProgress, monitorGroupStatus) }}</span>
                        <span class="text-xs text-muted-foreground font-bold">%</span>
                      </div>
                      <Progress :model-value="monitorTaskId && monitorTaskId !== 'all' ? normalizeProgressPercent(trainTasks.find(t => t.task_id === monitorTaskId)?.progress, trainTasks.find(t => t.task_id === monitorTaskId)?.status) : normalizeProgressPercent(monitorGroupProgress, monitorGroupStatus)" class="h-2 rounded-full overflow-hidden bg-primary/10" />
                    </div>
                  </div>

                  <!-- Task Status -->
                  <div class="group border rounded-2xl bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[120px] relative overflow-hidden">
                    <div class="flex justify-between items-start relative z-10">
                      <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{ t('training.monitor.status') }}</span>
                      <div class="flex items-center gap-1.5">
                        <div class="w-2 h-2 rounded-full animate-pulse-slow" :class="getStatusClass(monitorTaskId && monitorTaskId !== 'all' ? trainTasks.find(t => t.task_id === monitorTaskId)?.status : monitorStatus)"></div>
                      </div>
                    </div>
                    <div class="relative z-10">
                      <div class="text-2xl font-black tracking-tight text-foreground capitalize truncate">
                        {{ t('training.monitor.statusList.' + ((monitorTaskId && monitorTaskId !== 'all' ? trainTasks.find(t => t.task_id === monitorTaskId)?.status : monitorStatus)?.toLowerCase() || 'pending')) }}
                      </div>
                      <div class="mt-2 text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary/30"></span>
                        {{ t('training.monitor.groupLabel') }}: {{ t('training.monitor.statusList.' + (monitorGroupStatus?.toLowerCase() || 'pending')) }}
                      </div>
                    </div>
                  </div>

                  <!-- Loss KPI -->
                  <div class="group border rounded-2xl bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[120px] relative overflow-hidden">
                    <div class="flex justify-between items-start relative z-10">
                      <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{ t('training.monitor.loss') }}</span>
                      <TrendingDown class="w-4 h-4 text-red-500/40" />
                    </div>
                    <div class="space-y-1 relative z-10">
                      <div class="text-3xl font-black tracking-tight text-primary tabular-nums font-mono">
                        {{ latestMonitorMetric ? formatMetricNumber(latestMonitorMetric.loss) : '-' }}
                      </div>
                      <div class="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Zap class="w-3 h-3 text-amber-500/60" />
                        {{ t('training.monitor.latestLoss') }}
                      </div>
                    </div>
                  </div>

                  <!-- Iteration Info -->
                  <div class="group border rounded-2xl bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[120px] relative overflow-hidden">
                    <div class="flex justify-between items-start relative z-10">
                      <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{ t('training.monitor.epoch') }}</span>
                      <GitCommit class="w-4 h-4 text-blue-500/40" />
                    </div>
                    <div class="space-y-1 relative z-10">
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-black tracking-tight text-primary tabular-nums">{{ latestMonitorMetric?.epoch || 0 }}</span>
                        <span class="text-xs text-muted-foreground font-bold">/ {{ targetTotalEpochs }}</span>
                      </div>
                      <div class="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Clock class="w-3 h-3 text-blue-500/60" />
                        {{ t('training.monitor.iterPrefix') }}: {{ latestMonitorMetric?.iter || 0 }} / {{ latestMonitorMetric?.total_iters || '-' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sub-tasks Progress List -->
                <div class="flex-1 min-h-0 flex flex-col border rounded-2xl bg-background/50 backdrop-blur-sm overflow-hidden shadow-sm">
                  <div class="px-5 py-4 border-b bg-muted/20 flex items-center justify-between shrink-0">
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-2 cursor-pointer group/all" @click="toggleSelectAll">
                        <div class="w-4 h-4 rounded border bg-background flex items-center justify-center transition-colors"
                             :class="[isAllSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30 group-hover/all:border-primary/50']">
                          <div v-if="isAllSelected" class="w-2 h-2 bg-primary-foreground rounded-sm"></div>
                        </div>
                        <h4 class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-hover/all:text-foreground transition-colors">
                          <Layers class="w-3.5 h-3.5 text-primary/60" />
                          {{ t('training.monitor.subTasksProgress') }}
                        </h4>
                      </div>
                      
                      <UiButton 
                        v-if="selectedTaskIds.size > 0"
                        variant="destructive" 
                        size="xs" 
                        class="h-6 px-2 text-[10px] animate-in fade-in slide-in-from-left-2"
                        @click="batchCancel"
                        :disabled="isStoppingTask"
                      >
                        <Square class="w-3 h-3 mr-1" />
                        {{ t('training.monitor.batchCancel') }} ({{ selectedTaskIds.size }})
                      </UiButton>
                    </div>
                    <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/10">{{ t('training.monitor.labelsTotal', { count: trainTasks.length }) }}</span>
                  </div>
                  <div class="divide-y divide-border/50 overflow-y-auto custom-scrollbar flex-1">
                    <div v-for="tItem in trainTasks" :key="tItem.task_id" 
                      class="flex flex-col transition-all duration-300 group/item"
                      :class="monitorTaskId === tItem.task_id ? 'bg-primary/[0.03]' : 'hover:bg-muted/10'"
                    >
                      <div class="p-5 flex items-center gap-8 cursor-pointer" @click="if(monitorTaskId !== tItem.task_id) { monitorTaskId = tItem.task_id; loadTaskSnapshot(tItem.task_id) }">
                        <div class="flex items-center gap-4 w-48 shrink-0">
                          <!-- 批量选择框 -->
                          <div v-if="['pending', 'running', 'training', 'starting'].includes(tItem.status?.toLowerCase() || '')"
                               class="w-4 h-4 rounded border bg-background flex items-center justify-center transition-colors shrink-0"
                               :class="[selectedTaskIds.has(tItem.task_id) ? 'bg-primary border-primary' : 'border-muted-foreground/30 hover:border-primary/50']"
                               @click.stop="toggleTaskSelection(tItem.task_id)">
                            <div v-if="selectedTaskIds.has(tItem.task_id)" class="w-2 h-2 bg-primary-foreground rounded-sm"></div>
                          </div>
                          <div v-else class="w-4 h-4 shrink-0"></div>

                          <div class="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-all duration-300 animate-pulse-slow" :class="[getStatusClass(tItem.status), monitorTaskId === tItem.task_id ? 'ring-4 ring-primary/20 scale-110' : '']"></div>
                          <div class="truncate text-sm font-semibold tracking-tight transition-colors" :class="monitorTaskId === tItem.task_id ? 'text-primary' : 'text-foreground/80 group-hover/item:text-foreground'">{{ tItem.label }}</div>
                        </div>
                        <div class="flex-1 grid grid-cols-[1fr_100px] items-center gap-10">
                          <div class="space-y-2">
                            <div class="flex justify-between text-[10px]">
                              <span class="text-muted-foreground uppercase font-bold tracking-wider">{{ t('training.monitor.statusList.' + (tItem.status?.toLowerCase() || 'pending')) }}</span>
                              <span class="font-black text-primary">{{ normalizeProgressPercent(tItem.progress, tItem.status) }}%</span>
                            </div>
                            <Progress :model-value="normalizeProgressPercent(tItem.progress, tItem.status)" class="h-2 rounded-full bg-primary/10 overflow-hidden" />
                          </div>
                          <div class="flex items-center justify-end gap-2 shrink-0 w-[80px]">
                            <!-- 终止按钮：在等待中/训练中/启动中显示 -->
                            <UiButton 
                              v-if="['pending', 'running', 'training', 'starting'].includes(tItem.status?.toLowerCase() || '')"
                              variant="ghost" 
                              size="icon" 
                              class="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                              @click.stop="tItem.task_id === 'all' ? stopGroup() : stopTask(tItem.task_id)"
                              :title="isStoppingTask || isStoppingGroup ? t('training.train.stopping') : t('training.monitor.stopTask')"
                              :disabled="isStoppingTask || isStoppingGroup"
                            >
                              <Square class="w-4 h-4" :class="{ 'animate-pulse': isStoppingTask || isStoppingGroup }" />
                            </UiButton>

                            <!-- 续训按钮：仅在已停止/已取消/已中断/失败状态显示 -->
                            <UiButton 
                              v-if="['stopped', 'cancelled', 'interrupted', 'failed'].includes(tItem.status?.toLowerCase() || '')"
                              variant="ghost" 
                              size="icon" 
                              class="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors"
                              @click.stop="tItem.task_id === 'all' ? resumeGroup() : resumeTask(tItem.task_id)"
                              :title="isResumingTask ? t('training.train.resuming') : t('training.monitor.resumeTask')"
                              :disabled="isResumingTask || isStoppingTask || isStoppingGroup"
                            >
                              <Play class="w-4 h-4" :class="{ 'animate-pulse': isResumingTask }" />
                            </UiButton>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Inline Chart (Accordion Content) -->
                      <div v-if="monitorTaskId === tItem.task_id" class="border-t border-border/50 bg-muted/[0.02] p-6 animate-in slide-in-from-top-4 duration-300">
                        <div class="flex items-center justify-between mb-5">
                          <h4 class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Activity class="w-4 h-4 text-primary/60" />
                            {{ t('training.monitor.metrics') }}
                          </h4>
                          <div v-if="selectedEpoch !== null" class="flex items-center gap-2">
                            <span class="text-[10px] px-3 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">{{ t('training.monitor.epoch') }} {{ selectedEpoch }}</span>
                            <UiButton variant="ghost" size="sm" class="h-7 text-[10px] px-3 rounded-full hover:bg-primary/5" @click="selectedEpoch = null">
                              {{ t('training.monitor.showAllEpochs') }}
                            </UiButton>
                          </div>
                        </div>
                        <div class="h-[350px] w-full relative bg-background/50 rounded-2xl border border-border/50 shadow-inner p-4">
                          <Line :key="tItem.task_id" :data="combinedChartData" :options="chartOptions" :plugins="[epochLinesPlugin]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Metrics Tab -->
              <div v-else-if="activeMonitorTab === 'metrics'" class="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div class="flex items-center justify-between mb-2">
                   <div class="flex items-center gap-2">
                      <h3 class="text-lg font-bold">{{ trainTasks.find(t => t.task_id === monitorTaskId)?.label || t('training.monitor.metrics') }}</h3>
                      <span v-if="monitorTaskId && monitorTaskId !== 'all'" class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">{{ t('training.monitor.statusList.' + (monitorStatus?.toLowerCase() || 'pending')) }}</span>
                   </div>
                   <div v-if="selectedEpoch !== null" class="flex items-center gap-2">
                      <span class="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{{ t('training.monitor.epoch') }} {{ selectedEpoch }}</span>
                      <UiButton variant="ghost" size="sm" class="h-6 text-[10px] px-2" @click="selectedEpoch = null">
                        {{ t('training.monitor.showAllEpochs') }}
                      </UiButton>
                   </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div class="lg:col-span-2 space-y-6">
                    <div class="border rounded-xl bg-background p-6 shadow-sm">
                      <h4 class="text-sm font-bold mb-4">{{ t('training.monitor.metrics') }}</h4>
                      <div class="h-[400px] w-full">
                        <Line :key="trainGroupId" :data="combinedChartData" :options="chartOptions" :plugins="[epochLinesPlugin]" />
                      </div>
                    </div>
                  </div>
                  <div class="space-y-6">
                    <!-- Statistics Card -->
                    <div class="border rounded-xl bg-background p-6 shadow-sm space-y-4">
                      <h4 class="text-sm font-bold border-b pb-2">{{ t('training.monitor.taskStats') }}</h4>
                      <div class="space-y-3">
                        <div class="flex justify-between">
                          <span class="text-xs text-muted-foreground">{{ t('training.monitor.currentLoss') }}</span>
                          <span class="text-xs font-mono font-bold text-primary">{{ latestMonitorMetric ? formatMetricNumber(latestMonitorMetric.loss) : '-' }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-xs text-muted-foreground">{{ t('training.monitor.currentLR') }}</span>
                          <span class="text-xs font-mono">{{ latestMonitorMetric ? formatMetricNumber(latestMonitorMetric.lr) : '-' }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-xs text-muted-foreground">{{ t('training.monitor.epochProgress') }}</span>
                          <span class="text-xs">{{ latestMonitorMetric?.epoch || 0 }} / {{ targetTotalEpochs }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- History Table -->
                    <div class="border rounded-xl bg-background shadow-sm flex flex-col overflow-hidden max-h-[400px]">
                      <div class="bg-muted/30 px-4 py-3 border-b">
                        <h4 class="text-xs font-bold">{{ t('training.monitor.metricHistory') }}</h4>
                      </div>
                      <div class="flex-1 overflow-auto custom-scrollbar">
                        <table class="w-full text-[10px]">
                          <thead class="bg-muted/10 sticky top-0 backdrop-blur-sm">
                            <tr>
                              <th class="text-left font-semibold px-4 py-2 text-muted-foreground">{{ t('training.monitor.epoch') }}</th>
                              <th class="text-right font-semibold px-4 py-2 text-muted-foreground">{{ t('training.monitor.loss') }}</th>
                              <th class="text-right font-semibold px-4 py-2 text-muted-foreground">{{ t('training.monitor.lr') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="m in cleanedMonitorMetrics.slice(-20).reverse()" :key="`${m.epoch}-${m.iter}`" class="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td class="px-4 py-2">{{ t('training.monitor.epoch') }}{{ m.epoch }} · {{ t('training.monitor.iter') }}{{ m.iter }}</td>
                              <td class="px-4 py-2 text-right font-mono text-primary font-medium">{{ formatMetricNumber(m.loss) }}</td>
                              <td class="px-4 py-2 text-right font-mono text-muted-foreground">{{ formatMetricNumber(m.lr) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Logs Tab -->
              <div v-else-if="activeMonitorTab === 'logs'" class="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                <div class="flex-1 border rounded-xl bg-background p-6 shadow-sm flex flex-col min-h-0">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <Terminal class="w-4 h-4 text-primary" />
                      <span class="text-sm font-bold">{{ t('training.monitor.tabs.logs') }}</span>
                    </div>
                    <UiButton variant="ghost" size="sm" class="h-8 text-[10px]" @click="monitorLogs = []">{{ t('training.monitor.clearLogs') }}</UiButton>
                  </div>
                  <div class="flex-1 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-300 custom-scrollbar border-slate-800">
                    <div v-for="(log, idx) in monitorLogs" :key="idx" class="mb-1.5 last:mb-0 break-all border-l-2 border-slate-800 pl-3 hover:border-primary/40 transition-colors">
                      <span class="text-slate-500 mr-2 tabular-nums">[{{ new Date().toLocaleTimeString() }}]</span>
                      <span>{{ log }}</span>
                    </div>
                    <div v-if="monitorLogs.length === 0" class="flex flex-col items-center justify-center h-full text-slate-600">
                      <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mb-3">
                        <Terminal class="w-5 h-5 opacity-40" />
                      </div>
                      <span class="text-xs">{{ t('training.monitor.waitingLogs') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Full Image Preview Modal -->
    <div v-if="showUnsavedDialog" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-background border rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
        <div class="flex items-center gap-3 text-destructive">
          <div class="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <Settings class="h-5 w-5" />
          </div>
          <h3 class="font-bold text-lg">{{ t('training.view.unsavedWarning') }}</h3>
        </div>
        <p class="text-sm text-muted-foreground">{{ t('training.view.unsavedWarning') }}</p>
        <div class="flex gap-3 pt-2">
          <UiButton variant="outline" class="flex-1" @click="showUnsavedDialog = false">{{ t('training.view.saveFirst') }}</UiButton>
          <UiButton variant="destructive" class="flex-1" @click="enterTrainStep({ useCurrent: true }); showUnsavedDialog = false">{{ t('training.view.confirmNext') }}</UiButton>
        </div>
      </div>
    </div>

    <div v-if="showSaveDialog" class="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click="closeSaveDialog">
      <div class="bg-background border rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-200" @click.stop>
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg">{{ t('training.view.saveDialogTitle') }}</h3>
          <UiButton variant="ghost" size="sm" class="h-8 w-8 p-0" @click="closeSaveDialog">
            <X class="h-4 w-4" />
          </UiButton>
        </div>

        <div class="space-y-3">
          <div class="space-y-1.5">
            <Label class="text-xs">{{ t('training.view.datasetName') }}</Label>
            <Input v-model="saveDisplayName" :placeholder="t('training.view.datasetNamePlaceholder')" class="h-9 text-sm px-3" />
          </div>
          <div class="space-y-1.5">
            <Label class="text-xs">{{ t('training.view.versionName') }}</Label>
            <Input v-model="saveVersionName" :placeholder="t('training.view.versionPlaceholder')" class="h-9 text-sm px-3" />
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <UiButton variant="outline" class="flex-1" @click="closeSaveDialog" :disabled="isSavingDataset">{{ t('training.view.cancel') }}</UiButton>
          <UiButton class="flex-1" @click="confirmSaveDataset" :disabled="isSavingDataset">
            {{ isSavingDataset ? t('training.view.saving') : t('training.view.confirmSave') }}
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click="showDeleteConfirm = false">
      <div class="bg-background border rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200" @click.stop>
        <div class="flex items-center gap-3 text-destructive">
          <div class="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <X class="h-5 w-5" />
          </div>
          <h3 class="font-bold text-lg">{{ t('common.confirmDelete') }}</h3>
        </div>
        <p class="text-sm text-muted-foreground">{{ t('training.view.deleteVersionWarning') }}</p>
        <div class="flex gap-3 pt-2">
          <UiButton variant="outline" class="flex-1" @click="showDeleteConfirm = false">{{ t('common.cancel') }}</UiButton>
          <UiButton variant="destructive" class="flex-1" @click="handleDeleteVersion">{{ t('common.confirm') }}</UiButton>
        </div>
      </div>
    </div>

    <div v-if="previewImage" 
         class="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-12 animate-in fade-in zoom-in duration-200"
         @click="previewImage = null">
      <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center group" @click.stop>
        <img :src="previewImage" class="max-w-full max-h-[85vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" />
        <button 
          class="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur border shadow-xl flex items-center justify-center hover:bg-background transition-all hover:scale-110 active:scale-95 z-10"
          @click="previewImage = null"
        >
          <X class="h-5 w-5" />
        </button>
        <!-- Info Overlay on hover -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {{ t('training.view.previewMode') }}
        </div>
      </div>
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

/* Custom Scrollbar Beautification */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.15);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.5);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground) / 0.15) transparent;
}

/* Slow Pulse Animation */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.92);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
