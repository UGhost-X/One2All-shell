<script setup lang="ts">
import {
  Pin,
  PinOff,
  Image as ImageIcon,
  List,
  BarChart3,
  Settings2,
  Camera,
  Video,
  CameraIcon,
  Upload,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  RotateCw,
  RefreshCcw,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Minimize2,
  Minus,
  Power,
  PowerOff,
  Settings,
  Pencil,
  Wand2,
  Loader2,
  Eye,
  EyeOff,
  ChevronRight,
  Sparkles,
  Square,
  Wifi,
  Plug,
  Unplug,
  Aperture,
  Package,
  Usb,
  AlertTriangle,
  MoreVertical,
  X,
  Workflow,
  Play,
  StopCircle
} from 'lucide-vue-next'
import { computed, ref, onBeforeUnmount, onMounted, onActivated, watch, nextTick, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Select from '@/components/ui/select/Select.vue'
import SelectContent from '@/components/ui/select/SelectContent.vue'
import SelectItem from '@/components/ui/select/SelectItem.vue'
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import SelectValue from '@/components/ui/select/SelectValue.vue'
import UiCard from '@/components/ui/card/Card.vue'
import UiCardHeader from '@/components/ui/card/CardHeader.vue'
import UiCardTitle from '@/components/ui/card/CardTitle.vue'
import UiCardDescription from '@/components/ui/card/CardDescription.vue'
import UiCardContent from '@/components/ui/card/CardContent.vue'
import UiCardFooter from '@/components/ui/card/CardFooter.vue'

import { useWorkflowExecutor } from '../composables/useWorkflowExecutor'
import WorkflowSelector from '../components/WorkflowSelector.vue'
import WorkflowExecutionProgress from '../components/WorkflowExecutionProgress.vue'
import WorkflowResultSummary from '../components/WorkflowResultSummary.vue'

definePageMeta({ name: 'HomePage' })

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const globalToast = inject<any>('toast')

// ====== 工作流 ======
const workflowList = ref<Array<{ id: string; name: string; description?: string; stepCount: number }>>([])
const activeWorkflowId = ref<string | null>(null)
const activeWorkflowSteps = ref<any[]>([])
const workflowStepImages = ref<Record<number, { dataUrl: string; detections: any[] }>>({})
const viewingStepIndex = ref<number>(-1)
const showWorkflowGrid = ref(true)  // 是否显示工作流步骤网格（点击步骤放大，点击空白回网格）
const workflowExecutor = useWorkflowExecutor()
const selectedPredictionStep = ref<number | null>(null)  // 预测结果区域选中的步骤

// Toast State
const showToast = (message: string, type: 'info' | 'error' = 'info') => {
  if (type === 'error') {
    globalToast?.error(message)
  } else {
    globalToast?.info(message)
  }
}

const isToolbarFixed = ref(false)
const isToolbarHovered = ref(false)

let toolbarTimer: any = null
const handleToolbarHover = (hovering: boolean) => {
  if (toolbarTimer) clearTimeout(toolbarTimer)
  if (hovering) {
    isToolbarHovered.value = true
  } else {
    toolbarTimer = setTimeout(() => {
      isToolbarHovered.value = false
    }, 1000)
  }
}

const mainViewState = ref<'empty' | 'image' | 'live'>('empty')
const mainViewUrl = ref('')

const viewerViewportRef = ref<HTMLElement | null>(null)
const viewerImageRef = ref<HTMLImageElement | null>(null)
const detectionCanvasRef = ref<HTMLCanvasElement | null>(null)

const viewerZoom = ref(1)
const viewerRotationDeg = ref(0)
const viewerPanX = ref(0)
const viewerPanY = ref(0)
const viewerIsPanning = ref(false)
const viewerPointerId = ref<number | null>(null)
const viewerStartPoint = ref({ x: 0, y: 0, panX: 0, panY: 0 })
const viewerViewportSize = ref({ w: 0, h: 0 })
const viewerImageNatural = ref<{ w: number; h: number } | null>(null)
const viewerIsFullscreen = ref(false)

let viewerResizeObserver: ResizeObserver | null = null

const viewerHasImage = computed(() => {
  return (
    mainViewState.value === 'image' &&
    !!mainViewUrl.value &&
    !!viewerImageNatural.value &&
    viewerViewportSize.value.w > 0 &&
    viewerViewportSize.value.h > 0
  )
})

const viewerBaseScale = computed(() => {
  const img = viewerImageNatural.value
  const vp = viewerViewportSize.value
  if (!img || vp.w <= 0 || vp.h <= 0) return 1
  return Math.min(vp.w / img.w, vp.h / img.h)
})

const viewerScale = computed(() => viewerBaseScale.value * viewerZoom.value)

const viewerTransformStyle = computed(() => {
  return {
    transform: `translate(${viewerPanX.value}px, ${viewerPanY.value}px) translate(-50%, -50%) rotate(${viewerRotationDeg.value}deg) scale(${viewerScale.value})`,
    transformOrigin: 'center center',
  }
})

const viewerImageStyle = computed(() => {
  const img = viewerImageNatural.value
  if (!img) return {}
  return { width: `${img.w}px`, height: `${img.h}px` }
})

// 工作流网格布局计算
const workflowGridLayout = computed(() => {
  const stepCount = Object.keys(workflowStepImages.value).length
  if (stepCount <= 1) return { cols: 1, rows: 1 }
  if (stepCount === 2) return { cols: 2, rows: 1 }
  if (stepCount <= 4) return { cols: 2, rows: 2 }
  if (stepCount <= 6) return { cols: 3, rows: 2 }
  if (stepCount <= 9) return { cols: 3, rows: 3 }
  return { cols: 4, rows: Math.ceil(stepCount / 4) }
})

const viewerZoomLabel = computed(() => `${Math.round(viewerZoom.value * 100)}%`)

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const updateViewerViewportSize = () => {
  const el = viewerViewportRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  viewerViewportSize.value = { w: rect.width, h: rect.height }
}

const ensureViewerResizeObserver = () => {
  if (!viewerViewportRef.value || typeof ResizeObserver === 'undefined') return
  viewerResizeObserver?.disconnect()
  viewerResizeObserver = new ResizeObserver(() => {
    updateViewerViewportSize()
  })
  viewerResizeObserver.observe(viewerViewportRef.value)
}

const resetViewer = () => {
  viewerZoom.value = 1
  viewerRotationDeg.value = 0
  viewerPanX.value = 0
  viewerPanY.value = 0
}

const getRotationCosSin = () => {
  const theta = (viewerRotationDeg.value * Math.PI) / 180
  return { cos: Math.cos(theta), sin: Math.sin(theta) }
}

const setZoomAtPoint = (nextZoom: number, pointX: number, pointY: number) => {
  const img = viewerImageNatural.value
  const vp = viewerViewportSize.value
  if (!img || vp.w <= 0 || vp.h <= 0) {
    viewerZoom.value = clamp(nextZoom, 0.05, 20)
    return
  }

  const next = clamp(nextZoom, 0.05, 20)
  const { cos, sin } = getRotationCosSin()

  const cx = vp.w / 2
  const cy = vp.h / 2
  const s = viewerScale.value
  if (s <= 0) {
    viewerZoom.value = next
    return
  }

  const dx = pointX - cx - viewerPanX.value
  const dy = pointY - cy - viewerPanY.value

  const pX = (cos * dx + sin * dy) / s
  const pY = (-sin * dx + cos * dy) / s

  viewerZoom.value = next

  const s2 = viewerBaseScale.value * viewerZoom.value
  const x2 = (cos * pX - sin * pY) * s2
  const y2 = (sin * pX + cos * pY) * s2

  viewerPanX.value = pointX - cx - x2
  viewerPanY.value = pointY - cy - y2
}

const zoomInCenter = () => {
  const vp = viewerViewportSize.value
  setZoomAtPoint(viewerZoom.value * 1.2, vp.w / 2, vp.h / 2)
}

const zoomOutCenter = () => {
  const vp = viewerViewportSize.value
  setZoomAtPoint(viewerZoom.value / 1.2, vp.w / 2, vp.h / 2)
}

const rotateLeft = () => {
  viewerRotationDeg.value = (viewerRotationDeg.value - 90) % 360
}

const rotateRight = () => {
  viewerRotationDeg.value = (viewerRotationDeg.value + 90) % 360
}

const toggleFullscreen = async () => {
  const el = viewerViewportRef.value
  if (!el) return
  try {
    if (document.fullscreenElement === el) {
      await document.exitFullscreen()
    } else {
      await el.requestFullscreen()
    }
  } catch (err) {
    console.error('Failed to toggle fullscreen:', err)
  }
}

const syncFullscreenState = () => {
  viewerIsFullscreen.value = document.fullscreenElement === viewerViewportRef.value
}

const onViewerPointerDown = (e: PointerEvent) => {
  if (!viewerHasImage.value) return
  if (e.button !== 0) return
  const el = viewerViewportRef.value
  if (!el) return
  viewerIsPanning.value = true
  viewerPointerId.value = e.pointerId
  viewerStartPoint.value = { x: e.clientX, y: e.clientY, panX: viewerPanX.value, panY: viewerPanY.value }
  el.setPointerCapture(e.pointerId)
}

const onViewerPointerMove = (e: PointerEvent) => {
  if (!viewerIsPanning.value) return
  if (viewerPointerId.value !== e.pointerId) return
  const dx = e.clientX - viewerStartPoint.value.x
  const dy = e.clientY - viewerStartPoint.value.y
  viewerPanX.value = viewerStartPoint.value.panX + dx
  viewerPanY.value = viewerStartPoint.value.panY + dy
}

const onViewerPointerUp = (e: PointerEvent) => {
  if (viewerPointerId.value !== e.pointerId) return
  viewerIsPanning.value = false
  viewerPointerId.value = null
}

const onViewerWheel = (e: WheelEvent) => {
  if (!viewerHasImage.value) return
  const el = viewerViewportRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
  setZoomAtPoint(viewerZoom.value * factor, x, y)
}

const handleMainImageLoad = (e: Event) => {
  const imgEl = e.target as HTMLImageElement | null
  if (!imgEl) return
  viewerImageNatural.value = { w: imgEl.naturalWidth || imgEl.width, h: imgEl.naturalHeight || imgEl.height }
  updateViewerViewportSize()
  // 图片加载完成后重绘检测框（确保 canvas 尺寸与图片匹配）
  if (detectionResults.value.length > 0) {
    nextTick(() => drawDetectionBoxes())
  }
}

const captureScreenshot = async () => {
  const imgEl = viewerImageRef.value
  const img = viewerImageNatural.value
  const vp = viewerViewportSize.value
  if (!imgEl || !img || vp.w <= 0 || vp.h <= 0) return

  const dpr = window.devicePixelRatio || 1
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(vp.w * dpr))
  canvas.height = Math.max(1, Math.round(vp.h * dpr))
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, vp.w, vp.h)

  const theta = (viewerRotationDeg.value * Math.PI) / 180
  ctx.translate(vp.w / 2 + viewerPanX.value, vp.h / 2 + viewerPanY.value)
  ctx.rotate(theta)
  ctx.scale(viewerScale.value, viewerScale.value)
  ctx.translate(-img.w / 2, -img.h / 2)
  ctx.drawImage(imgEl, 0, 0, img.w, img.h)

  const dataUrl = canvas.toDataURL('image/png')
  const fileName = `screenshot_${Date.now()}.png`

  if (window.electronAPI?.saveImage && selectedProductId.value) {
    try {
      await window.electronAPI.saveImage({ productId: selectedProductId.value, fileName, dataUrl })
    } catch (err) {
      console.error('Failed to save screenshot:', err)
    }
    return
  }

  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName
  a.click()
}

// Interactive Settings
const exposureValue = ref(117)  // 52*117 = 6084，默认约6ms
const gainValue = ref(588)
const offsetXValue = ref(0)
const offsetYValue = ref(0)
const widthValue = ref<number | null>(null)
const heightValue = ref<number | null>(null)

const loadImageSettings = async () => {
  if (window.electronAPI?.getSettings) {
    try {
      const settings = await window.electronAPI.getSettings()
      if (settings?.imageSettings) {
        exposureValue.value = settings.imageSettings.exposure ? Math.round(settings.imageSettings.exposure / 52) : 117
        gainValue.value = settings.imageSettings.gain ?? 588
        offsetXValue.value = settings.imageSettings.offsetX ?? 0
        offsetYValue.value = settings.imageSettings.offsetY ?? 0
        widthValue.value = settings.imageSettings.width ?? null
        heightValue.value = settings.imageSettings.height ?? null
      }
    } catch (err) {
      console.error('Failed to load image settings:', err)
    }
  }
}

const saveImageSettings = async () => {
  if (window.electronAPI?.saveSettings) {
    try {
      const currentSettings = await window.electronAPI.getSettings() || {}
      await window.electronAPI.saveSettings({
        ...currentSettings,
        imageSettings: {
          exposure: exposureValue.value * 52,
          gain: gainValue.value,
          offsetX: offsetXValue.value,
          offsetY: offsetYValue.value,
          width: widthValue.value,
          height: heightValue.value
        }
      })
    } catch (err) {
      console.error('Failed to save image settings:', err)
    }
  }
}

watch(exposureValue, () => {
  if (isLiveStreaming.value) {
    updateCameraSettings()
  }
  saveImageSettings()
})

watch(gainValue, () => {
  if (isLiveStreaming.value) {
    updateCameraSettings()
  }
  saveImageSettings()
})

watch(offsetXValue, () => {
  if (isLiveStreaming.value) {
    updateCameraSettings()
  }
  saveImageSettings()
})

watch(offsetYValue, () => {
  if (isLiveStreaming.value) {
    updateCameraSettings()
  }
  saveImageSettings()
})

watch(widthValue, () => {
  saveImageSettings()
})

watch(heightValue, () => {
  saveImageSettings()
})

const predictionConfidence = ref<number | null>(null)
const predictionResults = ref<Array<{ label: string; score: number }>>([])

const selectedProduct = computed(() => {
  return products.value.find(p => p.id === selectedProductId.value)
})

const selectedProductHasImage = computed(() => {
  return !!selectedProduct.value?.lastImagePath
})

const selectedProductAnnotations = ref<any>(null)

const selectedProductHasAnnotation = computed(() => {
  return !!selectedProductAnnotations.value
})

const fetchProductAnnotations = async () => {
  if (!selectedProductId.value || !selectedProduct.value?.lastImagePath) {
    selectedProductAnnotations.value = null
    return
  }
  
  if (window.electronAPI?.getAnnotations) {
    try {
      const annotations = await window.electronAPI.getAnnotations(
        selectedProductId.value,
        selectedProduct.value.lastImagePath
      )
      selectedProductAnnotations.value = annotations
    } catch (err) {
      console.error('Failed to fetch annotations:', err)
      selectedProductAnnotations.value = null
    }
  }
}
const detectionResults = ref<Array<{
  label: string
  score: number
  bbox: [number, number, number, number]
  segmentation?: number[]
  isAnomaly?: boolean
  error?: number
  threshold?: number
  alignmentStrategy?: string
  visible?: boolean
  anomaly_type?: string
  category?: string
  pos_id?: string | number
}>>([])

const inferenceServices = ref<Array<{ service_id: string; task_uuid: string; port: number; inference_url: string; labels: string[] }>>([])
const selectedInferenceService = ref<string>('')
const isInferring = ref(false)
let inferenceAbortController: AbortController | null = null
const showInferenceModal = ref(false)
const inferenceImageUrl = ref('')
const inferenceFileInput = ref<HTMLInputElement | null>(null)

// Modals
const showProductModal = ref(false)
const newProductName = ref('')
const newProductModel = ref('')
const newProductCameraId = ref<string | undefined>(undefined)

// Product & Camera Data
const products = ref<any[]>([])
const cameras = ref<any[]>([])

const fetchInitialData = async () => {
  if (window.electronAPI) {
    products.value = await window.electronAPI.getProducts()
    cameras.value = await window.electronAPI.getCameras()
    await fetchProductAnnotations()
  }
}

const fetchInferenceServices = async () => {
  try {
    const projectId = selectedProductId.value || ''
    const url = projectId
      ? getBackendUrl(`/deploy/http/services?project_id=${projectId}&include_health=true`)
      : getBackendUrl('/deploy/http/services?include_health=true')
    const res = await fetch(url)
    const data = await res.json()
    inferenceServices.value = (data.services || []).filter((s: any) => s.status === 'running')
  } catch (err) {
    console.error('Failed to fetch inference services:', err)
    inferenceServices.value = []
  }
}

/**
 * 供主进程通过 executeJavaScript 调用的外部拍照入口
 * 返回 { success: boolean, error?: string }，主进程据此控制指示灯
 */
async function externalCapture() {
  // 检查 localStorage 中是否有启用的工作流
  const enabledWorkflowId = localStorage.getItem('activeWorkflowId')
  if (!enabledWorkflowId) {
    return { success: false, error: '没有启用的工作流' }
  }

  // 如果 activeWorkflowId 与启用的工作流不一致，重新加载
  if (activeWorkflowId.value !== enabledWorkflowId) {
    await loadWorkflowList()
    const enabledWorkflow = workflowList.value.find(wf => wf.id === enabledWorkflowId)
    if (!enabledWorkflow) {
      localStorage.removeItem('activeWorkflowId')
      return { success: false, error: '启用的工作流已不存在' }
    }
    await selectWorkflow(enabledWorkflowId)
  }

  // 工作流模式：委托给工作流执行器
  if (activeWorkflowId.value) {
    const workflow = {
      id: activeWorkflowId.value,
      name: '',
      steps: activeWorkflowSteps.value
    }
    try {
      const result = await workflowExecutor.executeWorkflow(workflow)
      // 将结果存入全局检测结果供 UI 展示
      detectionResults.value = result.allDetections.map(d => ({
        label: d.label,
        score: d.score,
        bbox: d.bbox,
        segmentation: d.segmentation,
        isAnomaly: d.isAnomaly,
        visible: true,
        anomaly_type: d.anomaly_type,
        category: d.category,
        pos_id: d.pos_id,
        workpiece_id: d.workpiece_id,
        workpiece_key: d.workpiece_key,
        workflowStepIndex: d.workflowStepIndex
      } as any))
      // 存储每步的图片，用于切换查看
      workflowStepImages.value = {}
      workflowExecutor.stepResults.value.forEach((r, i) => {
        if (r.dataUrl) {
          workflowStepImages.value[i] = {
            dataUrl: r.dataUrl,
            detections: r.detections
          }
        }
      })
      // 工作流结果不替换主视图的产品图，只在网格区域展示
      viewingStepIndex.value = -1
      showWorkflowGrid.value = true
      // 推理被跳过的步骤也视为不成功，避免硬件指示灯误报 OK
      return { success: result.success && result.inferenceSkippedCount === 0 }
    } catch (err: any) {
      return { success: false, error: err?.message || '工作流执行失败' }
    }
  }

  // 单品模式（原有逻辑）
  if (!selectedProductId.value) {
    showToast('请先选择一个产品', 'error')
    return { success: false, error: '请先在界面中选择一个产品' }
  }

  const targetCamera = getEffectiveCamera()
  if (!targetCamera) {
    showToast('请先在产品设置中绑定相机', 'error')
    return { success: false, error: '未找到绑定的相机' }
  }
  if (targetCamera.isEnabled === false) {
    showToast('当前相机已禁用，请先启用相机', 'error')
    return { success: false, error: '当前相机已禁用' }
  }
  if (targetCamera.isNetworkCamera && targetCamera.status !== 'online') {
    const connected = await ensureCameraConnected(targetCamera)
    if (!connected) return { success: false, error: '相机连接失败' }
  }

  try {
    const ok = await takeCapture()
    if (isInferring.value) {
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (!isInferring.value) {
            clearInterval(check)
            resolve()
          }
        }, 200)
      })
    }
    return { success: ok }
  } catch (err: any) {
    showToast(err?.message || '拍照失败', 'error')
    return { success: false, error: err?.message || '拍照失败' }
  }
}

// ====== 工作流执行 (UI触发) ======
async function startWorkflowExecution() {
  if (!activeWorkflowId.value) {
    showToast('请先选择一个工作流', 'error')
    return
  }

  const workflow = {
    id: activeWorkflowId.value,
    name: '',
    steps: activeWorkflowSteps.value
  }

  try {
    const result = await workflowExecutor.executeWorkflow(workflow)
    detectionResults.value = result.allDetections.map(d => ({
      label: d.label,
      score: d.score,
      bbox: d.bbox,
      segmentation: d.segmentation,
      isAnomaly: d.isAnomaly,
      visible: true,
      anomaly_type: d.anomaly_type,
      category: d.category,
      pos_id: d.pos_id,
      workpiece_id: d.workpiece_id,
      workpiece_key: d.workpiece_key,
      workflowStepIndex: d.workflowStepIndex
    } as any))

    workflowStepImages.value = {}
    workflowExecutor.stepResults.value.forEach((r, i) => {
      if (r.dataUrl) {
        workflowStepImages.value[i] = { dataUrl: r.dataUrl, detections: r.detections }
      }
    })

    // 工作流结果不替换主视图的产品图，只在网格区域展示
    viewingStepIndex.value = -1
    showWorkflowGrid.value = true

    // 显示预检警告
    if (result.preflightWarnings?.length > 0) {
      result.preflightWarnings.forEach(w => showToast(w, 'error'))
    }

    if (workflowExecutor.failedSteps.value > 0) {
      showToast('工作流执行有步骤失败', 'error')
    } else if (result.inferenceSkippedCount > 0) {
      const totalSteps = workflowExecutor.stepResults.value.length
      showToast(`工作流执行完成 — ${result.inferenceSkippedCount}/${totalSteps} 个步骤推理服务自动启动失败，已跳过推理`, 'error')
    } else if (workflowExecutor.overallAnomaly.value) {
      showToast(`工作流执行完成 — 检出 ${workflowExecutor.totalAnomalyCount.value} 个缺陷`, 'info')
    } else {
      showToast('工作流执行完成 — OK', 'info')
    }
  } catch (err: any) {
    showToast(err?.message || '工作流执行失败', 'error')
  }
}

async function abortWorkflow() {
  workflowExecutor.abort()
  showToast('工作流已取消', 'info')
}

// 切换查看不同步骤的预测结果（在预测结果区域显示）
function viewStepImage(stepIndex: number) {
  const img = workflowStepImages.value[stepIndex]
  if (img) {
    selectedPredictionStep.value = stepIndex
    showWorkflowGrid.value = false
    viewingStepIndex.value = stepIndex
    mainViewUrl.value = img.dataUrl
    mainViewState.value = 'image'
    // 只显示当前步骤的检测结果
    detectionResults.value = img.detections.map(d => ({
      ...d,
      visible: true
    } as any))
  }
}

// 返回步骤列表
function backToStepList() {
  selectedPredictionStep.value = null
  detectionResults.value = []
}

// 从单步放大视图回到工作流网格
function backToWorkflowGrid() {
  showWorkflowGrid.value = true
  detectionResults.value = []
  // 清除检测画布
  if (detectionCanvasRef.value) {
    const ctx = detectionCanvasRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, detectionCanvasRef.value.width, detectionCanvasRef.value.height)
    }
  }
}

// 加载工作流列表
async function loadWorkflowList() {
  try {
    const api = (window as any).electronAPI
    if (!api?.listWorkflows) return
    const list = await api.listWorkflows()
    workflowList.value = (list || []).map((wf: any) => ({
      id: wf.id,
      name: wf.name,
      description: wf.description,
      stepCount: (wf.steps || []).length
    }))
  } catch (err) {
    console.error('加载工作流列表失败:', err)
  }
}

// 加载工作流详情（步骤）
async function loadWorkflowSteps(workflowId: string) {
  try {
    const api = (window as any).electronAPI
    if (!api?.getWorkflow) return
    const wf = await api.getWorkflow(workflowId)
    if (wf?.steps) {
      // 预加载相机和产品信息
      const [camList, prodList] = await Promise.all([
        api.getCameras ? api.getCameras() : Promise.resolve([]),
        api.getProducts ? api.getProducts() : Promise.resolve([])
      ])
      activeWorkflowSteps.value = wf.steps.map((s: any) => ({
        ...s,
        camera: camList.find((c: any) => c.id === s.cameraId) || null,
        product: prodList.find((p: any) => p.id === s.productId) || null
      }))
    }
  } catch (err) {
    console.error('加载工作流步骤失败:', err)
  }
}

// 工作流推理入口
async function startWorkflowInference() {
  // 从 localStorage 读取启用的工作流
  const enabledWorkflowId = localStorage.getItem('activeWorkflowId')
  if (!enabledWorkflowId) {
    showToast('没有启用的工作流，请先到工作流配置页面启用工作流', 'error')
    return
  }

  // 加载工作流列表
  await loadWorkflowList()

  // 检查启用的工作流是否仍然存在
  const enabledWorkflow = workflowList.value.find(wf => wf.id === enabledWorkflowId)
  if (!enabledWorkflow) {
    showToast('启用的工作流已不存在，请重新配置', 'error')
    localStorage.removeItem('activeWorkflowId')
    return
  }

  // 选择启用的工作流并执行
  await selectWorkflow(enabledWorkflowId)
  // 启动工作流执行
  await startWorkflowExecution()
}

// 选择工作流
async function selectWorkflow(id: string | null) {
  activeWorkflowId.value = id
  if (id) {
    await loadWorkflowSteps(id)
    localStorage.setItem('activeWorkflowId', id)
  } else {
    activeWorkflowSteps.value = []
    localStorage.removeItem('activeWorkflowId')
  }
}

onMounted(async () => {
  if (window.electronAPI) {
    await loadCameraServiceUrl()
    await loadImageSettings()
    await fetchInitialData()
    await fetchInferenceServices()

    const savedProductId = localStorage.getItem('selectedProductId')
    if (savedProductId) {
      const id = savedProductId
      const productExists = products.value.find(p => p.id === id)
      if (productExists) {
        await handleSelectProduct(id)
      } else if (products.value.length > 0) {
        await handleSelectProduct(products.value[0].id)
      }
    } else if (products.value.length > 0 && !selectedProductId.value) {
      await handleSelectProduct(products.value[0].id)
    }

    restoreSelectedCamera()
    restoreSidebarWidth()
    restoreSectionHeights()
    await fetchModbusStatus()
    await loadModbusConfig()

    // 加载工作流列表（用于 externalCapture）
    await loadWorkflowList()
    // 如果 localStorage 中有启用的工作流，则加载它（用于 externalCapture）
    const enabledWorkflowId = localStorage.getItem('activeWorkflowId')
    if (enabledWorkflowId) {
      const enabledWorkflow = workflowList.value.find(wf => wf.id === enabledWorkflowId)
      if (enabledWorkflow) {
        await selectWorkflow(enabledWorkflowId)
      } else {
        localStorage.removeItem('activeWorkflowId')
      }
    }
  }
  window.__externalCapture = externalCapture
  document.addEventListener('fullscreenchange', syncFullscreenState)
})

onActivated(async () => {
  // 页面重新激活时，重新加载后端URL，然后获取推理服务和标注数据
  await loadCameraServiceUrl()
  await fetchInitialData()
  await fetchInferenceServices()
  await fetchProductAnnotations()
  restoreSelectedCamera()
  await fetchModbusStatus()
})

const openProductModal = () => {
  newProductName.value = ''
  newProductModel.value = ''
  newProductCameraId.value = selectedCameraId.value
  showProductModal.value = true
}

const confirmAddProduct = async () => {
  const name = newProductName.value.trim()
  if (!name) return

  const cameraId = newProductCameraId.value && newProductCameraId.value !== '__none__' ? newProductCameraId.value : undefined
  const newProduct: any = {
    name,
    model: newProductModel.value.trim() || `M-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    cameraId: cameraId || null
  }

  try {
    if (window.electronAPI?.addProduct) {
      const created = await window.electronAPI.addProduct(newProduct)
      await fetchInitialData()
      if (created?.id) {
        handleSelectProduct(created.id)
      }
    } else {
      const maxId = products.value.reduce((acc, p) => Math.max(acc, Number(p?.id) || 0), 0)
      const id = maxId + 1
      products.value = [{ id, ...newProduct }, ...products.value]
      handleSelectProduct(id)
    }
    showProductModal.value = false
  } catch (err) {
    console.error('Failed to add product:', err)
    const maxId = products.value.reduce((acc, p) => Math.max(acc, Number(p?.id) || 0), 0)
    const id = maxId + 1
    products.value = [{ id, ...newProduct }, ...products.value]
    handleSelectProduct(id)
    showProductModal.value = false
  }
}

const showDeleteModal = ref(false)
const productToDelete = ref<any>(null)

const openDeleteModal = (product: any) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const confirmDeleteProductAction = async () => {
  if (!productToDelete.value) return
  
  const id = productToDelete.value.id
  if (window.electronAPI) {
    try {
      // 先获取该产品关联的所有推理服务并删除
      const servicesRes = await fetch(getBackendUrl(`/deploy/http/services?project_id=${id}`))
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        const services = servicesData.services || []
        for (const service of services) {
          try {
            await fetch(getBackendUrl(`/deploy/http/service/${service.service_id}`), {
              method: 'DELETE'
            })
          } catch (serviceErr) {
            console.error(`Failed to delete service ${service.service_id}:`, serviceErr)
          }
        }
      }
      
      await window.electronAPI.deleteProduct(id)
      await fetchInitialData()
      
      // If the deleted product was selected, clear the selection and view
      if (selectedProductId.value === id) {
        selectedProductId.value = null
        mainViewUrl.value = ''
        mainViewState.value = 'empty'
        viewerImageNatural.value = null
        resetViewer()
      }
      
      // 刷新推理服务列表
      await fetchInferenceServices()
      
      showToast('产品已删除', 'info')
    } catch (err) {
      console.error('Failed to delete product:', err)
      showToast('删除失败', 'error')
    }
  }
  showDeleteModal.value = false
  productToDelete.value = null
}

const removeProduct = async (id: string) => {
  // Legacy method kept for compatibility if needed, but we prefer openDeleteModal
  if (window.electronAPI) {
    await window.electronAPI.deleteProduct(id)
    await fetchInitialData()
  }
}

// Camera Actions
const systemCameras = ref<Array<{ id: string; name: string; deviceId: string; isSystemCamera: boolean }>>([])
const showCameraTypeModal = ref(false)
const showCameraModal = ref(false)
const selectedSystemCamera = ref<string>('')
const cameraIpInput = ref('')
const isLoadingSystemCameras = ref(false)

// 相机操作下拉菜单状态
const openCameraMenuId = ref<string | number | null>(null)
const toggleCameraMenu = (camId: string | number) => { openCameraMenuId.value = openCameraMenuId.value === camId ? null : camId }
const closeCameraMenu = () => { openCameraMenuId.value = null }

// 侧边栏宽度拖拽调整
const sidebarWidth = ref(380)
const isResizing = ref(false)

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  e.preventDefault()
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const w = window.innerWidth - e.clientX
  sidebarWidth.value = Math.max(260, Math.min(560, w))
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  localStorage.setItem('sidebarWidth', String(sidebarWidth.value))
}

// 恢复保存的侧边栏宽度
const restoreSidebarWidth = () => {
  const saved = localStorage.getItem('sidebarWidth')
  if (saved) {
    const w = Number(saved)
    if (Number.isFinite(w) && w >= 260 && w <= 560) sidebarWidth.value = w
  }
}

// 各区域高度拖拽调整 (camera/image/product/prediction)
const sectionHeights = ref({
  camera: 160,
  image: 280,
  products: 200,
  predictions: 260,
})
const isResizingSection = ref<string | null>(null)
let _resizeStartY = 0
let _resizeStartHeight = 0

const startSectionResize = (section: string, e: MouseEvent) => {
  isResizingSection.value = section
  _resizeStartY = e.clientY
  _resizeStartHeight = (sectionHeights.value as any)[section] || 200
  document.addEventListener('mousemove', onSectionResize)
  document.addEventListener('mouseup', stopSectionResize)
  e.preventDefault()
}

const onSectionResize = (e: MouseEvent) => {
  if (!isResizingSection.value) return
  const delta = e.clientY - _resizeStartY
  const newH = Math.max(80, Math.min(600, _resizeStartHeight + delta));
  (sectionHeights.value as any)[isResizingSection.value] = Math.round(newH)
}

const stopSectionResize = () => {
  if (isResizingSection.value) {
    localStorage.setItem('sectionHeights', JSON.stringify(sectionHeights.value))
  }
  isResizingSection.value = null
  document.removeEventListener('mousemove', onSectionResize)
  document.removeEventListener('mouseup', stopSectionResize)
}

const restoreSectionHeights = () => {
  try {
    const saved = localStorage.getItem('sectionHeights')
    if (saved) {
      const h = JSON.parse(saved)
      if (h && typeof h === 'object') {
        for (const key of ['camera', 'image', 'products', 'predictions']) {
          if (key in h && Number.isFinite(h[key]) && h[key] >= 80) {
            (sectionHeights.value as any)[key] = h[key]
          }
        }
      }
    }
  } catch {}
}

// Network Camera
const showNetworkCameraModal = ref(false)
const networkCameraId = ref('')
const networkCameraIp = ref('192.168.110.10')
const networkCameraVendor = ref<'Basler' | 'Hikrobot'>('Basler')
const networkCameraWidth = ref<number | null>(null)
const networkCameraHeight = ref<number | null>(null)
const networkCameraExposure = ref<number | null>(null)
const networkCameraGain = ref<number | null>(null)
const networkCameraOffsetX = ref<number | null>(null)
const networkCameraOffsetY = ref<number | null>(null)
const isConnectingCamera = ref(false)
const cameraPreviewUrl = ref('')

// Camera Config Edit
const showCameraConfigModal = ref(false)
const showCameraManagerDialog = ref(false)
const dialogTab = ref<'camera' | 'modbus'>('camera')
const showModbusDetail = ref(false)
const editingCamera = ref<any>(null)
const editingCameraConfig = ref({
  ip: '',
  vendor: 'Basler' as 'Basler' | 'Hikrobot',
  width: null as number | null,
  height: null as number | null,
  exposureTime: null as number | null,
  gain: null as number | null,
  offsetX: null as number | null,
  offsetY: null as number | null
})

const fetchSystemCameras = async () => {
  if (!window.electronAPI?.getSystemCameras) return
  isLoadingSystemCameras.value = true
  try {
    systemCameras.value = await window.electronAPI.getSystemCameras()
  } catch (err) {
    console.error('Failed to fetch system cameras:', err)
    showToast('获取系统相机列表失败', 'error')
  } finally {
    isLoadingSystemCameras.value = false
  }
}

const openCameraTypeModal = () => {
  showCameraTypeModal.value = true
}

const openCameraModal = async () => {
  showCameraTypeModal.value = false
  await fetchSystemCameras()
  selectedSystemCamera.value = ''
  cameraIpInput.value = ''
  showCameraModal.value = true
}

const openNetworkCameraModal = () => {
  showCameraTypeModal.value = false
  networkCameraId.value = ''
  networkCameraIp.value = '192.168.110.10'
  networkCameraVendor.value = 'Basler'
  networkCameraWidth.value = null
  networkCameraHeight.value = null
  showNetworkCameraModal.value = true
}

const handleAddCamera = async () => {
  if (!window.electronAPI) return
  if (!selectedSystemCamera.value) {
    showToast('请选择相机', 'error')
    return
  }

  const selectedCam = systemCameras.value.find(c => c.id === selectedSystemCamera.value)
  if (!selectedCam) {
    showToast('选择的相机无效', 'error')
    return
  }

  const newCam = {
    name: selectedCam.name,
    ip: cameraIpInput.value.trim() || '127.0.0.1',
    status: 'offline',
    config: JSON.stringify({
      deviceId: selectedCam.deviceId,
      isSystemCamera: true
    })
  }

  try {
    await window.electronAPI.addCamera(newCam)
    await fetchInitialData()
    showCameraModal.value = false
    showToast('相机添加成功', 'info')
  } catch (err) {
    console.error('Failed to add camera:', err)
    showToast('添加相机失败', 'error')
  }
}

const handleAddNetworkCamera = async () => {
  if (!window.electronAPI) return
  if (!networkCameraId.value.trim()) {
    showToast('请输入相机ID', 'error')
    return
  }

  const newCam = {
    cameraId: networkCameraId.value.trim(),
    name: networkCameraId.value.trim(),
    ip: networkCameraIp.value.trim(),
    vendor: networkCameraVendor.value,
    status: 'offline',
    width: networkCameraWidth.value,
    height: networkCameraHeight.value,
    exposureTime: networkCameraExposure.value,
    gain: networkCameraGain.value,
    offsetX: networkCameraOffsetX.value,
    offsetY: networkCameraOffsetY.value,
    isNetworkCamera: true,
    config: JSON.stringify({
      ipAddress: networkCameraIp.value.trim(),
      vendor: networkCameraVendor.value,
      width: networkCameraWidth.value,
      height: networkCameraHeight.value,
      exposureTime: networkCameraExposure.value,
      gain: networkCameraGain.value,
      offsetX: networkCameraOffsetX.value,
      offsetY: networkCameraOffsetY.value,
      isNetworkCamera: true
    })
  }

  try {
    await window.electronAPI.addCamera(newCam)
    await fetchInitialData()
    showNetworkCameraModal.value = false
    showToast('网络相机添加成功', 'info')
  } catch (err) {
    console.error('Failed to add network camera:', err)
    showToast('添加网络相机失败', 'error')
  }
}

const handleConnectCamera = async (camera: any) => {
  if (!camera.isNetworkCamera) {
    showToast('USB相机无需连接操作', 'info')
    return
  }
  if (!window.electronAPI?.connectCamera) return
  isConnectingCamera.value = true
  try {
    const cameraId = camera.name
    const config = camera.config ? JSON.parse(camera.config) : {}
    const result = await window.electronAPI.connectCamera(cameraId, {
      ipAddress: camera.ip,
      vendor: config.vendor || 'Basler',
      exposureTime: exposureValue.value * 52,
      gain: gainValue.value,
      offsetX: offsetXValue.value,
      offsetY: offsetYValue.value,
      width: widthValue.value || config.width,
      height: heightValue.value || config.height,
    })

    if (result.success) {
      showToast('相机连接成功', 'info')
      await fetchInitialData()
      selectedCameraId.value = camera.id
      saveSelectedCamera()
      loadCameraSettingsToForm(camera)
    } else {
      showToast(result.error || '连接失败', 'error')
    }
  } catch (err) {
    console.error('Failed to connect camera:', err)
    showToast('连接相机失败', 'error')
  } finally {
    isConnectingCamera.value = false
  }
}

const handleDisconnectCamera = async (camera: any) => {
  if (!camera.isNetworkCamera) {
    showToast('USB相机无需断开操作', 'info')
    return
  }
  if (!window.electronAPI?.disconnectCamera) return

  const cameraId = camera.name
  const maxRetries = 3
  let lastError = ''

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await window.electronAPI.disconnectCamera(cameraId)
      if (result.success) {
        showToast('相机已断开', 'info')
        await fetchInitialData()
        return
      } else {
        lastError = result.error || '断开失败'
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    } catch (err: any) {
      lastError = err.message || '断开相机失败'
      console.error(`Failed to disconnect camera (attempt ${attempt}/${maxRetries}):`, err)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  showToast(`${lastError}，已重试${maxRetries}次`, 'error')
  await fetchInitialData()
}

const handleCaptureFromCamera = async (camera: any): Promise<boolean> => {
  if (!camera.isNetworkCamera) {
    showToast('请使用主界面的拍照功能拍摄USB相机', 'info')
    return false
  }
  if (!window.electronAPI?.captureFromCamera) return false
  if (!selectedProductId.value) {
    showToast('请先选择一个产品', 'error')
    return false
  }

  const timestamp = new Date().getTime()
  const cameraId = camera.name
  const fileName = `capture_${cameraId}_${timestamp}.jpg`
  const maxRetries = 3
  let lastError = ''
  let needReconnect = false

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (needReconnect && window.electronAPI?.connectCamera) {
        showToast('相机正在重新连接...', 'info')
        const config = camera.config ? JSON.parse(camera.config) : {}
        const connectResult = await window.electronAPI.connectCamera(cameraId, {
          ipAddress: camera.ip || config.ipAddress,
          vendor: config.vendor || 'Basler',
          exposureTime: exposureValue.value * 52,
          gain: gainValue.value,
          offsetX: offsetXValue.value,
          offsetY: offsetYValue.value,
          width: widthValue.value || config.width,
          height: heightValue.value || config.height,
        })
        if (!connectResult.success) {
          lastError = connectResult.error || '重新连接相机失败'
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }
          break
        }
        needReconnect = false
        await fetchInitialData()
      }

      if (window.electronAPI?.updateCameraParameters) {
        const actualExposure = exposureValue.value * 52
        const config = camera.config ? JSON.parse(camera.config) : {}
        console.log(`[capture] 设置相机参数: exposureTime=${Math.round(actualExposure)}, gain=${Math.round(gainValue.value)}, offsetX=${Math.round(offsetXValue.value)}, offsetY=${Math.round(offsetYValue.value)}`)
        const paramResult = await window.electronAPI.updateCameraParameters(cameraId, {
          exposureTime: Math.round(actualExposure),
          gain: Math.round(gainValue.value),
          offsetX: Math.round(offsetXValue.value),
          offsetY: Math.round(offsetYValue.value)
        })
        console.log(`[capture] 参数设置结果:`, paramResult)
        if (!paramResult?.success && !isReconnectableError(paramResult)) {
          console.warn(`[capture] 相机参数设置可能失败: ${paramResult?.error || '未知错误'}`)
        }
        if (isReconnectableError(paramResult)) {
          needReconnect = true
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }
        }
      }

      const result = await window.electronAPI.captureFromCamera(cameraId)

      if (isReconnectableError(result)) {
        needReconnect = true
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
      }

      if (result.success && result.data) {
        const base64Data = result.data.image_base64 || result.data.base64 || result.data.image || result.data
        if (base64Data) {
          const dataUrl = typeof base64Data === 'string'
            ? `data:image/jpeg;base64,${base64Data}`
            : `data:image/jpeg;base64,${base64Data}`

          if (selectedProductHasImage.value && selectedProductHasAnnotation.value) {
            await runCaptureInference(dataUrl)
          } else {
            clearResults()  // 非推理拍照也清除旧检测结果

            const savedPath = await window.electronAPI.saveImage({
              productId: selectedProductId.value,
              fileName,
              dataUrl
            })

            mainViewUrl.value = dataUrl
            mainViewState.value = 'image'

            const pid = selectedProductId.value
            await fetchInitialData()
            if (pid) {
              selectedProductAnnotations.value = { placeholder: true }
              await nextTick()
              const updatedProduct = products.value.find(p => p.id === pid)
              if (updatedProduct?.lastImagePath) {
                try {
                  const annotations = await window.electronAPI.getAnnotations(pid, updatedProduct.lastImagePath)
                  selectedProductAnnotations.value = annotations
                } catch {
                  selectedProductAnnotations.value = { placeholder: true }
                }
              }
            }
            showToast('拍照成功', 'info')
          }
          return true
        }
      }

      lastError = result.error || result.message || '拍照失败'
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (err: any) {
      lastError = err.message || '拍照失败'
      console.error(`Failed to capture from camera (attempt ${attempt}/${maxRetries}):`, err)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  showToast(`${lastError}，已重试${maxRetries}次`, 'error')
  return false
}

const cameraServiceUrl = ref('')

const loadCameraServiceUrl = async () => {
  if (window.electronAPI?.getSettings) {
    try {
      const settings = await window.electronAPI.getSettings()
      if (settings?.backendUrl) {
        cameraServiceUrl.value = settings.backendUrl
      }
    } catch (err) {
      console.error('Failed to load camera service URL:', err)
    }
  }
}

const startCameraPreview = async (camera: any) => {
  if (!camera.isNetworkCamera) {
    showToast('USB相机预览请在主界面使用实况功能', 'info')
    return
  }
  if (!cameraServiceUrl.value) {
    await loadCameraServiceUrl()
  }
  if (cameraServiceUrl.value) {
    const cameraId = camera.name
    cameraPreviewUrl.value = `${cameraServiceUrl.value}/camera/${cameraId}/preview`
  }
}

const stopCameraPreview = () => {
  cameraPreviewUrl.value = ''
}

const backendPort = '8000'
const getBackendUrl = (path: string) => {
  const base = cameraServiceUrl.value.endsWith('/') ? cameraServiceUrl.value.slice(0, -1) : cameraServiceUrl.value
  return `${base}${path}`
}

const getInferenceUrl = async (inferenceUrl?: string) => {
  if (!inferenceUrl) return ''
  if (!cameraServiceUrl.value) {
    await loadCameraServiceUrl()
  }
  let url = inferenceUrl.replace('0.0.0.0', 'localhost')
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const base = cameraServiceUrl.value.endsWith('/') ? cameraServiceUrl.value.slice(0, -1) : cameraServiceUrl.value
    if (base) {
      try {
        const urlObj = new URL(base)
        url = url.replace('localhost', urlObj.hostname).replace('127.0.0.1', urlObj.hostname)
      } catch {}
    }
  }
  return url
}

const handleRemoveCamera = async (camera: any) => {
  if (window.electronAPI) {
    const cameraId = camera.isNetworkCamera ? camera.name : camera.id
    await window.electronAPI.deleteCamera(cameraId, camera.isNetworkCamera, camera.id)
    await fetchInitialData()
  }
}

const toggleCameraEnabled = async (cam: any) => {
  if (window.electronAPI) {
    await window.electronAPI.updateCamera(cam.id, { isEnabled: !cam.isEnabled })
    await fetchInitialData()
  }
}

const openCameraConfig = (cam: any) => {
  editingCamera.value = cam
  const config = cam.config ? JSON.parse(cam.config) : {}
  editingCameraConfig.value = {
    ip: cam.ip || '',
    vendor: config.vendor || 'Basler',
    width: config.width || null,
    height: config.height || null,
    exposureTime: config.exposureTime ? Math.round(config.exposureTime / 52) : null,
    gain: config.gain || null,
    offsetX: config.offsetX !== undefined ? config.offsetX : null,
    offsetY: config.offsetY !== undefined ? config.offsetY : null
  }
  showCameraConfigModal.value = true
}

const saveCameraConfig = async () => {
  if (!editingCamera.value || !window.electronAPI) return

  try {
    const editingCameraId = editingCamera.value.id
    const wasOnline = editingCamera.value.isNetworkCamera && editingCamera.value.status === 'online'
    const isSelectedCamera = editingCameraId === selectedCameraId.value

    const config = {
      ...JSON.parse(editingCamera.value.config || '{}'),
      ipAddress: editingCameraConfig.value.ip,
      vendor: editingCameraConfig.value.vendor,
      width: editingCameraConfig.value.width,
      height: editingCameraConfig.value.height,
      exposureTime: editingCameraConfig.value.exposureTime ? editingCameraConfig.value.exposureTime * 52 : null,
      gain: editingCameraConfig.value.gain,
      offsetX: editingCameraConfig.value.offsetX,
      offsetY: editingCameraConfig.value.offsetY
    }

    await window.electronAPI.updateCamera(editingCamera.value.id, {
      ip: editingCameraConfig.value.ip,
      config: JSON.stringify(config)
    })

    showCameraConfigModal.value = false
    await fetchInitialData()

    // 修复1：把最新相机数据同步回表单，解决 UI 不刷新问题
    const updatedCamera = cameras.value.find(c => c.id === editingCameraId)
    if (updatedCamera && isSelectedCamera) {
      loadCameraSettingsToForm(updatedCamera)
    }

    // 修复2：只要相机之前在线就重连，不再依赖 isLiveStreaming
    if (wasOnline && updatedCamera) {
      showToast('相机配置已保存，正在重新连接...', 'info')
      await handleDisconnectCamera(updatedCamera)
      await handleConnectCamera(updatedCamera)
    } else {
      showToast('相机配置已保存', 'info')
    }
  } catch (err) {
    console.error('Failed to save camera config:', err)
    showToast('保存相机配置失败', 'error')
  }
}

const selectedProductId = ref<string | null>(null)

const handleSelectProduct = async (id: string) => {
  selectedProductId.value = id
  localStorage.setItem('selectedProductId', String(id))
  clearResults()
  // 切换产品时清除工作流上次执行的图片和步骤状态
  workflowStepImages.value = {}
  viewingStepIndex.value = -1
  showWorkflowGrid.value = true
  const product = products.value.find(p => p.id === id)

  if (product?.lastImagePath && window.electronAPI?.loadImage) {
    try {
      const dataUrl = await window.electronAPI.loadImage(product.lastImagePath)
      if (dataUrl) {
        mainViewUrl.value = dataUrl
        mainViewState.value = 'image'
      } else {
        mainViewUrl.value = ''
        mainViewState.value = 'empty'
      }
    } catch (err) {
      console.error('Failed to load image from path:', err)
      mainViewUrl.value = ''
      mainViewState.value = 'empty'
    }
  } else {
    mainViewUrl.value = ''
    mainViewState.value = 'empty'
  }

  await fetchProductAnnotations()

  // 优先使用产品绑定的相机，其次恢复上次选择的相机
  if (product?.cameraId && cameras.value.find(c => c.id === product.cameraId)) {
    selectedCameraId.value = product.cameraId
    saveSelectedCamera()
    loadCameraSettingsToForm(cameras.value.find(c => c.id === product.cameraId)!)
  } else {
    restoreSelectedCamera()
  }
}

const handleEditProduct = (product: any) => {
  if (!product.lastImagePath) {
    showToast('该项目尚未绑定图片，请先拍摄或导入图片', 'error')
    return
  }
  router.push({
    path: '/annotation',
    query: {
      productId: product.id,
      imagePath: product.lastImagePath,
      productName: product.name
    }
  })
}

const viewProductImage = async (product: any) => {
  if (!product.lastImagePath) {
    showToast('该项目尚未绑定图片', 'error')
    return
  }
  
  if (window.electronAPI?.loadImage) {
    try {
      const dataUrl = await window.electronAPI.loadImage(product.lastImagePath)
      if (dataUrl) {
        mainViewUrl.value = dataUrl
        mainViewState.value = 'image'
        clearResults()
      } else {
        showToast('无法加载图片', 'error')
      }
    } catch (err) {
      console.error('Failed to load image:', err)
      showToast('加载图片失败', 'error')
    }
  }
}

const handleProductDoubleClick = (product: any) => {
  if (!product.lastImagePath) {
    showToast('该项目尚未绑定图片，请先拍摄或导入图片', 'error')
    return
  }
  router.push({
    path: '/annotation',
    query: {
      productId: product.id,
      imagePath: product.lastImagePath,
      productName: product.name
    }
  })
}

// Main View Actions
const liveVideoRef = ref<HTMLVideoElement | null>(null)
const liveStream = ref<MediaStream | null>(null)
const isLiveStreaming = ref(false)
const isLiveInferring = ref(false)
const liveNetworkCamera = ref<any>(null)
let updateCameraDebounceTimer: ReturnType<typeof setTimeout> | null = null
const isLiveInferenceProcessing = ref(false)
const liveInferenceInterval = ref<number | null>(null)
const liveInferenceIntervalMs = ref(1000)
const liveDetectionCanvasRef = ref<HTMLCanvasElement | null>(null)

// 流式识别专用状态
const liveDetectionResults = ref<Array<{
  label: string
  score: number
  bbox: [number, number, number, number]
  segmentation?: number[]
  isAnomaly?: boolean
  visible: boolean
}>>([])
const livePredictionConfidence = ref(0)

const stopLiveInference = () => {
  if (liveInferenceInterval.value) {
    clearInterval(liveInferenceInterval.value)
    liveInferenceInterval.value = null
  }
  isLiveInferring.value = false
  liveDetectionResults.value = []
  livePredictionConfidence.value = 0
  if (liveDetectionCanvasRef.value) {
    const ctx = liveDetectionCanvasRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, liveDetectionCanvasRef.value.width, liveDetectionCanvasRef.value.height)
    }
  }
}

const stopLive = async () => {
  stopLiveInference()
  if (cameraPreviewUrl.value) {
    stopCameraPreview()
  }
  if (liveStream.value) {
    liveStream.value.getTracks().forEach(track => track.stop())
    liveStream.value = null
  }
  if (liveVideoRef.value) {
    liveVideoRef.value.srcObject = null
  }
  liveNetworkCamera.value = null
  isLiveStreaming.value = false
  clearResults()

  const product = products.value.find(p => p.id === selectedProductId.value)
  if (product?.lastImagePath && window.electronAPI?.loadImage) {
    try {
      const dataUrl = await window.electronAPI.loadImage(product.lastImagePath)
      if (dataUrl) {
        mainViewUrl.value = dataUrl
        mainViewState.value = 'image'
      } else {
        mainViewState.value = 'empty'
        mainViewUrl.value = ''
      }
    } catch (err) {
      console.error('Failed to load image from path:', err)
      mainViewState.value = 'empty'
      mainViewUrl.value = ''
    }
  } else {
    mainViewState.value = 'empty'
    mainViewUrl.value = ''
  }
}

const startLive = async () => {
  if (!selectedProductId.value) {
    alert('请先选择一个产品')
    return
  }

  if (mainViewState.value === 'live') {
    stopLive()
    return
  }

  const targetCamera = getEffectiveCamera()
  if (!targetCamera) {
    showToast('请先在产品设置中绑定相机', 'error')
    return
  }

  if (targetCamera.isEnabled === false) {
    showToast('当前相机已禁用，请先启用相机', 'error')
    return
  }

  if (targetCamera.isNetworkCamera) {
    const connected = await ensureCameraConnected(targetCamera)
    if (!connected) return
    startCameraPreview(targetCamera)
    liveNetworkCamera.value = targetCamera
    mainViewState.value = 'live'
    isLiveStreaming.value = true
    updateCameraSettings()
    return
  }

  try {
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: targetCamera.config ? JSON.parse(targetCamera.config).deviceId : undefined,
        exposureMode: 'manual'
      } as MediaTrackConstraints
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    liveStream.value = stream
    mainViewState.value = 'live'
    isLiveStreaming.value = true

    await nextTick()
    if (liveVideoRef.value) {
      liveVideoRef.value.srcObject = stream
    }

    await updateCameraSettings()
  } catch (err) {
    console.error('Failed to start live stream:', err)
    showToast('启动实况失败：无法访问相机', 'error')
  }
}

/**
 * 判断相机 API 响应是否表明连接已断开需要重连
 */
function isReconnectableError(response: any): boolean {
  if (!response) return false
  // 404 状态码
  if (response.statusCode === 404) return true
  // success: false 且错误信息提示相机不可达
  if (response.success === false) {
    const msg = (response.error || response.message || '').toLowerCase()
    if (msg.includes('not found') || msg.includes('disconnected') || msg.includes('no camera')) return true
  }
  return false
}

const updateCameraSettings = async () => {
  const targetCamera = liveNetworkCamera.value || cameras.value.find(c => c.id === selectedCameraId.value)
  if (targetCamera && targetCamera.isNetworkCamera) {
    if (window.electronAPI?.updateCameraParameters) {
      // 防抖: 避免滑块快速拖动时产生并发请求
      if (updateCameraDebounceTimer) clearTimeout(updateCameraDebounceTimer)
      updateCameraDebounceTimer = setTimeout(async () => {
        const cameraId = targetCamera.name
        const actualExposure = exposureValue.value * 52
        const maxRetries = 3
        let needReconnect = false

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            if (needReconnect && window.electronAPI?.connectCamera) {
              const config = targetCamera.config ? JSON.parse(targetCamera.config) : {}
              const connectResult = await window.electronAPI.connectCamera(cameraId, {
                ipAddress: targetCamera.ip || config.ipAddress,
                vendor: config.vendor || 'Basler',
                exposureTime: actualExposure,
                gain: gainValue.value,
                offsetX: offsetXValue.value,
                offsetY: offsetYValue.value,
                width: widthValue.value || config.width,
                height: heightValue.value || config.height,
              })
              if (!connectResult.success) {
                console.error('重新连接相机失败:', connectResult.error)
                if (attempt < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000))
                  continue
                }
                break
              }
              needReconnect = false
              await fetchInitialData()
            }

            const response = await window.electronAPI.updateCameraParameters(cameraId, {
              exposureTime: Math.round(actualExposure),
              gain: Math.round(gainValue.value),
              offsetX: Math.round(offsetXValue.value),
              offsetY: Math.round(offsetYValue.value)
            })

            // 增强 404/断连检测: 同时检查 statusCode 和 success 字段
            if (response.statusCode === 404 || (response.success === false && isReconnectableError(response))) {
              needReconnect = true
              if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                continue
              }
            }

            if (isLiveStreaming.value && cameraPreviewUrl.value) {
              cameraPreviewUrl.value = `${cameraServiceUrl.value}/camera/${cameraId}/preview?t=${Date.now()}`
            }
            return
          } catch (err) {
            console.error(`Failed to update network camera parameters (attempt ${attempt}/${maxRetries}):`, err)
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
      }, 150)
    }
    return
  }

  if (!liveStream.value) return

  const videoTrack = liveStream.value.getVideoTracks()[0]
  if (!videoTrack) return

  try {
    const capabilities = videoTrack.getCapabilities()
    const settings: any = {}

    if (capabilities.exposureTime) {
      const min = capabilities.exposureTime.min || 100
      const max = capabilities.exposureTime.max || 10000
      const normalizedValue = exposureValue.value / 200
      settings.exposureTime = min + normalizedValue * (max - min)
    } else if (capabilities.exposureCompensation) {
      const min = capabilities.exposureCompensation.min || -2
      const max = capabilities.exposureCompensation.max || 2
      settings.exposureCompensation = min + (exposureValue.value / 200) * (max - min)
    }

    if (capabilities.iso) {
      const min = capabilities.iso.min || 100
      const max = capabilities.iso.max || 6400
      const normalizedValue = gainValue.value / 1957
      settings.iso = Math.round(min + normalizedValue * (max - min))
    } else if (capabilities.brightness) {
      const min = capabilities.brightness.min || 0
      const max = capabilities.brightness.max || 255
      settings.brightness = min + (gainValue.value / 1957) * (max - min)
    }

    if (Object.keys(settings).length > 0) {
      await videoTrack.applyConstraints({ advanced: [settings] })
    }
  } catch (err) {
    console.error('Failed to update camera settings:', err)
  }
}

const runLiveInference = async () => {
  if (!liveVideoRef.value || !isLiveStreaming.value || isLiveInferenceProcessing.value) return

  try {
    const video = liveVideoRef.value
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
    })

    if (!selectedInferenceService.value) return

    isLiveInferenceProcessing.value = true

    const formData = new FormData()
    formData.append('service_id', selectedInferenceService.value)
    formData.append('file', blob, 'live.jpg')

    const selectedService = inferenceServices.value.find(s => s.service_id === selectedInferenceService.value)
    const inferenceUrl = await getInferenceUrl(selectedService?.inference_url)
    const res = await fetch(`${inferenceUrl}/predict`, {
      method: 'POST',
      body: formData
    })

    const data = await res.json()
    const result = data.status === 'success' && data.result ? data.result : data

    if (result.workpiece_results && Array.isArray(result.workpiece_results)) {
      const allResults = result.workpiece_results.flatMap((wp: any) => wp.results || [])
      liveDetectionResults.value = allResults.map((r: any) => ({
        label: r.category || r.label || '未知',
        score: (r.anomaly_score || r.score || 0) * 100,
        bbox: r.bbox_clipped || r.bbox_in_pred || r.bbox || r.box || [0, 0, 0, 0],
        segmentation: r.segmentation_in_pred || r.segmentation || [],
        isAnomaly: r.is_anomaly || r.anomaly === true || false,
        visible: true
      }))
      if (liveDetectionResults.value.length > 0) {
        livePredictionConfidence.value = Math.max(...liveDetectionResults.value.map(r => r.score))
      }
    } else if (result.workpieces && Array.isArray(result.workpieces)) {
      const allResults = result.workpieces.flatMap((wp: any) => wp.results || [])
      liveDetectionResults.value = allResults.map((r: any) => ({
        label: r.category || r.label || '未知',
        score: (r.anomaly_score || r.score || 0) * 100,
        bbox: r.bbox_clipped || r.bbox_in_pred || r.bbox || r.box || [0, 0, 0, 0],
        segmentation: r.segmentation_in_pred || r.segmentation || [],
        isAnomaly: r.is_anomaly || r.anomaly === true || false,
        visible: true
      }))
      if (liveDetectionResults.value.length > 0) {
        livePredictionConfidence.value = Math.max(...liveDetectionResults.value.map(r => r.score))
      }
    } else if (result.results && Array.isArray(result.results)) {
      liveDetectionResults.value = result.results.map((r: any) => ({
        label: r.category || '未知',
        score: (r.anomaly_score || 0) * 100,
        bbox: r.bbox_clipped || r.bbox || [0, 0, 0, 0],
        segmentation: r.segmentation_in_pred || r.segmentation || [],
        isAnomaly: r.is_anomaly || false,
        visible: true
      }))
      if (liveDetectionResults.value.length > 0) {
        livePredictionConfidence.value = Math.max(...liveDetectionResults.value.map(r => r.score))
      }
    } else if (result.detections && Array.isArray(result.detections)) {
      liveDetectionResults.value = result.detections.map((d: any) => ({
        label: d.label || d.class || '未知',
        score: (d.score || d.confidence || d.probability || 0) * 100,
        bbox: d.bbox || d.box || [0, 0, 0, 0],
        segmentation: d.segmentation || [],
        isAnomaly: d.is_anomaly || false,
        visible: true
      }))
      if (liveDetectionResults.value.length > 0) {
        livePredictionConfidence.value = Math.max(...liveDetectionResults.value.map(r => r.score))
      }
    }

    await nextTick()
    drawLiveDetectionBoxes()
  } catch (err) {
    console.error('Live inference error:', err)
  } finally {
    isLiveInferenceProcessing.value = false
  }
}

const toggleLiveInference = async () => {
  if (isLiveInferring.value) {
    stopLiveInference()
    return
  }

  if (!isLiveStreaming.value) {
    showToast('请先启动实况', 'error')
    return
  }

  await fetchInferenceServices()

  if (inferenceServices.value.length === 0) {
    showToast('当前没有可用的推理服务', 'error')
    return
  }

  selectedInferenceService.value = inferenceServices.value[0]?.service_id || ''
  isLiveInferring.value = true

  await runLiveInference()

  liveInferenceInterval.value = window.setInterval(() => {
    runLiveInference()
  }, liveInferenceIntervalMs.value)
}

const selectedCameraId = ref<string | null>(null)
const selectedCamera = computed(() => cameras.value.find(c => c.id === selectedCameraId.value) || null)

// Modbus 状态
const modbusStatus = ref<{ enabled: boolean; ip: string; port: number; connected: boolean } | null>(null)
const fetchModbusStatus = async () => {
  if (window.electronAPI?.getModbusStatus) {
    modbusStatus.value = await window.electronAPI.getModbusStatus()
  }
}

// Modbus 配置（在对话框内直接编辑）
const modbusConfigForm = ref({
  enabled: true,
  ip: '192.168.1.12',
  port: 502,
  unitId: 1,
  buttonChannel: 1,
  resetChannel: 2,
  lightGreen: 0,
  lightYellow: 1,
  lightRed: 2,
  buzzer: 3,
})
const isSavingModbus = ref(false)

const loadModbusConfig = async () => {
  if (!window.electronAPI?.getSettings) return
  const settings = await window.electronAPI.getSettings()
  if (settings.modbusSettings) {
    const m = settings.modbusSettings
    modbusConfigForm.value = {
      enabled: m.enabled !== false,
      ip: m.ip || '192.168.1.12',
      port: m.port || 502,
      unitId: m.unitId || 1,
      buttonChannel: m.buttonChannel ?? 1,
      resetChannel: m.resetChannel ?? 2,
      lightGreen: m.lightGreen ?? 0,
      lightYellow: m.lightYellow ?? 1,
      lightRed: m.lightRed ?? 2,
      buzzer: m.buzzer ?? 3,
    }
  }
}

// 确定按钮：保存配置并测试连接
const handleConfirmDialog = async () => {
  isSavingModbus.value = true
  try {
    // 始终保存 Modbus 配置
    await saveModbusConfig()
    // 如果 Modbus 启用，测试连接
    if (modbusConfigForm.value.enabled && window.electronAPI?.restartModbus) {
      const result = await window.electronAPI.restartModbus()
      if (result.connected) {
        modbusStatus.value = { ...modbusStatus.value!, connected: true }
        showToast('Modbus 连接成功', 'info')
        showCameraManagerDialog.value = false
      } else {
        modbusStatus.value = { ...modbusStatus.value!, connected: false }
        showToast('Modbus 连接失败，请检查配置', 'error')
      }
    } else {
      // Modbus 禁用，直接关闭
      showCameraManagerDialog.value = false
    }
  } catch (err) {
    console.error('Failed:', err)
    showToast('操作失败', 'error')
  } finally {
    isSavingModbus.value = false
  }
}

const saveModbusConfig = async () => {
  if (!window.electronAPI?.saveSettings) return
  try {
    const settings = await window.electronAPI.getSettings()
    await window.electronAPI.saveSettings({
      ...settings,
      modbusSettings: {
        enabled: modbusConfigForm.value.enabled,
        ip: modbusConfigForm.value.ip,
        port: Number(modbusConfigForm.value.port),
        unitId: Number(modbusConfigForm.value.unitId),
        buttonChannel: Number(modbusConfigForm.value.buttonChannel),
        resetChannel: Number(modbusConfigForm.value.resetChannel),
        lightGreen: Number(modbusConfigForm.value.lightGreen),
        lightYellow: Number(modbusConfigForm.value.lightYellow),
        lightRed: Number(modbusConfigForm.value.lightRed),
        buzzer: Number(modbusConfigForm.value.buzzer),
      }
    })
    await fetchModbusStatus()
  } catch (err) {
    console.error('Failed to save modbus config:', err)
    throw err
  }
}

const saveSelectedCamera = () => {
  if (selectedCameraId.value) {
    localStorage.setItem('selectedCameraId', String(selectedCameraId.value))
  }
}

// 获取当前产品绑定的相机ID，优先产品绑定的，其次全局选中的
const getEffectiveCameraId = () => {
  const product = products.value.find(p => p.id === selectedProductId.value)
  return product?.cameraId || selectedCameraId.value
}

const getEffectiveCamera = () => {
  const id = getEffectiveCameraId()
  if (!id) return null
  return cameras.value.find(c => c.id === id) || null
}

// 选择相机并绑定到当前产品
const selectAndBindCamera = async (cam: any) => {
  // 如果已选中该相机，则取消绑定
  if (selectedCameraId.value === cam.id) {
    await unbindCamera()
    return
  }
  selectedCameraId.value = cam.id
  saveSelectedCamera()
  loadCameraSettingsToForm(cam)

  // 更新当前产品的 cameraId 绑定
  if (selectedProductId.value && window.electronAPI?.updateProduct) {
    try {
      await window.electronAPI.updateProduct(selectedProductId.value, { cameraId: cam.id })
      const product = products.value.find(p => p.id === selectedProductId.value)
      if (product) product.cameraId = cam.id
      showToast(`已将相机 "${cam.name}" 绑定到当前产品`, 'info')
    } catch (err) {
      console.error('Failed to bind camera to product:', err)
    }
  }
}

// Row 2 关闭/连接按钮（固定，不随相机切换消失）
const closeButtonText = computed(() => {
  if (!selectedCamera.value) return t('dashboard.close')
  if (selectedCamera.value.isNetworkCamera && selectedCamera.value.status !== 'online') return t('dashboard.connect')
  return t('dashboard.close')
})

const handleCloseOrConnect = () => {
  if (!selectedCamera.value) {
    showToast('请先选择一个相机', 'info')
    return
  }
  if (selectedCamera.value.isNetworkCamera) {
    if (selectedCamera.value.status === 'online') {
      // 关闭：断开相机 + 停止 Modbus
      handleDisconnectCamera(selectedCamera.value)
      if (modbusStatus.value?.enabled && window.electronAPI?.stopModbus) {
        window.electronAPI.stopModbus().then(() => fetchModbusStatus())
      }
    } else {
      // 连接：连接相机 + 重启 Modbus
      handleConnectCamera(selectedCamera.value)
      if (modbusStatus.value?.enabled && window.electronAPI?.restartModbus) {
        window.electronAPI.restartModbus().then(() => fetchModbusStatus())
      }
    }
  } else {
    // USB 关闭：停止实况 + 停止 Modbus
    stopLive()
    if (modbusStatus.value?.enabled && window.electronAPI?.stopModbus) {
      window.electronAPI.stopModbus().then(() => fetchModbusStatus())
    }
  }
}

const unbindCamera = async () => {
  if (selectedProductId.value && window.electronAPI?.updateProduct) {
    try {
      await window.electronAPI.updateProduct(selectedProductId.value, { cameraId: null })
      const product = products.value.find(p => p.id === selectedProductId.value)
      if (product) product.cameraId = null
      selectedCameraId.value = null
      localStorage.removeItem('selectedCameraId')
      showToast('已取消相机绑定', 'info')
    } catch (err) {
      console.error('Failed to unbind camera:', err)
    }
  }
}

// 确保相机已连接（自动尝试重连）
const ensureCameraConnected = async (cam: any) => {
  if (!cam || !cam.isNetworkCamera) return true
  if (cam.status === 'online') return true
  // 尝试自动连接
  try {
    showToast(`正在连接相机 ${cam.name}...`, 'info')
    await handleConnectCamera(cam)
    // 等待状态更新
    await new Promise(r => setTimeout(r, 1500))
    const updated = cameras.value.find(c => c.id === cam.id)
    if (updated?.status === 'online') return true
    showToast(`相机 ${cam.name} 连接失败，请手动连接`, 'error')
    return false
  } catch {
    showToast(`相机 ${cam.name} 连接失败`, 'error')
    return false
  }
}

// 监听相机选择变化，自动持久化到 localStorage，确保刷新/重启后能恢复
watch(selectedCameraId, (newId) => {
  if (newId != null) {
    localStorage.setItem('selectedCameraId', String(newId))
  } else {
    localStorage.removeItem('selectedCameraId')
  }
})

const loadCameraSettingsToForm = (camera: any) => {
  const config = camera?.config ? JSON.parse(camera.config) : {}
  if (config.width) widthValue.value = config.width
  if (config.height) heightValue.value = config.height
  if (config.offsetX !== undefined) offsetXValue.value = config.offsetX
  if (config.offsetY !== undefined) offsetYValue.value = config.offsetY
  if (config.exposureTime) exposureValue.value = Math.round(config.exposureTime / 52)
  if (config.gain !== undefined) gainValue.value = Math.round(Math.max(0, Math.min(1957, config.gain)))
}

const restoreSelectedCamera = () => {
  const savedCameraId = localStorage.getItem('selectedCameraId')
  if (!savedCameraId) return
  // camera.id 是 UUID 字符串，直接比较即可
  const camera = cameras.value.find(c => c.id === savedCameraId)
  if (camera) {
    selectedCameraId.value = camera.id
    loadCameraSettingsToForm(camera)
  }
}

const takeCapture = async (): Promise<boolean> => {
  if (!selectedProductId.value) {
    alert('请先选择一个产品')
    return false
  }

  // 清除旧结果（工作流残留等），确保新拍照不会叠加旧检测框
  clearResults()

  const targetCamera = getEffectiveCamera()
  if (!targetCamera) {
    showToast('请先在产品设置中绑定相机', 'error')
    return false
  }

  if (targetCamera.isEnabled === false) {
    showToast('当前相机已禁用，请先启用相机', 'error')
    return false
  }

  if (targetCamera.isNetworkCamera) {
    const connected = await ensureCameraConnected(targetCamera)
    if (!connected) return false
    return await handleCaptureFromCamera(targetCamera)
  }

  let stream: MediaStream | null = null
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: targetCamera.config ? JSON.parse(targetCamera.config).deviceId : undefined,
        exposureMode: 'manual'
      } as MediaTrackConstraints
    })

    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities()
      const settings: any = {}

      if (capabilities.exposureTime) {
        const min = capabilities.exposureTime.min || 100
        const max = capabilities.exposureTime.max || 10000
        settings.exposureTime = min + (exposureValue.value / 200) * (max - min)
      } else if (capabilities.exposureCompensation) {
        const min = capabilities.exposureCompensation.min || -2
        const max = capabilities.exposureCompensation.max || 2
        settings.exposureCompensation = min + (exposureValue.value / 200) * (max - min)
      }

      if (capabilities.iso) {
        const min = capabilities.iso.min || 100
        const max = capabilities.iso.max || 6400
        settings.iso = Math.round(min + (gainValue.value / 1957) * (max - min))
      } else if (capabilities.brightness) {
        const min = capabilities.brightness.min || 0
        const max = capabilities.brightness.max || 255
        settings.brightness = min + (gainValue.value / 1957) * (max - min)
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

    stream.getTracks().forEach(track => track.stop())

    const dataUrl = canvas.toDataURL('image/jpeg')

    if (selectedProductHasImage.value && selectedProductHasAnnotation.value) {
      await runCaptureInference(dataUrl)
    } else {
      clearResults()  // 非推理拍照也清除旧检测结果
      const fileName = `capture_${Date.now()}.jpg`
      if (window.electronAPI?.saveImage) {
        try {
          const filePath = await window.electronAPI.saveImage({
            productId: selectedProductId.value,
            fileName,
            dataUrl
          })
          mainViewUrl.value = dataUrl
          mainViewState.value = 'image'

          await fetchInitialData()
          showToast('拍照成功', 'info')
        } catch (err) {
          console.error('Failed to save captured image:', err)
          showToast('保存图片失败', 'error')
        }
      } else {
        mainViewUrl.value = dataUrl
        mainViewState.value = 'image'
      }
    }
    return true
  } catch (err) {
    console.error('Failed to capture from camera:', err)
    showToast('拍照失败：无法访问相机', 'error')
    return false
  }
}

const runCaptureInference = async (dataUrl: string) => {
  // 清除旧结果，确保推理结果不会与工作流残留叠加
  clearResults()
  workflowExecutor.stepResults.value = []
  selectedPredictionStep.value = null
  workflowStepImages.value = {}
  viewingStepIndex.value = -1
  showWorkflowGrid.value = true

  await fetchInferenceServices()

  if (inferenceServices.value.length === 0) {
    showToast('当前没有可用的推理服务，请先在部署页面启动服务', 'error')
    return
  }

  selectedInferenceService.value = inferenceServices.value[0]?.service_id || ''
  isInferring.value = true
  inferenceAbortController = new AbortController()

  try {
    const blob = await fetch(dataUrl).then(r => r.blob())
    const formData = new FormData()
    formData.append('service_id', selectedInferenceService.value)
    formData.append('file', blob, 'capture.jpg')

    const selectedService = inferenceServices.value.find(s => s.service_id === selectedInferenceService.value)
    const inferenceUrl = await getInferenceUrl(selectedService?.inference_url)
    const res = await fetch(`${inferenceUrl}/predict`, {
      method: 'POST',
      body: formData,
      signal: inferenceAbortController.signal
    })

    const data = await res.json()
    const result = data.status === 'success' && data.result ? data.result : data
    let allResults: any[] = []

    // 处理多工件结果，保留工件信息
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
      detectionResults.value = allResults.map((r: any) => ({
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
        category: r.category
      }))
      predictionConfidence.value = Math.max(...detectionResults.value.map(r => r.score), 0)
    } else {
      detectionResults.value = []
      predictionConfidence.value = null
    }

    mainViewUrl.value = dataUrl
    mainViewState.value = 'image'
    showToast('拍照识别完成', 'info')
    
    // 自动保存ROI（拍照识别后）
    if (detectionResults.value.length > 0 && selectedProductId.value) {
      const selectedService = inferenceServices.value.find(s => s.service_id === selectedInferenceService.value)
      const taskUuid = selectedService?.task_uuid || 'unknown'
      // 先为每个结果设置 modelIsAnomaly
      detectionResults.value = detectionResults.value.map(r => ({
        ...r,
        modelIsAnomaly: r.isAnomaly
      }))
      await autoSaveRoiImages(dataUrl, detectionResults.value, taskUuid)
    }
  } catch (err) {
    console.error('Capture inference error:', err)
    showToast('拍照识别失败', 'error')
  } finally {
    isInferring.value = false
    inferenceAbortController = null
  }
}

const handleImportFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  mainViewState.value = 'image'
  mainViewUrl.value = dataUrl

  // 如果已选择产品，则保存图片
  if (selectedProductId.value && window.electronAPI?.saveImage) {
    try {
      const fileName = `import_${Date.now()}_${file.name}`
      await window.electronAPI.saveImage({
        productId: selectedProductId.value,
        fileName,
        dataUrl
      })
      // 更新本地产品列表中的路径
      await fetchInitialData()
    } catch (err) {
      console.error('Failed to save imported image:', err)
    }
  }

  if (input) input.value = ''
}

const importImage = async () => {
  if (!selectedProductId.value) {
    alert('请先选择一个产品')
    return
  }

  if (window.electronAPI?.openFile) {
    try {
      const result = await window.electronAPI.openFile()
      if (result) {
        if (window.electronAPI?.saveImage) {
          try {
            const fileName = `import_${Date.now()}_${result.path.split(/[\\/]/).pop()}`
            await window.electronAPI.saveImage({
              productId: selectedProductId.value,
              fileName,
              dataUrl: result.data
            })
            // 更新本地产品列表中的路径
            await fetchInitialData()
          } catch (err) {
            console.error('Failed to save imported image:', err)
          }
        }
        mainViewState.value = 'image'
        mainViewUrl.value = result.data
      }
    } catch (err) {
      console.error('Failed to open file dialog:', err)
    }
  } else {
    importFileInput.value?.click()
  }
}


// Prediction Actions
const showDetectionLabels = ref(true)
const showDetectionBoxes = ref(true)
const normalGroupCollapsed = ref(false)
const anomalyGroupCollapsed = ref(false)

// 树形结构折叠状态
const treeCollapsedState = ref<Record<string, boolean>>({})

// 侧边栏区域折叠状态
const sectionCollapsed = ref({ camera: false, settings: false, products: false, predictions: false })
const toggleSection = (s: keyof typeof sectionCollapsed.value) => { sectionCollapsed.value[s] = !sectionCollapsed.value[s] }

// 相机状态辅助函数 — 根据选中+连接状态返回样式和文本
const isCameraAvailable = (cam: any) => {
  // USB 相机（非网络相机）始终可用；网络相机需要 online 状态
  if (!cam.isNetworkCamera) return cam.isEnabled !== false
  return cam.status === 'online'
}
const getCameraStatusClass = (cam: any) => {
  const isSelected = selectedCameraId.value === cam.id
  const avail = isCameraAvailable(cam)
  if (isSelected && avail) return 'text-green-600'
  if (isSelected && !avail) return 'text-yellow-600'
  return 'text-muted-foreground'
}
const getCameraStatusDotClass = (cam: any) => {
  const isSelected = selectedCameraId.value === cam.id
  const avail = isCameraAvailable(cam)
  if (isSelected && avail) return 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]'
  if (isSelected && !avail) return 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]'
  return 'bg-gray-400'
}
const getCameraStatusText = (cam: any) => {
  const isSelected = selectedCameraId.value === cam.id
  const avail = isCameraAvailable(cam)
  if (isSelected && avail) return t('dashboard.connected')
  if (isSelected && !avail) return t('dashboard.disconnected')
  return t('dashboard.notSelected')
}

// 按 anomaly_type -> category -> pos_id 层级分组的计算属性
const groupedDetectionResults = computed(() => {
  const groups: Record<string, Record<string, Record<string, Array<{ item: typeof detectionResults.value[0]; index: number }>>>> = {}

  detectionResults.value.forEach((item, index) => {
    const rawType = item.anomaly_type || '未知类型'
    // 默认只展示 NG，不展示 OK
    if (rawType === 'normal') return
    const type = 'NG'
    const cat = item.category || '未知类别'
    const pos = item.pos_id !== undefined ? String(item.pos_id) : '未知位置'

    if (cat === '工件主体') return

    if (!groups[type]) {
      groups[type] = {}
    }
    if (!groups[type][cat]) {
      groups[type][cat] = {}
    }
    if (!groups[type][cat][pos]) {
      groups[type][cat][pos] = []
    }
    groups[type][cat][pos].push({ item, index })
  })

  return groups
})

// 高亮检测框状态
const highlightedIndex = ref<number | null>(null)
let highlightTimer: NodeJS.Timeout | null = null
let breatheAnimationId: number | null = null

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuTargetIndex = ref<number | null>(null)

// 双击高亮检测框
const highlightDetectionBox = (index: number) => {
  // 清除之前的定时器
  if (highlightTimer) {
    clearTimeout(highlightTimer)
  }
  // 设置新的高亮索引
  highlightedIndex.value = index
  // 5秒后清除高亮
  highlightTimer = setTimeout(() => {
    highlightedIndex.value = null
    if (breatheAnimationId) {
      cancelAnimationFrame(breatheAnimationId)
      breatheAnimationId = null
    }
    drawDetectionBoxes()
  }, 5000)
  // 开始呼吸动画
  startBreatheAnimation()
}

// 呼吸动画
const startBreatheAnimation = () => {
  const animate = () => {
    if (highlightedIndex.value === null) return
    drawDetectionBoxes()
    breatheAnimationId = requestAnimationFrame(animate)
  }
  animate()
}

const clearResults = () => {
  predictionConfidence.value = null
  predictionResults.value = []
  detectionResults.value = []
  normalGroupCollapsed.value = false
  anomalyGroupCollapsed.value = false
  highlightedIndex.value = null
  contextMenuVisible.value = false
  if (highlightTimer) {
    clearTimeout(highlightTimer)
    highlightTimer = null
  }
  if (breatheAnimationId) {
    cancelAnimationFrame(breatheAnimationId)
    breatheAnimationId = null
  }
  // 清除检测画布上的绘制内容
  if (detectionCanvasRef.value) {
    const ctx = detectionCanvasRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, detectionCanvasRef.value.width, detectionCanvasRef.value.height)
    }
  }
}

const handleCanvasContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  const canvas = detectionCanvasRef.value
  const img = viewerImageRef.value
  if (!canvas || !img || detectionResults.value.length === 0) return

  const rect = canvas.getBoundingClientRect()
  const scaleX = img.naturalWidth / rect.width
  const scaleY = img.naturalHeight / rect.height
  const mouseX = (e.clientX - rect.left) * scaleX
  const mouseY = (e.clientY - rect.top) * scaleY

  const fontSize = Math.max(48, Math.min(24, Math.floor(img.naturalWidth / 50)))
  const padding = 4

  for (let i = 0; i < detectionResults.value.length; i++) {
    const det = detectionResults.value[i]
    if (det.label === '工件主体') continue
    if (det.visible === false) continue

    const hasSegmentation = det.segmentation && det.segmentation.length >= 8
    let labelX: number, labelY: number

    if (hasSegmentation) {
      const points: [number, number][] = []
      for (let j = 0; j < det.segmentation!.length; j += 2) {
        points.push([det.segmentation![j], det.segmentation![j + 1]])
      }
      labelX = Math.min(...points.map(p => p[0]))
      labelY = Math.min(...points.map(p => p[1])) - fontSize - 2
    } else {
      const [x, y] = det.bbox
      labelX = x
      labelY = y - fontSize - 2
    }

    const textWidth = fontSize * 2
    const textHeight = fontSize + padding * 2

    if (
      mouseX >= labelX &&
      mouseX <= labelX + textWidth &&
      mouseY >= labelY - padding &&
      mouseY <= labelY + textHeight
    ) {
      contextMenuVisible.value = true
      contextMenuX.value = e.clientX
      contextMenuY.value = e.clientY
      contextMenuTargetIndex.value = i
      return
    }
  }

  contextMenuVisible.value = false
}

// 标记NG/OK时更新ROI类型
const handleToggleAnomaly = async (index: number, isAnomaly: boolean) => {
  if (index >= 0 && index < detectionResults.value.length) {
    const item = { ...detectionResults.value[index] }
    
    // 保存模型原始判断（如果还没有保存）
    if (item.modelIsAnomaly === undefined) {
      item.modelIsAnomaly = item.isAnomaly
    }
    
    item.isAnomaly = isAnomaly
    item.anomaly_type = isAnomaly ? 'anomaly' : 'normal'
    
    // 如果有ROI记录，更新ROI类型
    if (item.roiId && selectedProductId.value) {
      const selectedService = inferenceServices.value.find(s => s.service_id === selectedInferenceService.value)
      const taskUuid = selectedService?.task_uuid || 'unknown'
      
      try {
        const result = await window.electronAPI.updateRoiType({
          productId: selectedProductId.value,
          taskUuid: taskUuid,
          category: item.category || item.label || 'unknown',
          fileName: item.roiFileName || `image_${item.roiId}.jpg`,
          userIsAnomaly: isAnomaly
        })
        
        if (result.success) {
          item.roiType = result.roiType
        }
      } catch (err) {
        console.error('Failed to update ROI type:', err)
      }
    }
    
    detectionResults.value[index] = item
    detectionResults.value = [...detectionResults.value]
    nextTick(() => drawDetectionBoxes())
  }
  contextMenuVisible.value = false
}

const showToggleConfirmModal = ref(false)
const toggleConfirmIndex = ref<number | null>(null)
const toggleConfirmValue = ref<boolean>(false)

const handleToggleAnomalyWithConfirm = (index: number, isAnomaly: boolean) => {
  toggleConfirmIndex.value = index
  toggleConfirmValue.value = isAnomaly
  showToggleConfirmModal.value = true
}

const confirmToggleAnomaly = () => {
  if (toggleConfirmIndex.value !== null) {
    handleToggleAnomaly(toggleConfirmIndex.value, toggleConfirmValue.value)
  }
  showToggleConfirmModal.value = false
}

const handleGlobalClick = () => {
  contextMenuVisible.value = false
  openCameraMenuId.value = null
}

// 格式化日期为 YYYY-MM-DD hh:mm:ss
const formatDateTime = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

// 手动保存ROI - 只保存用户修改过标签的ROI
// 保存路径: extra-picture/{taskUuid}/{datetime}/{category}/NG|OK
const handleSaveRoiImages = async () => {
  if (!selectedProductId.value || detectionResults.value.length === 0) return

  const selectedService = inferenceServices.value.find(s => s.service_id === selectedInferenceService.value)
  const taskUuid = selectedService?.task_uuid || 'unknown'
  const imageUrl = mainViewUrl.value

  if (!imageUrl) {
    showToast('没有可保存的图片', 'error')
    return
  }

  try {
    const roiImages = []
    const fnRoiInfos = []
    const now = new Date()
    const requestTime = formatDateTime(now)

    for (let i = 0; i < detectionResults.value.length; i++) {
      const det = detectionResults.value[i]
      if (det.label === '工件主体') continue

      // 只保存用户修改过的ROI（modelIsAnomaly 和 userIsAnomaly 不一致）
      const modelIsAnomaly = det.modelIsAnomaly ?? det.isAnomaly
      const userIsAnomaly = det.isAnomaly

      // 如果模型判断和用户判断一致，说明用户没有修改，跳过
      if (modelIsAnomaly === userIsAnomaly) continue

      // 计算ROI类型
      let roiType = 'NORMAL'
      if (modelIsAnomaly === true && userIsAnomaly === false) {
        roiType = 'FP'
      } else if (modelIsAnomaly === false && userIsAnomaly === true) {
        roiType = 'FN'
      }

      const category = det.category || det.label || 'unknown'
      const posId = det.pos_id != null ? String(det.pos_id) : undefined

      // 使用workpiece_id字段（从推理结果传递过来的）
      const workpieceId = (det as any).workpiece_id != null ? String((det as any).workpiece_id) : selectedProductId.value

      // FN类型的ROI通过后端接口获取图片
      if (roiType === 'FN' && selectedService && posId) {
        fnRoiInfos.push({
          category,
          posId,
          workpieceId,
          isAnomaly: userIsAnomaly,
          modelIsAnomaly,
          userIsAnomaly,
          roiType,
        })
      } else {
        // FP和NORMAL类型使用前端裁剪
        const hasSegmentation = det.segmentation && det.segmentation.length >= 8
        let base64: string

        if (hasSegmentation) {
          // 使用多边形裁剪，与标注显示一致
          const blob = await cropImageBySegmentation(imageUrl, det.segmentation)
          base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        } else {
          // 使用bbox矩形裁剪
          const [x, y, w, h] = det.bbox
          if (w <= 0 || h <= 0) continue

          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = imageUrl
          })

          const canvas = document.createElement('canvas')
          canvas.width = Math.round(w)
          canvas.height = Math.round(h)
          const ctx = canvas.getContext('2d')
          if (!ctx) continue

          ctx.drawImage(img, x, y, w, h, 0, 0, w, h)
          base64 = canvas.toDataURL('image/jpeg', 0.95)
        }

        roiImages.push({
          category,
          isAnomaly: userIsAnomaly,
          modelIsAnomaly,
          userIsAnomaly,
          posId,
          base64
        })
      }
    }

    // 处理FN类型的ROI，调用后端接口获取图片
    if (fnRoiInfos.length > 0 && selectedService) {
      try {
        const inferenceUrl = await getInferenceUrl(selectedService.inference_url)
        console.log('[FN ROI] Inference URL:', inferenceUrl, 'FN count:', fnRoiInfos.length)
        if (inferenceUrl) {
          for (const fnRoi of fnRoiInfos) {
            console.log('[FN ROI] Fetching for posId:', fnRoi.posId, 'category:', fnRoi.category)
            const response = await fetch(`${inferenceUrl}/get_roi_images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                task_uuid: taskUuid,
                workpiece_id: fnRoi.workpieceId,
                pos_id: fnRoi.posId,
                normalize_brightness: false,
                normalize_contrast: false
              })
            })

            console.log('[FN ROI] Response status:', response.status)
            if (response.ok) {
              const data = await response.json()
              console.log('[FN ROI] Response data:', { success: data.success, roiCount: data.rois?.length })
              if (data.success && data.rois && data.rois.length > 0) {
                const roiData = data.rois[0]
                roiImages.push({
                  category: fnRoi.category,
                  isAnomaly: fnRoi.isAnomaly,
                  modelIsAnomaly: fnRoi.modelIsAnomaly,
                  userIsAnomaly: fnRoi.userIsAnomaly,
                  posId: fnRoi.posId,
                  base64: `data:image/jpeg;base64,${roiData.image_b64}`
                })
                console.log('[FN ROI] Successfully added ROI image')
              } else {
                console.warn('[FN ROI] No ROI data in response')
              }
            } else {
              const errorText = await response.text()
              console.error('[FN ROI] Response not OK:', response.status, errorText)
            }
          }
        } else {
          console.warn('[FN ROI] No inference URL available')
        }
      } catch (err) {
        console.error('Failed to get FN ROI images from backend:', err)
      }
    } else {
      console.log('[FN ROI] No FN ROIs to process or no selected service')
    }

    if (roiImages.length === 0) {
      showToast('没有用户修改过的ROI需要保存', 'warning')
      return
    }

    const result = await window.electronAPI.saveRoiImages({
      productId: selectedProductId.value,
      taskUuid,
      images: roiImages,
      mode: 'manual',
      requestTime
    })

    if (result.success) {
      showToast(`已保存 ${roiImages.length} 个修改过的ROI图片`, 'success')

      // 保存ROI记录ID到detectionResults，用于后续更新
      let roiIndex = 0
      for (let i = 0; i < detectionResults.value.length; i++) {
        const det = detectionResults.value[i]
        if (det.label === '工件主体') continue
        const modelIsAnomaly = det.modelIsAnomaly ?? det.isAnomaly
        const userIsAnomaly = det.isAnomaly
        if (modelIsAnomaly === userIsAnomaly) continue

        if (roiIndex < result.rois.length) {
          det.roiId = result.rois[roiIndex].id
          det.roiType = result.rois[roiIndex].roiType
          roiIndex++
        }
      }
    } else {
      showToast('保存ROI失败: ' + result.error, 'error')
    }
  } catch (err) {
    console.error('Failed to save ROI images:', err)
    showToast('保存ROI失败', 'error')
  }
}

const cropImageBySegmentation = (imageUrl: string, segmentation: number[]): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!segmentation || segmentation.length < 6) {
        reject(new Error('Invalid segmentation data'))
        return
      }

      const points: { x: number; y: number }[] = []
      for (let i = 0; i < segmentation.length; i += 2) {
        points.push({ x: segmentation[i], y: segmentation[i + 1] })
      }

      // ---- 1. 计算旋转角：遍历所有边，找最接近水平/垂直的角度 ----
      let angle = 0
      let minDelta = Infinity
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i]
        const p2 = points[(i + 1) % points.length]
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        if (Math.sqrt(dx * dx + dy * dy) < 1) continue

        let edgeAngle = Math.atan2(dy, dx)
        // 归一化到 (-PI/4, PI/4]，使角度偏差最小
        edgeAngle = edgeAngle % (Math.PI / 2)
        if (edgeAngle > Math.PI / 4) edgeAngle -= Math.PI / 2
        if (edgeAngle <= -Math.PI / 4) edgeAngle += Math.PI / 2

        if (Math.abs(edgeAngle) < minDelta) {
          minDelta = Math.abs(edgeAngle)
          angle = edgeAngle
        }
      }

      // ---- 2. 把整图旋转 -angle，使 ROI 水平 ----
      const cos = Math.abs(Math.cos(angle))
      const sin = Math.abs(Math.sin(angle))
      const rotW = Math.ceil(img.width * cos + img.height * sin)
      const rotH = Math.ceil(img.width * sin + img.height * cos)

      const rotCanvas = document.createElement('canvas')
      rotCanvas.width = rotW
      rotCanvas.height = rotH
      const rotCtx = rotCanvas.getContext('2d')
      if (!rotCtx) { reject(new Error('No context')); return }

      rotCtx.translate(rotW / 2, rotH / 2)
      rotCtx.rotate(-angle)
      rotCtx.drawImage(img, -img.width / 2, -img.height / 2)

      // ---- 3. 把 segmentation 点同步变换到旋转后坐标系 ----
      const cx = img.width / 2
      const cy = img.height / 2
      const newCx = rotW / 2
      const newCy = rotH / 2
      const ca = Math.cos(-angle)
      const sa = Math.sin(-angle)

      const rotatedPoints = points.map(p => ({
        x: (p.x - cx) * ca - (p.y - cy) * sa + newCx,
        y: (p.x - cx) * sa + (p.y - cy) * ca + newCy
      }))

      // ---- 4. 轴对齐 bounding box 裁切 ----
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      rotatedPoints.forEach(p => {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      })

      const cropX = Math.max(0, Math.floor(minX))
      const cropY = Math.max(0, Math.floor(minY))
      const cropW = Math.min(rotW - cropX, Math.ceil(maxX - minX))
      const cropH = Math.min(rotH - cropY, Math.ceil(maxY - minY))

      if (cropW <= 0 || cropH <= 0) { reject(new Error('Invalid crop size')); return }

      const outCanvas = document.createElement('canvas')
      outCanvas.width = cropW
      outCanvas.height = cropH
      const outCtx = outCanvas.getContext('2d')
      if (!outCtx) { reject(new Error('No output context')); return }

      outCtx.drawImage(rotCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

      outCanvas.toBlob(blob => {
        blob ? resolve(blob) : reject(new Error('Blob creation failed'))
      }, 'image/jpeg', 0.95)
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = imageUrl
  })
}

// 自动保存ROI - 每次推理请求后自动保存所有ROI
// 保存路径: request-result/{taskUuid}/{datetime}/{category}/NG|OK
const autoSaveRoiImages = async (imageUrl: string, results: any[], taskUuid: string) => {
  
  if (!selectedProductId.value || results.length === 0) {
    return
  }

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    const roiImages = []
    const now = new Date()
    const requestTime = formatDateTime(now)

    for (let i = 0; i < results.length; i++) {
      const det = results[i]
      if (det.label === '工件主体') continue

      const hasSegmentation = det.segmentation && det.segmentation.length >= 8
      const modelIsAnomaly = det.modelIsAnomaly ?? det.isAnomaly
      let base64: string

      if (hasSegmentation) {
        // 使用多边形裁剪（包含去旋转逻辑）
        const blob = await cropImageBySegmentation(imageUrl, det.segmentation)
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } else {
        // 使用bbox矩形裁剪
        const [x, y, w, h] = det.bbox
        if (w <= 0 || h <= 0) continue

        const canvas = document.createElement('canvas')
        canvas.width = Math.round(w)
        canvas.height = Math.round(h)
        const ctx = canvas.getContext('2d')
        if (!ctx) continue

        ctx.drawImage(img, x, y, w, h, 0, 0, w, h)
        base64 = canvas.toDataURL('image/jpeg', 0.95)
      }

      roiImages.push({
        category: det.category || det.label || 'unknown',
        isAnomaly: modelIsAnomaly,
        modelIsAnomaly: modelIsAnomaly,
        userIsAnomaly: modelIsAnomaly,
        posId: det.pos_id != null ? String(det.pos_id) : undefined,
        base64
      })
    }

    if (roiImages.length === 0) return

    await window.electronAPI.saveRoiImages({
      productId: selectedProductId.value,
      taskUuid,
      images: roiImages,
      mode: 'auto',  // 自动保存模式
      requestTime
    })

  } catch (err) {
    console.error('[Auto Save] Failed to save ROI images:', err)
  }
}

const openInferenceModal = () => {
  if (isInferring.value) {
    return
  }
  if (inferenceServices.value.length === 0) {
    showToast('当前没有可用的推理服务，请先在部署页面启动服务', 'error')
    return
  }
  inferenceImageUrl.value = mainViewUrl.value || ''
  selectedInferenceService.value = inferenceServices.value[0]?.service_id || ''
  showInferenceModal.value = true
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
  if (input) input.value = ''
}

const triggerInferenceFileInput = () => {
  inferenceFileInput.value?.click()
}

const captureAndInfer = async () => {
  if (!selectedProductId.value) {
    showToast('请先选择一个产品', 'error')
    return
  }

  if (isInferring.value) {
    return
  }

  const enabledCameras = cameras.value.filter(c => c.isEnabled !== false)
  if (enabledCameras.length === 0) {
    showToast('没有可用的相机，请先添加并启用相机', 'error')
    return
  }

  await fetchInferenceServices()

  if (inferenceServices.value.length === 0) {
    showToast('当前没有可用的推理服务，请先在部署页面启动服务', 'error')
    return
  }

  let targetCamera = getEffectiveCamera()
  if (!targetCamera || targetCamera.isEnabled === false) {
    targetCamera = enabledCameras[0]
  }
  if (targetCamera) {
    selectedCameraId.value = targetCamera.id
  }

  isInferring.value = true

  try {
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: targetCamera.config ? JSON.parse(targetCamera.config).deviceId : undefined,
        exposureMode: 'manual'
      } as MediaTrackConstraints
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities()
      const settings: any = {}

      if (capabilities.exposureTime) {
        const min = capabilities.exposureTime.min || 100
        const max = capabilities.exposureTime.max || 10000
        settings.exposureTime = min + (exposureValue.value / 200) * (max - min)
      } else if (capabilities.exposureCompensation) {
        const min = capabilities.exposureCompensation.min || -2
        const max = capabilities.exposureCompensation.max || 2
        settings.exposureCompensation = min + (exposureValue.value / 200) * (max - min)
      }

      if (capabilities.iso) {
        const min = capabilities.iso.min || 100
        const max = capabilities.iso.max || 6400
        settings.iso = Math.round(min + (gainValue.value / 1957) * (max - min))
      } else if (capabilities.brightness) {
        const min = capabilities.brightness.min || 0
        const max = capabilities.brightness.max || 255
        settings.brightness = min + (gainValue.value / 1957) * (max - min)
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

    stream.getTracks().forEach(track => track.stop())

    const dataUrl = canvas.toDataURL('image/jpeg')
    const fileName = `capture_${Date.now()}.jpg`

    inferenceImageUrl.value = dataUrl
    mainViewUrl.value = dataUrl
    mainViewState.value = 'image'
    selectedInferenceService.value = inferenceServices.value[0]?.service_id || ''

    if (window.electronAPI?.saveImage) {
      try {
        await window.electronAPI.saveImage({
          productId: selectedProductId.value,
          fileName,
          dataUrl
        })
        await fetchInitialData()
      } catch (err) {
        console.error('Failed to save captured image:', err)
      }
    }

    await runInference()
    showToast('拍照识别完成', 'info')
  } catch (err) {
    console.error('Failed to capture and infer:', err)
    showToast('拍照识别失败', 'error')
  } finally {
    isInferring.value = false
  }
}

const startInference = async () => {
  if (isInferring.value) {
    return
  }
  
  await fetchInferenceServices()
  
  if (inferenceServices.value.length === 0) {
    showToast('当前没有可用的推理服务，请先在部署页面启动服务', 'error')
    return
  }
  
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    if (isInferring.value) {
      return
    }
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    
    inferenceImageUrl.value = dataUrl
    mainViewUrl.value = dataUrl
    mainViewState.value = 'image'
    
    selectedInferenceService.value = inferenceServices.value[0]?.service_id || ''
    await nextTick()
    await runInference()
  }
  input.click()
}

const runInference = async () => {
  const imageToUse = inferenceImageUrl.value || mainViewUrl.value
  if (!selectedInferenceService.value || !imageToUse) {
    showToast('请先选择图片或上传图片', 'error')
    return
  }

  if (isInferring.value) {
    if (inferenceAbortController) {
      inferenceAbortController.abort()
    }
  }
  
  inferenceAbortController = new AbortController()

  isInferring.value = true
  clearResults()

  try {
    if (inferenceAbortController?.signal.aborted) {
      return
    }

    const formData = new FormData()
    formData.append('service_id', selectedInferenceService.value)
    
    const response = await fetch(imageToUse, { signal: inferenceAbortController?.signal })
    if (inferenceAbortController?.signal.aborted) {
      return
    }
    const blob = await response.blob()
    if (inferenceAbortController?.signal.aborted) {
      return
    }
    formData.append('file', blob, 'image.jpg')

    const selectedService = inferenceServices.value.find(s => s.service_id === selectedInferenceService.value)
    const inferenceUrl = await getInferenceUrl(selectedService?.inference_url)
    const res = await fetch(`${inferenceUrl}/predict`, {
      method: 'POST',
      body: formData,
      signal: inferenceAbortController?.signal
    })

    const data = await res.json()
    const result = data.status === 'success' && data.result ? data.result : data

    // 处理多工件预测结果格式
    if (result.workpiece_results && Array.isArray(result.workpiece_results) && result.workpiece_results.length > 0) {
        const allResults: Array<{
          label: string
          score: number
          bbox: [number, number, number, number]
          segmentation?: number[]
          isAnomaly?: boolean
          error?: number
          threshold?: number
          alignmentStrategy?: string
          visible: boolean
          anomaly_type?: string
          category?: string
          pos_id?: string
          workpieceId?: number
          workpieceKey?: string
        }> = []

        result.workpiece_results.forEach((wp: any, idx: number) => {
          const wpResults = (wp.results || []).map((r: any) => ({
            label: `wp${String(idx).padStart(2, '0')}: ${r.category || '未知'}`,
            score: (r.anomaly_score || r.score || 0) * 100,
            bbox: r.bbox_clipped || r.bbox_in_pred || r.bbox || [0, 0, 0, 0],
            segmentation: r.segmentation_in_pred || r.segmentation || [],
            isAnomaly: r.is_anomaly || r.isAnomaly || false,
                    error: r.error || 0,
            threshold: r.threshold || 0,
            alignmentStrategy: r.alignment_strategy || wp.alignment_strategy || 'ORB',
            visible: true,
            anomaly_type: r.anomaly_type || '',
            category: r.category || '',
            pos_id: r.pos_id,
            workpieceId: wp.workpiece_id || idx,
            workpieceKey: wp.workpiece_key || `wp${idx}`
          }))
          allResults.push(...wpResults)
        })

        detectionResults.value = allResults

        const totalWorkpieces = result.total_workpieces || result.workpiece_results.length
        const totalRoisAll = result.total_rois_all || allResults.length
        const anomalyCount = result.anomaly_count || allResults.filter((r: any) => r.isAnomaly).length

        if (detectionResults.value.length > 0) {
          const maxScore = Math.max(...detectionResults.value.map(r => r.score))
          predictionConfidence.value = maxScore
        }
        showToast(`检测到 ${totalWorkpieces} 个工件，${totalRoisAll} 个目标，异常: ${anomalyCount} 个`, 'info')
      }
      else if (result.workpieces && Array.isArray(result.workpieces) && result.workpieces.length > 0) {
        const allResults: Array<{
          label: string
          score: number
          bbox: [number, number, number, number]
          segmentation?: number[]
          isAnomaly?: boolean
          error?: number
          threshold?: number
          alignmentStrategy?: string
          visible: boolean
          anomaly_type?: string
          category?: string
          pos_id?: string
          workpieceId?: number
          workpieceKey?: string
        }> = []

        result.workpieces.forEach((wp: any, idx: number) => {
          const wpResults = (wp.results || []).map((r: any) => ({
            label: `wp${String(idx).padStart(2, '0')}: ${r.category || '未知'}`,
            score: (r.anomaly_score || r.score || 0) * 100,
            bbox: r.bbox || r.bbox_clipped || [0, 0, 0, 0],
            segmentation: r.segmentation_in_pred || r.segmentation || [],
            isAnomaly: r.is_anomaly || r.isAnomaly || false,
                    error: r.error || 0,
            threshold: r.threshold || 0,
            alignmentStrategy: r.alignment_strategy || wp.alignment_strategy || 'ORB',
            visible: true,
            anomaly_type: r.anomaly_type || '',
            category: r.category || '',
            pos_id: r.pos_id,
            workpieceId: wp.workpiece_id || idx,
            workpieceKey: wp.workpiece_key || `wp${idx}`
          }))
          allResults.push(...wpResults)
        })

        detectionResults.value = allResults

        const totalWorkpieces = result.total_workpieces || result.workpieces.length
        const totalRoisAll = result.total_rois_all || allResults.length
        const anomalyCount = result.anomaly_count || allResults.filter((r: any) => r.isAnomaly).length

        if (detectionResults.value.length > 0) {
          const maxScore = Math.max(...detectionResults.value.map(r => r.score))
          predictionConfidence.value = maxScore
        }
        showToast(`检测到 ${totalWorkpieces} 个工件，${totalRoisAll} 个目标，异常: ${anomalyCount} 个`, 'info')
      }
      else if (result.results && Array.isArray(result.results)) {
        const roiResults = result.results
        detectionResults.value = roiResults.map((r: any) => ({
          label: r.category || '未知',
          score: (r.anomaly_score || 0) * 100,
          bbox: r.bbox_clipped || r.bbox || [0, 0, 0, 0],
          segmentation: r.segmentation_in_pred || r.segmentation || [],
          isAnomaly: r.is_anomaly || false,
              error: r.error || 0,
          threshold: r.threshold || 0,
          alignmentStrategy: r.alignment_strategy || 'ORB',
          visible: true,
          anomaly_type: r.anomaly_type || '',
          category: r.category || '',
          pos_id: r.pos_id
        }))
        const anomalyCount = roiResults.filter((r: any) => r.is_anomaly).length
        if (detectionResults.value.length > 0) {
          const maxScore = Math.max(...detectionResults.value.map(r => r.score))
          predictionConfidence.value = maxScore
        }
        showToast(`检测到 ${detectionResults.value.length} 个目标，异常: ${anomalyCount} 个`, 'info')
      }
      // 处理目标检测结果（包含bbox）
      else if (result.detections && Array.isArray(result.detections)) {
        detectionResults.value = result.detections.map((d: any) => ({
          label: d.label || d.class || '未知',
          score: (d.score || d.confidence || d.probability || 0) * 100,
          bbox: d.bbox || d.box || [0, 0, 0, 0],
          isAnomaly: d.is_anomaly || false,
              visible: true
        }))
        if (detectionResults.value.length > 0) {
          const maxScore = Math.max(...detectionResults.value.map(r => r.score))
          predictionConfidence.value = maxScore
        }
      }
      // 处理分类结果
      else if (result.classifications && Array.isArray(result.classifications)) {
        predictionResults.value = result.classifications.map((c: any) => ({
          label: c.label || c.class || '未知',
          score: (c.score || c.confidence || c.probability || 0) * 100
        }))
        if (result.classifications.length > 0) {
          const maxScore = Math.max(...predictionResults.value.map(r => r.score))
          predictionConfidence.value = maxScore
        }
      } else if (result.predictions && Array.isArray(result.predictions)) {
        predictionResults.value = result.predictions.map((p: any) => ({
          label: p.label || p.name || '未知',
          score: (p.score || p.confidence || p.probability || 0) * 100
        }))
        if (result.predictions.length > 0) {
          const maxScore = Math.max(...predictionResults.value.map(r => r.score))
          predictionConfidence.value = maxScore
        }
      } else if (Array.isArray(result)) {
        predictionResults.value = result.map((r: any) => ({
          label: r.label || r.class || '未知',
          score: (r.score || r.confidence || r.probability || 0) * 100
        }))
        if (result.length > 0) {
          const maxScore = Math.max(...predictionResults.value.map(r => r.score))
          predictionConfidence.value = maxScore
        }
      }

      // 自动保存ROI（每次推理请求后）

      if (detectionResults.value.length > 0 && selectedProductId.value) {
        const selectedService = inferenceServices.value.find(s => s.service_id === selectedInferenceService.value)
        const taskUuid = selectedService?.task_uuid || 'unknown'
        const imageToUse = inferenceImageUrl.value || mainViewUrl.value
        if (imageToUse) {
          // 先为每个结果设置 modelIsAnomaly
          detectionResults.value = detectionResults.value.map(r => ({
            ...r,
            modelIsAnomaly: r.isAnomaly
          }))
          await autoSaveRoiImages(imageToUse, detectionResults.value, taskUuid)
        }
      }
  } catch (err: any) {
    if (err.name === 'AbortError' || err.name === 'DOMException') {
      return
    }
    console.error('Inference error:', err)
    showToast(err.message || '推理请求失败', 'error')
  } finally {
    isInferring.value = false
    showInferenceModal.value = false
    inferenceAbortController = null
    if (detectionResults.value.length > 0) {
      nextTick(() => drawDetectionBoxes())
    }
  }
}

// 绘制检测框
const drawDetectionBoxes = () => {
  const canvas = detectionCanvasRef.value
  const img = viewerImageRef.value
  if (!canvas || !img) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // const lineWidth = Math.max(1, Math.floor(canvas.width / 400))
  const lineWidth = 0.5
  const fontSize = Math.max(48, Math.min(24, Math.floor(canvas.width / 50)))

  detectionResults.value.forEach((det, index) => {
    if (det.label==='工件主体') return
    if (det.visible === false) return

    const [x, y, w, h] = det.bbox
    const isNG = det.isAnomaly === true
    const boxColor = isNG ? '#ef4444' : '#22c55e'
    const textColor = isNG ? '#ef4444' : '#22c55e'
    const labelText = isNG ? 'NG' : 'OK'

    const hasSegmentation = det.segmentation && det.segmentation.length >= 8

    if (hasSegmentation) {
      const points: [number, number][] = []
      for (let i = 0; i < det.segmentation!.length; i += 2) {
        points.push([det.segmentation![i], det.segmentation![i + 1]])
      }

      // 绘制分割轮廓（如果启用）
      if (showDetectionBoxes.value) {
        ctx.strokeStyle = boxColor
        ctx.lineWidth = lineWidth
        ctx.beginPath()
        ctx.moveTo(points[0][0], points[0][1])
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1])
        }
        ctx.closePath()
        ctx.stroke()
      }

      const minX = Math.min(...points.map(p => p[0]))
      const minY = Math.min(...points.map(p => p[1]))

      // 绘制标签（如果启用）
      if (showDetectionLabels.value) {
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.fillStyle = textColor
        ctx.textBaseline = 'top'
        ctx.fillText(labelText, minX, minY - fontSize - 2)
      }
    } else {
      // 绘制矩形框（如果启用）
      if (showDetectionBoxes.value) {
        ctx.strokeStyle = boxColor
        ctx.lineWidth = lineWidth
        ctx.strokeRect(x, y, w, h)
      }

      // 绘制标签（如果启用）
      if (showDetectionLabels.value) {
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.fillStyle = textColor
        ctx.textBaseline = 'top'
        ctx.fillText(labelText, x, y - fontSize - 2)
      }
    }
  })
}

const drawLiveDetectionBoxes = () => {
  const canvas = liveDetectionCanvasRef.value
  const video = liveVideoRef.value
  if (!canvas || !video || !isLiveStreaming.value) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = video.getBoundingClientRect()
  const parentRect = video.parentElement?.getBoundingClientRect()
  if (!parentRect) return

  canvas.width = parentRect.width
  canvas.height = parentRect.height

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const videoRatio = video.videoWidth / video.videoHeight
  const containerRatio = canvas.width / canvas.height

  let drawWidth = canvas.width
  let drawHeight = canvas.height
  let offsetX = 0
  let offsetY = 0

  if (videoRatio > containerRatio) {
    drawHeight = canvas.width / videoRatio
    offsetY = (canvas.height - drawHeight) / 2
  } else {
    drawWidth = canvas.height * videoRatio
    offsetX = (canvas.width - drawWidth) / 2
  }

  const scaleX = drawWidth / video.videoWidth
  const scaleY = drawHeight / video.videoHeight

  liveDetectionResults.value.forEach((det) => {
    if (det.visible === false) return

    let color = '#3b82f6'
    if (det.isAnomaly === true) {
      color = '#ef4444'
    } else if (det.isAnomaly === false) {
      color = '#22c55e'
    }

    const hasSegmentation = det.segmentation && det.segmentation.length >= 8

    if (hasSegmentation) {
      const points: [number, number][] = []
      for (let i = 0; i < det.segmentation!.length; i += 2) {
        points.push([
          offsetX + det.segmentation![i] * scaleX,
          offsetY + det.segmentation![i + 1] * scaleY
        ])
      }

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1])
      }
      ctx.closePath()
      ctx.stroke()
    } else {
      const [x, y, w, h] = det.bbox
      const drawX = offsetX + x * scaleX
      const drawY = offsetY + y * scaleY
      const drawW = w * scaleX
      const drawH = h * scaleY

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.strokeRect(drawX, drawY, drawW, drawH)
    }
  })
}

// 监听检测结果变化，自动绘制
watch(detectionResults, () => {
  if (detectionResults.value.length > 0) {
    nextTick(() => {
      drawDetectionBoxes()
      if (mainViewState.value === 'live') {
        drawLiveDetectionBoxes()
      }
    })
  }
}, { deep: true })

watch(showDetectionLabels, () => {
  if (detectionResults.value.length > 0) {
    nextTick(() => drawDetectionBoxes())
  }
})

watch(showDetectionBoxes, () => {
  if (detectionResults.value.length > 0) {
    nextTick(() => drawDetectionBoxes())
  }
})

watch(
  () => [mainViewState.value, mainViewUrl.value] as const,
  async ([state, url]) => {
    if (state !== 'image' || !url) return
    viewerImageNatural.value = null
    resetViewer()
    await nextTick()
    updateViewerViewportSize()
    ensureViewerResizeObserver()
  },
)

onBeforeUnmount(() => {
  delete window.__externalCapture
  document.removeEventListener('fullscreenchange', syncFullscreenState)
  document.removeEventListener('click', handleGlobalClick)
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  viewerResizeObserver?.disconnect()
  viewerResizeObserver = null
  if (inferenceAbortController) {
    inferenceAbortController.abort()
    inferenceAbortController = null
  }
  if (updateCameraDebounceTimer) {
    clearTimeout(updateCameraDebounceTimer)
    updateCameraDebounceTimer = null
  }
})

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})
</script>

<template>
  <div class="flex flex-col h-screen w-screen bg-background text-foreground">
    <header class="h-14 border-b flex items-center px-6 bg-card shrink-0 z-20 shadow-sm w-full">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bgnded flex items-center justify-center text-primary-foreground">
          <img src="~/assets/appicon.png" class="h-5 w-5" />
        </div>
        <h1 class="text-lg font-bold tracking-tight">{{ t('common.appName') }}</h1>
      </div>
      
      <div class="ml-auto flex items-center gap-3">
        <NuxtLink to="/settings">
          <UiButton variant="ghost" size="icon" :title="t('common.settings')">
            <Settings class="h-4 w-4" />
          </UiButton>
        </NuxtLink>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden w-full min-w-0" :class="{ 'select-none': isResizing }">
      <main class="flex-1 min-w-0 bg-muted/20 relative flex flex-col h-full">
        <div v-if="mainViewState === 'empty'" class="flex-1 p-8 flex items-center justify-center">
          <div class="text-center space-y-4 max-w-md">
            <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
              <ImageIcon class="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 class="text-2xl font-semibold text-muted-foreground">就绪</h2>
            <p class="text-sm text-muted-foreground/60 leading-relaxed">
              请点击右侧的“实况”、“拍照”或“导入”按钮开始操作。
            </p>
          </div>
        </div>

        <div v-else-if="mainViewState === 'image'" class="flex-1 min-w-0 min-h-0 flex flex-col bg-black/5 overflow-hidden">
          <!-- Toolbar -->
          <div class="shrink-0 h-12 bg-background border-b border-r flex items-center justify-center px-4">
            <div class="flex items-center gap-1">
              <UiButton variant="ghost" size="icon" class="h-8 w-8" title="缩小" @click="zoomOutCenter">
                <ZoomOut class="h-4 w-4" />
              </UiButton>
              <div class="px-2 text-[11px] font-mono tabular-nums text-muted-foreground min-w-[56px] text-center font-bold">
                {{ viewerZoomLabel }}
              </div>
              <UiButton variant="ghost" size="icon" class="h-8 w-8" title="放大" @click="zoomInCenter">
                <ZoomIn class="h-4 w-4" />
              </UiButton>
              
              <Separator orientation="vertical" class="h-6 mx-1" />
              
              <UiButton variant="ghost" size="icon" class="h-8 w-8" title="左转 90°" @click="rotateLeft">
                <RotateCcw class="h-4 w-4" />
              </UiButton>
              <UiButton variant="ghost" size="icon" class="h-8 w-8" title="右转 90°" @click="rotateRight">
                <RotateCw class="h-4 w-4" />
              </UiButton>
              <UiButton variant="ghost" size="icon" class="h-8 w-8" title="重置视图" @click="resetViewer">
                <RefreshCcw class="h-4 w-4" />
              </UiButton>
              
              <Separator orientation="vertical" class="h-6 mx-1" />
              
              <UiButton variant="ghost" size="icon" class="h-8 w-8" title="全屏" @click="toggleFullscreen">
                <component :is="viewerIsFullscreen ? Minimize2 : Maximize2" class="h-4 w-4" />
              </UiButton>
            </div>
          </div>

          <!-- Canvas Area -->
          <div class="flex-1 p-6 min-h-0 border-r">
            <!-- 工作流多步骤网格展示 -->
            <div
              v-if="Object.keys(workflowStepImages).length > 0 && showWorkflowGrid"
              class="w-full h-full rounded-lg bg-background/40 overflow-hidden shadow-2xl select-none"
            >
              <div
                class="w-full h-full grid gap-2 p-2"
                :style="{
                  gridTemplateColumns: `repeat(${workflowGridLayout.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${workflowGridLayout.rows}, 1fr)`
                }"
              >
                <div
                  v-for="(img, stepIdx) in workflowStepImages"
                  :key="stepIdx"
                  class="relative rounded-lg overflow-hidden bg-black/5 border border-border/50 cursor-pointer hover:border-primary/60 hover:shadow-lg transition-all active:scale-[0.98]"
                  @click="viewStepImage(Number(stepIdx))"
                >
                  <img
                    :src="img.dataUrl"
                    class="w-full h-full object-contain pointer-events-none"
                    :alt="`步骤 ${Number(stepIdx) + 1}`"
                  />
                  <div class="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded text-xs font-bold">
                    步骤 {{ Number(stepIdx) + 1 }}
                  </div>
                  <div
                    v-if="workflowExecutor.stepResults.value[Number(stepIdx)]?.status === 'failed'"
                    class="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold"
                  >
                    失败
                  </div>
                  <div
                    v-else-if="workflowExecutor.stepResults.value[Number(stepIdx)]?.inferenceSkipped"
                    class="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold"
                  >
                    跳过
                  </div>
                  <div
                    v-else-if="workflowExecutor.stepResults.value[Number(stepIdx)]?.isAnomaly"
                    class="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold"
                  >
                    NG
                  </div>
                  <div
                    v-else-if="workflowExecutor.stepResults.value[Number(stepIdx)]?.status === 'completed'"
                    class="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold"
                  >
                    OK
                  </div>
                </div>
              </div>
            </div>
            <!-- 单图展示（单品模式或工作流单步） -->
            <div
              v-else
              ref="viewerViewportRef"
              class="relative w-full h-full rounded-lg bg-background/40 overflow-hidden shadow-2xl select-none touch-none"
              :class="viewerIsPanning ? 'cursor-grabbing' : 'cursor-grab'"
              @pointerdown="onViewerPointerDown"
              @pointermove="onViewerPointerMove"
              @pointerup="onViewerPointerUp"
              @pointercancel="onViewerPointerUp"
              @wheel.prevent="onViewerWheel"
            >
              <!-- 工作流单步放大：返回网格按钮 -->
              <div
                v-if="Object.keys(workflowStepImages).length > 0 && !showWorkflowGrid"
                class="absolute top-3 left-3 z-10"
                @pointerdown.stop
              >
                <UiButton
                  variant="secondary"
                  size="sm"
                  class="h-8 gap-1.5 text-xs font-bold shadow-md bg-background/80 backdrop-blur-sm hover:bg-background"
                  @click.stop="backToWorkflowGrid"
                >
                  <ChevronRight class="h-3.5 w-3.5 rotate-180" />
                  返回网格
                </UiButton>
              </div>
              <div class="absolute left-1/2 top-1/2 will-change-transform" :style="viewerTransformStyle">
                <img
                  ref="viewerImageRef"
                  :src="mainViewUrl"
                  class="block max-w-none max-h-none pointer-events-none select-none"
                  :style="viewerImageStyle"
                  alt="Preview"
                  draggable="false"
                  @load="handleMainImageLoad"
                />
                <!-- 检测框画布 -->
                <canvas
                  v-if="detectionResults.length > 0"
                  ref="detectionCanvasRef"
                  class="absolute top-0 left-0"
                  :style="viewerImageStyle"
                  @contextmenu.prevent="handleCanvasContextMenu"
                />
              </div>
              <!-- 右键菜单 -->
              <div
                v-if="contextMenuVisible"
                class="fixed z-50 bg-popover border rounded-md shadow-md py-1 min-w-[120px]"
                :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
                @mousedown.stop
              >
                <button
                  v-if="contextMenuTargetIndex !== null && detectionResults[contextMenuTargetIndex]?.isAnomaly"
                  class="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
                  @mousedown.stop="handleToggleAnomaly(contextMenuTargetIndex!, false)"
                >
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  标记为 OK
                </button>
                <button
                  v-if="contextMenuTargetIndex !== null && !detectionResults[contextMenuTargetIndex]?.isAnomaly"
                  class="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
                  @mousedown.stop="handleToggleAnomaly(contextMenuTargetIndex!, true)"
                >
                  <span class="w-2 h-2 rounded-full bg-red-500"></span>
                  标记为 NG
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="mainViewState === 'live'" class="flex-1 relative flex items-center justify-center bg-black">
          <video
            v-show="isLiveStreaming"
            ref="liveVideoRef"
            class="w-full h-full object-contain"
            autoplay
            playsinline
            muted
          />
          <canvas
            v-show="isLiveStreaming && liveDetectionResults.length > 0"
            ref="liveDetectionCanvasRef"
            class="absolute inset-0 w-full h-full pointer-events-none"
          />
          <div v-if="!isLiveStreaming" class="w-full h-full flex items-center justify-center">
            <div class="text-center space-y-4">
              <div class="relative w-24 h-24 mx-auto">
                <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <Video class="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p class="text-primary font-mono text-sm animate-pulse">正在启动实况...</p>
            </div>
          </div>
          <div class="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            实时监控
          </div>
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <UiButton
              variant="default"
              size="sm"
              class="h-10 px-4 gap-2 bg-primary/90 hover:bg-primary"
              :class="{ 'bg-destructive hover:bg-destructive': isLiveInferring }"
              :disabled="!isLiveStreaming"
              @click="toggleLiveInference"
            >
              <Loader2 v-if="isLiveInferenceProcessing" class="h-4 w-4 animate-spin" />
              <Wand2 v-else-if="!isLiveInferring" class="h-4 w-4" />
              <Square v-else class="h-4 w-4" />
              {{ isLiveInferenceProcessing ? '识别中...' : (isLiveInferring ? '停止识别' : '开始流式识别') }}
            </UiButton>
            <div v-if="isLiveInferring" class="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs">
              <span class="text-muted-foreground">间隔:</span>
              <span class="font-mono font-bold ml-1">{{ liveInferenceIntervalMs }}ms</span>
            </div>
          </div>
        </div>
      </main>

      <div class="w-1.5 cursor-col-resize hover:bg-primary/50 bg-border shrink-0 transition-colors active:bg-primary" @mousedown="startResize" />
      <aside :style="{ width: sidebarWidth + 'px' }" class="shrink-0 bg-card flex flex-col h-full overflow-hidden">
          <!-- Camera Settings Section -->
          <section class="border-b flex flex-col min-h-0 overflow-hidden" :class="sectionCollapsed.camera ? 'shrink-0' : ''" :style="sectionCollapsed.camera ? {} : { height: sectionHeights.camera + 'px' }">
            <button class="h-10 px-4 flex items-center justify-between bg-muted/30 border-b shrink-0 hover:bg-muted/50 transition-colors w-full" @click="toggleSection('camera')">
              <div class="flex items-center gap-2">
                <Camera class="h-4 w-4 text-primary" />
                <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">{{ t('dashboard.cameraSettings') }}</span>
              </div>
              <ChevronRight class="h-4 w-4 text-muted-foreground transition-transform duration-200" :class="{ 'rotate-90': !sectionCollapsed.camera }" />
            </button>
            <div v-show="!sectionCollapsed.camera" class="flex-1 overflow-auto p-3">
              <!-- Camera Display (devices list) -->
              <div class="border border-gray-300 rounded-md overflow-hidden">
                <table class="w-full border-collapse">
                  <tbody>
                    <!-- Camera device row -->
                    <tr>
                      <td class="border-r border-gray-300 border-b border-gray-300 px-3 h-10">
                        <div class="flex items-center gap-2 min-w-0" v-if="selectedCamera">
                          <div :class="['w-1.5 h-1.5 rounded-full shrink-0', getCameraStatusDotClass(selectedCamera)]"></div>
                          <span class="text-xs font-medium truncate">{{ selectedCamera.name }}</span>
                          <Wifi v-if="selectedCamera.isNetworkCamera" class="h-3 w-3 text-blue-500 shrink-0" />
                        </div>
                      </td>
                      <td class="border-r-2 border-gray-400 border-b border-gray-300 px-4 h-10 text-center">
                        <div v-if="selectedCamera" :class="['w-3 h-3 rounded-full mx-auto', getCameraStatusDotClass(selectedCamera)]"></div>
                      </td>
                      <td class="border-b border-gray-300 px-2 h-10 w-[88px]">
                        <UiButton class="h-7 text-[10px] font-bold px-2 bg-blue-600 hover:bg-blue-700 text-white w-full" @click.stop="showCameraManagerDialog = true">
                          <Settings class="h-3 w-3 mr-1" />{{ t('dashboard.settings') }}
                        </UiButton>
                      </td>
                    </tr>
                    <!-- Close & Modbus row -->
                    <tr>
                      <td class="border-r border-gray-300 px-3 h-10">
                        <div class="flex items-center gap-2 min-w-0" v-if="modbusStatus?.enabled">
                          <div :class="['w-1.5 h-1.5 rounded-full shrink-0', modbusStatus?.connected ? 'bg-green-500' : 'bg-yellow-500']"></div>
                          <span class="text-xs font-medium truncate">Modbus</span>
                        </div>
                      </td>
                      <td class="border-r-2 border-gray-400 px-4 h-10 text-center">
                        <div v-if="modbusStatus?.enabled" :class="['w-3 h-3 rounded-full mx-auto', modbusStatus?.connected ? 'bg-green-500' : 'bg-yellow-500']"></div>
                      </td>
                      <td class="px-2 h-10 w-[88px]">
                        <UiButton class="h-7 text-[10px] font-bold px-2 bg-blue-600 hover:bg-blue-700 text-white w-full" @click.stop="handleCloseOrConnect">
                          {{ closeButtonText }}
                        </UiButton>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- Resize: camera ↔ image -->
          <div
            v-show="!sectionCollapsed.camera && !sectionCollapsed.settings"
            class="h-1.5 cursor-row-resize hover:bg-primary/50 bg-border shrink-0 transition-colors active:bg-primary relative z-10"
            @mousedown="startSectionResize('camera', $event)"
          />

          <!-- Image Settings Section -->
          <section class="border-b flex flex-col min-h-0 overflow-hidden" :class="sectionCollapsed.settings ? 'shrink-0' : ''" :style="sectionCollapsed.settings ? {} : { height: sectionHeights.image + 'px' }">
            <button class="h-10 px-4 flex items-center justify-between bg-muted/30 border-b shrink-0 hover:bg-muted/50 transition-colors w-full" @click="toggleSection('settings')">
              <div class="flex items-center gap-2">
                <Settings2 class="h-4 w-4 text-primary" />
                <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">{{ t('dashboard.imageSettings') }}</span>
              </div>
              <ChevronRight class="h-4 w-4 text-muted-foreground transition-transform duration-200" :class="{ 'rotate-90': !sectionCollapsed.settings }" />
            </button>
            <div v-show="!sectionCollapsed.settings" class="flex-1 overflow-auto p-4 space-y-4">
              <!-- 参数 + 操作按钮网格 -->
              <div class="border border-border rounded-md overflow-hidden">
                <!-- 第一行 -->
                <div class="grid grid-cols-4 border-b border-border">
                  <div class="p-2 border-r border-border flex items-center">
                    <UiButton class="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold" @click="startLive">
                      <Video class="h-4 w-4 mr-1" />{{ t('dashboard.live') }}
                    </UiButton>
                  </div>
                  <div class="p-2 border-r-2 border-r-border/60 flex items-center">
                    <UiButton class="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold" :disabled="isInferring || !selectedProductId" @click="takeCapture">
                      <Loader2 v-if="isInferring && selectedProductHasImage && selectedProductHasAnnotation" class="h-4 w-4 mr-1 animate-spin" />
                      <CameraIcon v-else class="h-4 w-4 mr-1" />
                      {{ selectedProductHasImage && selectedProductHasAnnotation ? (isInferring ? '识别中' : '拍照识别') : '添加产品图' }}
                    </UiButton>
                  </div>
                  <div class="p-2 border-r border-border flex items-center">
                    <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{{ t('dashboard.exposure') }}</span>
                  </div>
                  <div class="p-2 flex items-center justify-center">
                    <div class="flex items-center gap-0 w-full">
                      <UiButton variant="ghost" size="icon" class="h-7 w-7 rounded-r-none shrink-0 bg-blue-600 hover:bg-blue-700 text-white" @click="exposureValue = Math.max(1, exposureValue - 1)"><Minus class="h-3 w-3" /></UiButton>
                      <Input type="number" v-model.number="exposureValue" min="1" max="2000" class="h-7 w-full text-center font-mono text-[10px] rounded-none border-x-0 focus:z-10" />
                      <UiButton variant="ghost" size="icon" class="h-7 w-7 rounded-l-none shrink-0 bg-blue-600 hover:bg-blue-700 text-white" @click="exposureValue = Math.min(2000, exposureValue + 1)"><Plus class="h-3 w-3" /></UiButton>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-4 border-b border-border">
                  <div class="p-2 border-r border-border flex items-center">
                    <UiButton class="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold" @click="startInference"><Wand2 class="h-4 w-4 mr-1" />选择图片推理</UiButton>
                  </div>
                  <div class="p-2 border-r-2 border-r-border/60" />
                  <div class="p-2 border-r border-border flex items-center">
                    <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{{ t('dashboard.gain') }}</span>
                  </div>
                  <div class="p-2 flex items-center justify-center">
                    <div class="flex items-center gap-0 w-full">
                      <UiButton variant="ghost" size="icon" class="h-7 w-7 rounded-r-none shrink-0 bg-blue-600 hover:bg-blue-700 text-white" @click="gainValue = Math.round(Math.max(0, gainValue - Math.max(1, Math.round(gainValue * 0.1))))"><Minus class="h-3 w-3" /></UiButton>
                      <Input type="number" v-model.number="gainValue" min="0" max="1957" class="h-7 w-full text-center font-mono text-[10px] rounded-none border-x-0 focus:z-10" />
                      <UiButton variant="ghost" size="icon" class="h-7 w-7 rounded-l-none shrink-0 bg-blue-600 hover:bg-blue-700 text-white" @click="gainValue = Math.round(Math.min(1957, gainValue + Math.max(1, Math.round(gainValue * 0.1))))"><Plus class="h-3 w-3" /></UiButton>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-4 border-b border-border">
                  <div class="p-2 border-r border-border flex items-center">
                    <UiButton class="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold" :disabled="detectionResults.length === 0 || !selectedProductId" @click="handleSaveRoiImages">
                      <Download class="h-4 w-4 mr-1" />保存误报图
                    </UiButton>
                  </div>
                  <div class="p-2 border-r-2 border-r-border/60" />
                  <div class="p-2 border-r border-border flex items-center"><span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">偏移X</span></div>
                  <div class="p-2 flex items-center justify-center">
                    <div class="flex items-center gap-0 w-full">
                      <UiButton variant="ghost" size="icon" class="h-7 w-7 rounded-r-none shrink-0 bg-blue-600 hover:bg-blue-700 text-white" @click="offsetXValue = Math.round(Math.max(-1000, offsetXValue - 4) / 4) * 4"><Minus class="h-3 w-3" /></UiButton>
                      <Input type="number" v-model.number="offsetXValue" step="4" min="-1000" max="1000" class="h-7 w-full text-center font-mono text-[10px] rounded-none border-x-0 focus:z-10" />
                      <UiButton variant="ghost" size="icon" class="h-7 w-7 rounded-l-none shrink-0 bg-blue-600 hover:bg-blue-700 text-white" @click="offsetXValue = Math.round(Math.min(1000, offsetXValue + 4) / 4) * 4"><Plus class="h-3 w-3" /></UiButton>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-4 border-b border-border">
                  <div class="p-2 border-r border-border" />
                  <div class="p-2 border-r-2 border-r-border/60" />
                  <div class="p-2 border-r border-border flex items-center"><span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">偏移Y</span></div>
                  <div class="p-2 flex items-center justify-center">
                    <div class="flex items-center gap-0 w-full">
                      <UiButton variant="ghost" size="icon" class="h-7 w-7 rounded-r-none shrink-0 bg-blue-600 hover:bg-blue-700 text-white" @click="offsetYValue = Math.max(-1000, offsetYValue - 2)"><Minus class="h-3 w-3" /></UiButton>
                      <Input type="number" v-model.number="offsetYValue" step="2" min="-1000" max="1000" class="h-7 w-full text-center font-mono text-[10px] rounded-none border-x-0 focus:z-10" />
                      <UiButton variant="ghost" size="icon" class="h-7 w-7 rounded-l-none shrink-0 bg-blue-600 hover:bg-blue-700 text-white" @click="offsetYValue = Math.min(1000, offsetYValue + 2)"><Plus class="h-3 w-3" /></UiButton>
                    </div>
                  </div>
                </div>
                <!-- 工作流按钮行 -->
                <div class="grid grid-cols-4">
                  <div class="p-2 border-r border-border flex items-center">
                    <UiButton class="w-full h-10 bg-green-600 hover:bg-green-700 text-white text-xs font-bold" @click="router.push('/workflow')">
                      <Settings2 class="h-4 w-4 mr-1" />工作流配置
                    </UiButton>
                  </div>
                  <div class="p-2 border-r-2 border-r-border/60 flex items-center">
                    <UiButton class="w-full h-10 bg-green-600 hover:bg-green-700 text-white text-xs font-bold" @click="startWorkflowInference">
                      <Play class="h-4 w-4 mr-1" />工作流推理
                    </UiButton>
                  </div>
                  <div class="p-2 border-r border-border" />
                  <div class="p-2" />
                </div>
              </div>
            </div>
          </section>

          <!-- Resize: image ↔ product -->
          <div
            v-show="!sectionCollapsed.settings && !sectionCollapsed.products"
            class="h-1.5 cursor-row-resize hover:bg-primary/50 bg-border shrink-0 transition-colors active:bg-primary relative z-10"
            @mousedown="startSectionResize('image', $event)"
          />

          <!-- Product List -->
          <section class="border-b flex flex-col min-h-0" :class="sectionCollapsed.products ? 'shrink-0' : ''" :style="sectionCollapsed.products ? {} : { height: sectionHeights.products + 'px' }">
            <button class="h-10 px-4 flex items-center justify-between bg-muted/30 border-b shrink-0 hover:bg-muted/50 transition-colors w-full" @click="toggleSection('products')">
              <div class="flex items-center gap-2">
                <List class="h-4 w-4 text-primary" />
                <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">{{ t('dashboard.productList') }}</span>
              </div>
              <div class="flex items-center gap-1">
                <UiButton variant="ghost" size="icon" class="h-6 w-6 text-primary hover:bg-primary/10" @click.stop="openProductModal">
                  <Plus class="h-3.5 w-3.5" />
                </UiButton>
                <ChevronRight class="h-4 w-4 text-muted-foreground transition-transform duration-200" :class="{ 'rotate-90': !sectionCollapsed.products }" />
              </div>
            </button>
            <div v-show="!sectionCollapsed.products" class="flex-1 overflow-y-auto p-2">
              <div class="space-y-1">
                <div
                  v-for="product in products"
                  :key="product.id"
                  class="group p-2.5 text-xs rounded-md cursor-pointer flex items-center gap-3 transition-all duration-150 border"
                  :class="selectedProductId === product.id ? 'bg-primary/10 border-primary/30 shadow-sm' : 'border-transparent hover:bg-muted/60 hover:border-border/50 hover:shadow-sm'"
                  @click="handleSelectProduct(product.id)"
                  @dblclick="handleProductDoubleClick(product)"
                >
                  <div
                    class="w-8 h-8 rounded-md shrink-0 flex items-center justify-center transition-all duration-150"
                    :class="selectedProductId === product.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground/50 group-hover:bg-muted group-hover:text-muted-foreground'"
                  >
                    <Package class="h-4 w-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold truncate text-[12px] transition-colors duration-150" :class="selectedProductId === product.id ? 'text-primary' : 'group-hover:text-foreground'">{{ product.name }}</div>

                  </div>
                  <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div v-if="selectedProductId === product.id" class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse mr-1"></div>
                    <UiButton
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 hover:bg-primary/10"
                      @click.stop="viewProductImage(product)"
                      :title="'查看图片'"
                    >
                      <Eye class="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 hover:bg-primary/10"
                      @click.stop="handleEditProduct(product)"
                    >
                      <Pencil class="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 hover:bg-destructive/10"
                      @click.stop="openDeleteModal(product)"
                    >
                      <Trash2 class="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors" />
                    </UiButton>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Resize: product ↔ prediction -->
          <div
            v-show="!sectionCollapsed.products && !sectionCollapsed.predictions"
            class="h-1.5 cursor-row-resize hover:bg-primary/50 bg-border shrink-0 transition-colors active:bg-primary relative z-10 bg"
            @mousedown="startSectionResize('products', $event)"
          />

          <!-- Prediction Results -->
           <section class="flex flex-col min-h-0 overflow-hidden" :class="sectionCollapsed.predictions ? 'shrink-0' : 'flex-1'" :style="sectionCollapsed.predictions ? {} : { flex: '1' }">
              <button class="h-10 px-4 flex items-center justify-between bg-muted/30 border-b shrink-0 hover:bg-muted/50 transition-colors w-full" @click="toggleSection('predictions')">
                <div class="flex items-center gap-2">
                  <BarChart3 class="h-4 w-4 text-primary" />
                  <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">{{ t('dashboard.predictionResults') }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <UiButton variant="ghost" size="sm" class="h-6 px-2 text-[10px] font-bold gap-1 transition-colors" :class="showDetectionBoxes ? 'text-primary' : 'text-muted-foreground'" @click.stop="showDetectionBoxes = !showDetectionBoxes" :title="showDetectionBoxes ? '隐藏标注框' : '显示标注框'">
                    <component :is="showDetectionBoxes ? Square : Square" class="h-3 w-3" />
                  </UiButton>
                  <UiButton variant="ghost" size="sm" class="h-6 px-2 text-[10px] font-bold gap-1 transition-colors" :class="showDetectionLabels ? 'text-primary' : 'text-muted-foreground'" @click.stop="showDetectionLabels = !showDetectionLabels" :title="showDetectionLabels ? '隐藏标签' : '显示标签'">
                    <component :is="showDetectionLabels ? Eye : EyeOff" class="h-3 w-3" />
                  </UiButton>
                  <UiButton variant="ghost" size="sm" class="h-6 px-2 text-[10px] font-bold gap-1 text-muted-foreground hover:text-destructive transition-colors" @click.stop="clearResults">
                    <RotateCcw class="h-3 w-3" />
                    {{ t('dashboard.clear') }}
                  </UiButton>
                  <ChevronRight class="h-4 w-4 text-muted-foreground transition-transform duration-200 ml-1" :class="{ 'rotate-90': !sectionCollapsed.predictions }" />
                </div>
              </button>

              <div v-show="!sectionCollapsed.predictions" class="flex-1 flex flex-col min-h-0 overflow-hidden">

                <!-- 步骤列表（未选中步骤时显示） -->
                <WorkflowResultSummary
                  v-if="workflowExecutor.stepResults.value.length > 0 && selectedPredictionStep === null"
                  class="flex-1 min-h-0"
                  :results="workflowExecutor.stepResults.value.map(r => ({
                    stepIndex: r.stepIndex,
                    status: r.status,
                    isAnomaly: r.isAnomaly,
                    anomalyCount: r.anomalyCount,
                    errorMessage: r.errorMessage,
                    inferenceSkipped: r.inferenceSkipped,
                    hasDetections: r.hasDetections
                  }))"
                  @select-step="viewStepImage"
                />

                <!-- 选中步骤后的检测结果树 -->
                <div v-if="selectedPredictionStep !== null" class="flex-1 flex flex-col min-h-0 overflow-hidden p-3">
                  <!-- 返回按钮 -->
                  <div class="flex items-center gap-2 mb-3 pb-2 border-b shrink-0">
                    <UiButton variant="outline" size="sm" class="h-7 text-xs" @click="backToStepList">
                      <ChevronRight class="h-3.5 w-3.5 rotate-180 mr-1" />
                      返回步骤列表
                    </UiButton>
                    <span class="text-sm font-medium">步骤 {{ selectedPredictionStep + 1 }} 检测结果</span>
                  </div>

                  <!-- 检测结果树 -->
                  <div v-if="detectionResults.length > 0" class="flex-1 min-h-0 overflow-y-auto space-y-2">
                    <!-- 遍历 anomaly_type -->
                    <div v-for="(categories, anomalyType) in groupedDetectionResults" :key="anomalyType" class="rounded-md overflow-hidden mb-2" :class="anomalyType === 'NG' || anomalyType === 'anomaly' ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/20 border border-border/50'">
                      <!-- 第一层: anomaly_type -->
                      <button
                        @click="treeCollapsedState['type_' + anomalyType] = !treeCollapsedState['type_' + anomalyType]"
                        class="w-full px-3 py-2 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div class="flex items-center gap-2">
                          <ChevronRight
                            class="h-4 w-4 text-muted-foreground transition-transform duration-200"
                            :class="{ 'rotate-90': !treeCollapsedState['type_' + anomalyType] }"
                          />
                          <span class="text-xs font-semibold text-foreground">{{ anomalyType }}</span>
                        </div>
                      </button>

                      <!-- 第二层: category -->
                      <div v-show="!treeCollapsedState['type_' + anomalyType]" class="divide-y divide-border/20">
                        <div v-for="(posIds, category) in categories" :key="category">
                          <button
                            @click="treeCollapsedState['cat_' + anomalyType + '_' + category] = !treeCollapsedState['cat_' + anomalyType + '_' + category]"
                            class="w-full px-3 py-1.5 pl-8 flex items-center justify-between hover:bg-muted/20 transition-colors border-l-2 border-transparent hover:border-border/50"
                          >
                            <div class="flex items-center gap-2">
                              <ChevronRight
                                class="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200"
                                :class="{ 'rotate-90': !treeCollapsedState['cat_' + anomalyType + '_' + category] }"
                              />
                              <span class="text-xs text-foreground">{{ category }}</span>
                            </div>
                          </button>

                          <!-- 第三层: pos_id -->
                          <div v-show="!treeCollapsedState['cat_' + anomalyType + '_' + category]">
                            <div v-for="(items, posId) in posIds" :key="posId">
                              <button
                                @click="treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId] = !treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId]"
                                class="w-full px-3 py-1.5 pl-12 flex items-center justify-between hover:bg-muted/10 transition-colors border-l border-border/30"
                              >
                                <div class="flex items-center gap-2">
                                  <ChevronRight
                                    class="h-3 w-3 text-muted-foreground transition-transform duration-200"
                                    :class="{ 'rotate-90': !treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId] }"
                                  />
                                  <span class="text-[11px] text-muted-foreground">位置ID: {{ posId }}</span>
                                </div>
                              </button>

                              <!-- 叶子节点: 显示 anomaly_score -->
                              <div v-show="!treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId]" class="divide-y divide-border/20">
                                <div
                                  v-for="({ item, index: itemIndex }, idx) in items"
                                  :key="idx"
                                  @dblclick="highlightDetectionBox(itemIndex)"
                                  class="px-3 py-1.5 pl-16 flex items-center justify-between hover:bg-muted/10 cursor-pointer group transition-colors border-l border-transparent hover:border-primary/20"
                                >
                                  <div class="flex items-center gap-2">
                                    <button
                                      @click.stop="item.visible = !item.visible"
                                      class="flex items-center justify-center transition-colors hover:opacity-70"
                                    >
                                      <Eye v-if="item.visible" class="h-3 w-3 text-muted-foreground" />
                                      <EyeOff v-else class="h-3 w-3 text-muted-foreground/50" />
                                    </button>
                                    <span class="text-[11px] text-muted-foreground">异常得分:</span>
                                  </div>
                                  <div class="flex items-center gap-2">
                                    <UiButton
                                      variant="ghost"
                                      size="sm"
                                      class="h-5 px-2 text-[10px] font-bold gap-1"
                                      :class="item.isAnomaly ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-green-500 hover:text-green-600 hover:bg-green-50'"
                                      @click.stop="handleToggleAnomalyWithConfirm(itemIndex, !item.isAnomaly)"
                                    >
                                      <span class="w-1.5 h-1.5 rounded-full" :class="item.isAnomaly ? 'bg-red-500' : 'bg-green-500'"></span>
                                      {{ item.isAnomaly ? 'NG' : 'OK' }}
                                    </UiButton>
                                    <span
                                      class="text-[11px] font-mono font-medium"
                                      :class="item.isAnomaly ? 'text-red-500' : 'text-green-500'"
                                    >
                                      {{ (item.score / 100).toFixed(2) }}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 无检测结果提示 -->
                <div v-else-if="selectedPredictionStep !== null && detectionResults.length === 0" class="flex-1 flex items-center justify-center text-muted-foreground">
                  <p class="text-sm">该步骤没有检测结果</p>
                </div>

                <!-- 拍照识别的检测结果树 -->
                <div v-else-if="detectionResults.length > 0 && workflowExecutor.stepResults.value.length === 0" class="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                  <!-- 遍历 anomaly_type -->
                  <div v-for="(categories, anomalyType) in groupedDetectionResults" :key="anomalyType" class="rounded-md overflow-hidden mb-2" :class="anomalyType === 'NG' || anomalyType === 'anomaly' ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/20 border border-border/50'">
                    <!-- 第一层: anomaly_type -->
                    <button
                      @click="treeCollapsedState['type_' + anomalyType] = !treeCollapsedState['type_' + anomalyType]"
                      class="w-full px-3 py-2 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div class="flex items-center gap-2">
                        <ChevronRight
                          class="h-4 w-4 text-muted-foreground transition-transform duration-200"
                          :class="{ 'rotate-90': !treeCollapsedState['type_' + anomalyType] }"
                        />
                        <span class="text-xs font-semibold text-foreground">{{ anomalyType }}</span>
                      </div>
                    </button>

                    <!-- 第二层: category -->
                    <div v-show="!treeCollapsedState['type_' + anomalyType]" class="divide-y divide-border/20">
                      <div v-for="(posIds, category) in categories" :key="category">
                        <button
                          @click="treeCollapsedState['cat_' + anomalyType + '_' + category] = !treeCollapsedState['cat_' + anomalyType + '_' + category]"
                          class="w-full px-3 py-1.5 pl-8 flex items-center justify-between hover:bg-muted/20 transition-colors border-l-2 border-transparent hover:border-border/50"
                        >
                          <div class="flex items-center gap-2">
                            <ChevronRight
                              class="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200"
                              :class="{ 'rotate-90': !treeCollapsedState['cat_' + anomalyType + '_' + category] }"
                            />
                            <span class="text-xs text-foreground">{{ category }}</span>
                          </div>
                        </button>

                        <!-- 第三层: pos_id -->
                        <div v-show="!treeCollapsedState['cat_' + anomalyType + '_' + category]">
                          <div v-for="(items, posId) in posIds" :key="posId">
                            <button
                              @click="treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId] = !treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId]"
                              class="w-full px-3 py-1.5 pl-12 flex items-center justify-between hover:bg-muted/10 transition-colors border-l border-border/30"
                            >
                              <div class="flex items-center gap-2">
                                <ChevronRight
                                  class="h-3 w-3 text-muted-foreground transition-transform duration-200"
                                  :class="{ 'rotate-90': !treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId] }"
                                />
                                <span class="text-[11px] text-muted-foreground">位置ID: {{ posId }}</span>
                              </div>
                            </button>

                            <!-- 叶子节点: 显示 anomaly_score -->
                            <div v-show="!treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId]" class="divide-y divide-border/20">
                              <div
                                v-for="({ item, index: itemIndex }, idx) in items"
                                :key="idx"
                                @dblclick="highlightDetectionBox(itemIndex)"
                                class="px-3 py-1.5 pl-16 flex items-center justify-between hover:bg-muted/10 cursor-pointer group transition-colors border-l border-transparent hover:border-primary/20"
                              >
                                <div class="flex items-center gap-2">
                                  <button
                                    @click.stop="item.visible = !item.visible"
                                    class="flex items-center justify-center transition-colors hover:opacity-70"
                                  >
                                    <Eye v-if="item.visible" class="h-3 w-3 text-muted-foreground" />
                                    <EyeOff v-else class="h-3 w-3 text-muted-foreground/50" />
                                  </button>
                                  <span class="text-[11px] text-muted-foreground">异常得分:</span>
                                </div>
                                <div class="flex items-center gap-2">
                                  <UiButton
                                    variant="ghost"
                                    size="sm"
                                    class="h-5 px-2 text-[10px] font-bold gap-1"
                                    :class="item.isAnomaly ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-green-500 hover:text-green-600 hover:bg-green-50'"
                                    @click.stop="handleToggleAnomalyWithConfirm(itemIndex, !item.isAnomaly)"
                                  >
                                    <span class="w-1.5 h-1.5 rounded-full" :class="item.isAnomaly ? 'bg-red-500' : 'bg-green-500'"></span>
                                    {{ item.isAnomaly ? 'NG' : 'OK' }}
                                  </UiButton>
                                  <span
                                    class="text-[11px] font-mono font-medium"
                                    :class="item.isAnomaly ? 'text-red-500' : 'text-green-500'"
                                  >
                                    {{ (item.score / 100).toFixed(2) }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 分类结果 -->
                <div v-else-if="predictionResults.length > 0" class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                  <div v-if="predictionConfidence !== null" class="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div class="flex items-center gap-2 mb-1">
                      <Sparkles class="h-3.5 w-3.5 text-primary" />
                      <span class="text-[10px] font-bold text-primary uppercase tracking-widest">置信度评分</span>
                    </div>
                    <div class="text-3xl font-black tracking-tighter text-primary">{{ predictionConfidence.toFixed(1) }}<span class="text-lg text-primary/60">%</span></div>
                  </div>

                  <div class="space-y-2">
                    <div v-for="(item, index) in predictionResults.filter(r => r.label !== '工件主体')" :key="item.label" class="p-3 rounded-xl bg-muted/30 border border-muted/50 hover:bg-muted/50 hover:border-muted/70 transition-all">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{{ index + 1 }}</div>
                          <span class="text-xs font-semibold text-foreground">{{ item.label }}</span>
                        </div>
                        <span class="text-xs font-mono font-bold text-primary">{{ item.score.toFixed(1) }}%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>
            
      </aside>
    </div>

    <div v-if="showProductModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg">新增产品</UiCardTitle>
        </UiCardHeader>

        <UiCardContent class="space-y-4">
          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">产品名称</Label>
            <Input
              v-model="newProductName"
              type="text"
              autofocus
              @keyup.enter="confirmAddProduct"
            />
          </div>
          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">绑定相机</Label>
            <Select v-model="newProductCameraId">
              <SelectTrigger class="h-9 text-xs">
                <SelectValue placeholder="选择相机（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">不绑定相机</SelectItem>
                <SelectItem v-for="cam in cameras" :key="cam.id" :value="cam.id">
                  {{ cam.name }} {{ cam.isNetworkCamera ? '(网络)' : '' }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </UiCardContent>

        <UiCardFooter class="gap-2 w-full">
          <UiButton variant="outline" class="flex-1" @click="showProductModal = false">取消</UiButton>
          <UiButton variant="default" class="flex-1" @click="confirmAddProduct" :disabled="!newProductName.trim()">确认新增</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 border-destructive/20">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg text-destructive flex items-center gap-2">
            <Trash2 class="h-5 w-5" />
            确认删除
          </UiCardTitle>
          <UiCardDescription>
            确定要删除 "{{ productToDelete?.name }}" 吗？此操作将永久删除该产品及其所有关联图片和推理服务，无法恢复。
          </UiCardDescription>
        </UiCardHeader>
        <UiCardFooter class="flex justify-end gap-2">
          <UiButton variant="outline" @click="showDeleteModal = false">取消</UiButton>
          <UiButton variant="destructive" @click="confirmDeleteProductAction">确认删除</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <!-- 确认切换 NG/OK 弹窗 -->
    <div v-if="showToggleConfirmModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-primary" />
            确认切换
          </UiCardTitle>
          <UiCardDescription>
            确定要将此检测结果从 {{ toggleConfirmValue ? 'OK' : 'NG' }} 切换为 {{ toggleConfirmValue ? 'NG' : 'OK' }} 吗？
          </UiCardDescription>
        </UiCardHeader>
        <UiCardFooter class="flex justify-end gap-2">
          <UiButton variant="outline" @click="showToggleConfirmModal = false">取消</UiButton>
          <UiButton variant="default" @click="confirmToggleAnomaly">确认切换</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <!-- Camera Type Selection Modal -->
    <div v-if="showCameraTypeModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg flex items-center gap-2">
            <Camera class="h-5 w-5 text-primary" />
            添加相机
          </UiCardTitle>
          <UiCardDescription>
            选择要添加的相机类型
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-3">
          <div
            class="p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50"
            @click="openCameraModal"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Usb class="h-5 w-5 text-primary" />
              </div>
              <div>
                <div class="text-sm font-medium">USB 相机</div>
                <div class="text-xs text-muted-foreground">连接本地 USB 摄像头设备</div>
              </div>
            </div>
          </div>

          <div
            class="p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50"
            @click="openNetworkCameraModal"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wifi class="h-5 w-5 text-primary" />
              </div>
              <div>
                <div class="text-sm font-medium">网络相机</div>
                <div class="text-xs text-muted-foreground">连接网络 IP 相机设备</div>
              </div>
            </div>
          </div>
        </UiCardContent>

        <UiCardFooter class="flex justify-end">
          <UiButton variant="outline" class="flex-1" @click="showCameraTypeModal = false">取消</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <div v-if="showCameraModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg flex items-center gap-2">
            <Camera class="h-5 w-5 text-primary" />
            添加相机
          </UiCardTitle>
          <UiCardDescription>
            从系统检测到的相机列表中选择要添加的相机
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-4">
          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">选择相机</Label>
            <div v-if="isLoadingSystemCameras" class="flex items-center justify-center py-4">
              <Loader2 class="h-5 w-5 animate-spin text-primary" />
              <span class="ml-2 text-xs text-muted-foreground">正在获取系统相机...</span>
            </div>
            <div v-else-if="systemCameras.length === 0" class="text-center py-4 text-xs text-muted-foreground">
              未检测到系统相机
            </div>
            <div v-else class="space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="cam in systemCameras"
                :key="cam.id"
                class="p-3 rounded-lg border cursor-pointer transition-all"
                :class="selectedSystemCamera === cam.id ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50'"
                @click="selectedSystemCamera = cam.id"
              >
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="selectedSystemCamera === cam.id ? 'bg-primary' : 'bg-muted-foreground'"></div>
                  <span class="text-xs font-medium">{{ cam.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">IP 地址（可选）</Label>
            <Input
              v-model="cameraIpInput"
              type="text"
              placeholder="127.0.0.1"
            />
          </div>
        </UiCardContent>

        <UiCardFooter class="gap-2 w-full">
          <UiButton variant="outline" class="flex-1" @click="showCameraModal = false">取消</UiButton>
          <UiButton variant="default" class="flex-1" @click="handleAddCamera" :disabled="!selectedSystemCamera || isLoadingSystemCameras">确认添加</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <!-- Network Camera Modal -->
    <div v-if="showNetworkCameraModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg flex items-center gap-2">
            <Wifi class="h-5 w-5 text-primary" />
            添加网络相机
          </UiCardTitle>
          <UiCardDescription>
            配置网络相机连接参数
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-4">
          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">相机ID</Label>
            <Input
              v-model="networkCameraId"
              type="text"
              placeholder="例如：camera_1"
            />
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">IP 地址</Label>
            <Input
              v-model="networkCameraIp"
              type="text"
              placeholder="192.168.110.10"
            />
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">品牌</Label>
            <select
              v-model="networkCameraVendor"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Basler">Basler</option>
              <option value="Hikrobot">Hikrobot</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">宽度（可选）</Label>
              <Input
                v-model="networkCameraWidth"
                type="number"
                placeholder="自动"
              />
            </div>
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">高度（可选）</Label>
              <Input
                v-model="networkCameraHeight"
                type="number"
                placeholder="自动"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">曝光时间（微秒）</Label>
              <Input
                v-model="networkCameraExposure"
                type="number"
                placeholder="52-10000016"
              />
            </div>
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">增益（0-1957）</Label>
              <Input
                v-model="networkCameraGain"
                type="number"
                placeholder="自动"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">偏移X（像素）</Label>
              <Input
                v-model="networkCameraOffsetX"
                type="number"
                placeholder="偏移X"
              />
            </div>
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">偏移Y（像素）</Label>
              <Input
                v-model="networkCameraOffsetY"
                type="number"
                placeholder="偏移Y"
              />
            </div>
          </div>
        </UiCardContent>

        <UiCardFooter class="gap-2 w-full">
          <UiButton variant="outline" class="flex-1" @click="showNetworkCameraModal = false">取消</UiButton>
          <UiButton variant="default" class="flex-1" @click="handleAddNetworkCamera" :disabled="!networkCameraId.trim()">确认添加</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <!-- Camera Preview Modal -->
    <div v-if="cameraPreviewUrl" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-2xl shadow-2xl">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg flex items-center gap-2">
            <Camera class="h-5 w-5 text-primary" />
            相机实时预览
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <div class="relative bg-black rounded-lg overflow-hidden">
            <img :src="cameraPreviewUrl" class="w-full h-auto max-h-[60vh] object-contain" />
          </div>
        </UiCardContent>
        <UiCardFooter class="gap-2 w-full">
          <UiButton variant="outline" class="flex-1" @click="stopCameraPreview">关闭预览</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <!-- Camera Manager Dialog -->
    <Dialog :open="showCameraManagerDialog" @update:open="(v) => { if (!v && showCameraConfigModal) return; showCameraManagerDialog = v }">
      <DialogContent class="w-[420px] h-[520px] max-h-[80vh] flex flex-col p-0 gap-0">
        <!-- Header -->
        <DialogHeader class="px-5 py-4 border-b shrink-0 relative">
          <DialogTitle class="text-base">相机设置</DialogTitle>
          <DialogDescription class="text-xs">管理相机连接与 Modbus 外设</DialogDescription>
          <UiButton variant="ghost" size="icon" class="h-7 w-7 absolute right-3 top-3 rounded-full hover:bg-muted" @click="showCameraManagerDialog = false">
            <X class="h-4 w-4" />
          </UiButton>
        </DialogHeader>
        <!-- Tab bar -->
        <div class="px-5 py-2 shrink-0 border-b">
          <div class="flex items-center gap-1 bg-muted rounded-md p-0.5 w-fit">
            <button class="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors" :class="dialogTab === 'camera' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'" @click="dialogTab = 'camera'">相机</button>
            <button class="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors" :class="dialogTab === 'modbus' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'" @click="dialogTab = 'modbus'">Modbus</button>
          </div>
        </div>

        <!-- Camera Tab -->
        <div v-show="dialogTab === 'camera'" class="flex-1 overflow-y-auto divide-y divide-gray-100">
          <div
            v-for="cam in cameras"
            :key="cam.id"
            class="px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
            :class="selectedCameraId === cam.id ? 'bg-primary/5' : ''"
          >
            <div :class="['w-2 h-2 rounded-full shrink-0', getCameraStatusDotClass(cam)]"></div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-medium truncate">{{ cam.name }}</span>
                <Wifi v-if="cam.isNetworkCamera" class="h-3 w-3 text-blue-500 shrink-0" />
              </div>
              <div class="text-[11px] text-muted-foreground">{{ cam.ip }}</div>
            </div>
            <UiButton variant="outline" size="sm" class="h-7 text-[10px] px-2 shrink-0" @click="openCameraConfig(cam)">
              <Settings class="h-3 w-3 mr-1" />{{ t('dashboard.configure') }}
            </UiButton>
            <UiButton
              variant="default"
              size="sm"
              class="h-7 text-[10px] px-3 shrink-0"
              @click="selectAndBindCamera(cam)"
            >
              {{ selectedCameraId === cam.id ? '取消选用' : '选用' }}
            </UiButton>
          </div>
          <div v-if="cameras.length === 0" class="px-5 py-12 text-center text-sm text-muted-foreground">
            暂无相机，请先添加
          </div>
          <!-- 新增按钮放在列表下方 -->
          <div class="px-5 py-2">
            <UiButton variant="outline" class="w-full h-8 border-dashed gap-2 text-xs font-bold" @click="openCameraTypeModal">
              <Plus class="h-3.5 w-3.5" />
              {{ t('dashboard.add') }}
            </UiButton>
          </div>
        </div>

        <!-- Modbus Tab -->
        <div v-show="dialogTab === 'modbus'" class="flex-1 overflow-y-auto divide-y divide-gray-100">
          <!-- Modbus 设备列表项 -->
          <div class="px-5 py-3 flex items-center gap-3">
            <div :class="['w-2 h-2 rounded-full shrink-0', modbusStatus?.connected ? 'bg-green-500' : modbusStatus?.enabled ? 'bg-yellow-500' : 'bg-gray-400']"></div>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-medium">Modbus</span>
              <div class="text-[11px] text-muted-foreground">{{ modbusConfigForm.ip }}:{{ modbusConfigForm.port }}</div>
            </div>
            <span class="text-[11px] shrink-0" :class="modbusStatus?.connected ? 'text-green-600' : modbusStatus?.enabled ? 'text-yellow-600' : 'text-muted-foreground'">
              {{ modbusStatus?.enabled ? (modbusStatus?.connected ? '已连接' : '未连接') : '未启用' }}
            </span>
            <UiButton variant="default" size="sm" class="h-7 text-[10px] px-2 shrink-0" @click="modbusConfigForm.enabled = !modbusConfigForm.enabled">
              {{ modbusConfigForm.enabled ? '已启用' : '已禁用' }}
            </UiButton>
            <UiButton variant="outline" size="sm" class="h-7 text-[10px] px-2 shrink-0" @click="dialogTab = 'modbus'; showModbusDetail = !showModbusDetail">
              <Settings class="h-3 w-3 mr-1" />配置
            </UiButton>
          </div>
          <!-- Modbus 配置详情（展开） -->
          <div v-if="showModbusDetail" class="px-5 py-4 space-y-3 bg-muted/20">
            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-0.5">
                <Label class="text-[10px] text-muted-foreground">IP 地址</Label>
                <Input v-model="modbusConfigForm.ip" class="h-7 text-[11px] font-mono" />
              </div>
              <div class="space-y-0.5">
                <Label class="text-[10px] text-muted-foreground">端口</Label>
                <Input v-model.number="modbusConfigForm.port" type="number" class="h-7 text-[11px] font-mono" />
              </div>
              <div class="space-y-0.5">
                <Label class="text-[10px] text-muted-foreground">从站 ID</Label>
                <Input v-model.number="modbusConfigForm.unitId" type="number" class="h-7 text-[11px] font-mono" />
              </div>
              <div class="space-y-0.5">
                <Label class="text-[10px] text-muted-foreground">拍照 DI</Label>
                <Input v-model.number="modbusConfigForm.buttonChannel" type="number" class="h-7 text-[11px] font-mono" />
              </div>
              <div class="space-y-0.5">
                <Label class="text-[10px] text-muted-foreground">复位 DI</Label>
                <Input v-model.number="modbusConfigForm.resetChannel" type="number" class="h-7 text-[11px] font-mono" />
              </div>
            </div>
            <div class="grid grid-cols-4 gap-2 pt-1 border-t">
              <div class="space-y-0.5">
                <Label class="text-[10px] text-muted-foreground"><span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>绿灯</Label>
                <Input v-model.number="modbusConfigForm.lightGreen" type="number" class="h-7 text-[11px] font-mono" />
              </div>
              <div class="space-y-0.5">
                <Label class="text-[10px] text-muted-foreground"><span class="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>黄灯</Label>
                <Input v-model.number="modbusConfigForm.lightYellow" type="number" class="h-7 text-[11px] font-mono" />
              </div>
              <div class="space-y-0.5">
                <Label class="text-[10px] text-muted-foreground"><span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>红灯</Label>
                <Input v-model.number="modbusConfigForm.lightRed" type="number" class="h-7 text-[11px] font-mono" />
              </div>
              <div class="space-y-0.5">
                <Label class="text-[10px] text-muted-foreground"><span class="inline-block w-2 h-2 bg-amber-700 rounded-full mr-1"></span>蜂鸣器</Label>
                <Input v-model.number="modbusConfigForm.buzzer" type="number" class="h-7 text-[11px] font-mono" />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <DialogFooter class="px-5 py-3 border-t shrink-0 flex-row justify-end">
          <UiButton class="h-8 text-xs px-6" :disabled="isSavingModbus" @click="handleConfirmDialog">
            <Loader2 v-if="isSavingModbus" class="h-3 w-3 mr-1 animate-spin" />
            确定
          </UiButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Camera Config Modal -->
    <div v-if="showCameraConfigModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="showCameraConfigModal = false">
      <UiCard class="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg flex items-center gap-2">
            <Settings class="h-5 w-5 text-primary" />
            相机配置
          </UiCardTitle>
          <UiCardDescription>
            {{ editingCamera?.name }}
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-4">
          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">IP 地址</Label>
            <Input
              v-model="editingCameraConfig.ip"
              type="text"
              placeholder="127.0.0.1"
            />
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">品牌</Label>
            <select
              v-model="editingCameraConfig.vendor"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Basler">Basler</option>
              <option value="Hikrobot">Hikrobot</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">宽度</Label>
              <Input
                v-model.number="editingCameraConfig.width"
                type="number"
                placeholder="自动"
              />
            </div>
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">高度</Label>
              <Input
                v-model.number="editingCameraConfig.height"
                type="number"
                placeholder="自动"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                曝光等级
                <span class="text-[9px] text-muted-foreground font-normal normal-case ml-1">
                  {{ editingCameraConfig.exposureTime ? `≈ ${Math.round(editingCameraConfig.exposureTime * 52 / 1000)}ms` : '' }}
                </span>
              </Label>
              <Input
                v-model.number="editingCameraConfig.exposureTime"
                type="number"
                min="1"
                max="200"
                placeholder="1-200"
              />
              <div class="text-[9px] text-muted-foreground">实际曝光 = 值 × 52μs</div>
            </div>
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">增益 (0-1957)</Label>
              <Input
                v-model.number="editingCameraConfig.gain"
                type="number"
                min="0"
                max="1957"
                placeholder="0-1957"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">偏移X</Label>
              <Input
                v-model.number="editingCameraConfig.offsetX"
                type="number"
                placeholder="像素"
              />
            </div>
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">偏移Y</Label>
              <Input
                v-model.number="editingCameraConfig.offsetY"
                type="number"
                placeholder="像素"
              />
            </div>
          </div>
        </UiCardContent>

        <UiCardFooter class="gap-2 w-full">
          <UiButton variant="outline" class="flex-1" @click="showCameraConfigModal = false">取消</UiButton>
          <UiButton variant="default" class="flex-1" @click="saveCameraConfig">保存配置</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <input ref="importFileInput" type="file" accept="image/*" class="hidden" @change="handleImportFileChange" />

    <div v-if="showInferenceModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg flex items-center gap-2">
            <Wand2 class="h-5 w-5 text-primary" />
            {{ t('dashboard.inferenceTitle') }}
          </UiCardTitle>
          <UiCardDescription>
            {{ t('dashboard.inferenceDesc') }}
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-4">
          <!-- Image Upload Section -->
          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{{ t('dashboard.uploadImage') }}</Label>
            <div 
              class="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all"
              :class="inferenceImageUrl ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'"
              @click="triggerInferenceFileInput"
            >
              <div v-if="inferenceImageUrl" class="space-y-2">
                <img :src="inferenceImageUrl" class="max-h-32 mx-auto rounded" />
                <p class="text-[10px] text-muted-foreground">{{ t('dashboard.selectedImage') }}</p>
              </div>
              <div v-else class="py-4">
                <Upload class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p class="text-xs text-muted-foreground">{{ t('dashboard.dragOrClick') }}</p>
              </div>
            </div>
          </div>

          <!-- Service Selection -->
          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{{ t('dashboard.selectService') }}</Label>
            <div class="grid grid-cols-1 gap-2 max-h-32 overflow-auto">
              <div
                v-for="service in inferenceServices"
                :key="service.service_id"
                class="p-2 rounded-lg border cursor-pointer transition-all text-xs"
                :class="selectedInferenceService === service.service_id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'"
                @click="selectedInferenceService = service.service_id"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold">{{ t('dashboard.serviceId') }} #{{ service.service_id.slice(-6) }}</span>
                  <span class="text-muted-foreground">{{ t('dashboard.port') }}: {{ service.port }}</span>
                </div>
              </div>
            </div>
          </div>
        </UiCardContent>

        <UiCardFooter class="gap-2 w-full">
          <UiButton variant="outline" class="flex-1" @click="showInferenceModal = false" :disabled="isInferring">{{ t('dashboard.cancel') }}</UiButton>
          <UiButton variant="default" class="flex-1" @click="runInference" :disabled="isInferring">
            <Loader2 v-if="isInferring" class="h-4 w-4 mr-2 animate-spin" />
            {{ isInferring ? t('dashboard.inferring') : t('dashboard.inference') }}
          </UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <input ref="inferenceFileInput" type="file" accept="image/*" class="hidden" @change="handleInferenceFileChange" />

    <!-- 工作流执行进度浮层 -->
    <WorkflowExecutionProgress
      :is-executing="workflowExecutor.isExecuting.value"
      :current-step-index="workflowExecutor.currentStepIndex.value"
      :step-statuses="workflowExecutor.stepStatuses"
      :total-steps="activeWorkflowSteps.length"
      @cancel="abortWorkflow"
    />
  </div>
</template>

<style scoped>
/* Hide number input arrows */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.overflow-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 10px;
}
.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.3);
}
</style>
