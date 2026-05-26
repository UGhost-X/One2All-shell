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
  RotateCcw,
  RotateCw,
  RefreshCcw,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Minimize2,
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
  AlertTriangle
} from 'lucide-vue-next'
import { computed, ref, onBeforeUnmount, onMounted, onActivated, watch, nextTick, inject } from 'vue'
import { useRouter } from 'vue-router'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import Slider from '@/components/ui/slider/Slider.vue'
import Tabs from '@/components/ui/tabs/Tabs.vue'
import TabsContent from '@/components/ui/tabs/TabsContent.vue'
import TabsList from '@/components/ui/tabs/TabsList.vue'
import TabsTrigger from '@/components/ui/tabs/TabsTrigger.vue'
import Progress from '@/components/ui/progress/Progress.vue'
import UiCard from '@/components/ui/card/Card.vue'
import UiCardHeader from '@/components/ui/card/CardHeader.vue'
import UiCardTitle from '@/components/ui/card/CardTitle.vue'
import UiCardDescription from '@/components/ui/card/CardDescription.vue'
import UiCardContent from '@/components/ui/card/CardContent.vue'
import UiCardFooter from '@/components/ui/card/CardFooter.vue'

definePageMeta({ name: 'HomePage' })

const { t } = useI18n()
const router = useRouter()
const globalToast = inject<any>('toast')

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

const activeTab = ref<'image' | 'camera'>('image')
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
  if (!selectedProductId.value) {
    showToast('请先选择一个产品', 'error')
    return { success: false, error: '请先在界面中选择一个产品' }
  }
  if (!selectedCameraId.value) {
    showToast('请先在相机设置中选择一个相机', 'error')
    return { success: false, error: '请先在界面中选择一个相机' }
  }

  const targetCamera = cameras.value.find(c => c.id === selectedCameraId.value)
  if (!targetCamera) {
    showToast('请先在相机设置中选择一个相机', 'error')
    return { success: false, error: '未找到所选相机' }
  }
  if (targetCamera.isEnabled === false) {
    showToast('当前相机已禁用，请先启用相机', 'error')
    return { success: false, error: '当前相机已禁用' }
  }
  if (targetCamera.isNetworkCamera && targetCamera.status !== 'online') {
    showToast('网络相机未连接，请先连接相机', 'error')
    return { success: false, error: '网络相机未连接' }
  }

  try {
    const ok = await takeCapture()
    // 防御：等待推理（含 autoSaveRoiImages）彻底完成再返回
    // takeCapture 内部已 await runCaptureInference，此处轮询 isInferring 作为兜底
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
  }
  window.__externalCapture = externalCapture
  document.addEventListener('fullscreenchange', syncFullscreenState)
})

onActivated(async () => {
  // 页面重新激活时，重新加载后端URL，然后获取推理服务和标注数据
  await loadCameraServiceUrl()
  await fetchInferenceServices()
  await fetchProductAnnotations()
})

const openProductModal = () => {
  newProductName.value = ''
  newProductModel.value = ''
  showProductModal.value = true
}

const confirmAddProduct = async () => {
  const name = newProductName.value.trim()
  if (!name) return

  const newProduct = {
    name,
    model: newProductModel.value.trim() || `M-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
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
        const paramResult = await window.electronAPI.updateCameraParameters(cameraId, {
          exposureTime: Math.round(actualExposure),
          gain: Math.round(gainValue.value),
          offsetX: Math.round(offsetXValue.value),
          offsetY: Math.round(offsetYValue.value)
        })
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
  restoreSelectedCamera()
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

  if (!selectedCameraId.value) {
    showToast('请先在相机设置中选择一个相机', 'error')
    return
  }

  const targetCamera = cameras.value.find(c => c.id === selectedCameraId.value)
  if (!targetCamera) {
    showToast('请先在相机设置中选择一个相机', 'error')
    return
  }

  if (targetCamera.isEnabled === false) {
    showToast('当前相机已禁用，请先启用相机', 'error')
    return
  }

  if (targetCamera.isNetworkCamera) {
    if (targetCamera.status !== 'online') {
      showToast('网络相机未连接，请先连接相机', 'error')
      return
    }
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

const selectedCameraId = ref<number | null>(null)

const saveSelectedCamera = () => {
  if (selectedCameraId.value) {
    localStorage.setItem('selectedCameraId', String(selectedCameraId.value))
  }
}

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
  if (savedCameraId) {
    const id = parseInt(savedCameraId, 10)
    const camera = cameras.value.find(c => c.id === id)
    if (camera) {
      selectedCameraId.value = id
      loadCameraSettingsToForm(camera)
    }
  }
}

const takeCapture = async (): Promise<boolean> => {
  if (!selectedProductId.value) {
    alert('请先选择一个产品')
    return false
  }

  if (!selectedCameraId.value) {
    showToast('请先在相机设置中选择一个相机', 'error')
    return false
  }

  const targetCamera = cameras.value.find(c => c.id === selectedCameraId.value)
  if (!targetCamera) {
    showToast('请先在相机设置中选择一个相机', 'error')
    return false
  }

  if (targetCamera.isEnabled === false) {
    showToast('当前相机已禁用，请先启用相机', 'error')
    return false
  }

  if (targetCamera.isNetworkCamera) {
    if (targetCamera.status !== 'online') {
      showToast('网络相机未连接，请先连接相机', 'error')
      return false
    }
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

const exposureSliderValue = computed({
  get: () => [exposureValue.value],
  set: (v: number[]) => {
    const next = Number(v?.[0] ?? 0)
    exposureValue.value = Math.max(1, Math.min(100, Math.round(next)))
  },
})

const gainSliderValue = computed({
  get: () => [gainValue.value],
  set: (v: number[]) => {
    const next = Number(v?.[0] ?? 0)
    gainValue.value = Math.round(Math.max(0, Math.min(1957, next)))
  },
})

const offsetXSliderValue = computed({
  get: () => [offsetXValue.value],
  set: (v: number[]) => {
    const next = Number(v?.[0] ?? 0)
    offsetXValue.value = Math.round(next / 4) * 4
  },
})

const offsetYSliderValue = computed({
  get: () => [offsetYValue.value],
  set: (v: number[]) => {
    const next = Number(v?.[0] ?? 0)
    offsetYValue.value = Math.round(next / 2) * 2
  },
})

const handleGainInput = (value: string | number) => {
  const val = typeof value === 'number' ? value : parseFloat(String(value))
  if (!isNaN(val)) {
    gainValue.value = Math.round(Math.max(0, Math.min(1957, val)))
  }
}

// Prediction Actions
const showDetectionLabels = ref(true)
const showDetectionBoxes = ref(true)
const normalGroupCollapsed = ref(false)
const anomalyGroupCollapsed = ref(false)

// 树形结构折叠状态
const treeCollapsedState = ref<Record<string, boolean>>({})

// 按 anomaly_type -> category -> pos_id 层级分组的计算属性
const groupedDetectionResults = computed(() => {
  const groups: Record<string, Record<string, Record<string, Array<{ item: typeof detectionResults.value[0]; index: number }>>>> = {}

  detectionResults.value.forEach((item, index) => {
    const rawType = item.anomaly_type || '未知类型'
    const type = rawType === 'normal' ? 'OK' : 'NG'
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
          roiType
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

  let targetCamera = enabledCameras.find(c => c.id === selectedCameraId.value)
  if (!targetCamera) {
    targetCamera = enabledCameras[0]
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

    <div class="flex-1 grid grid-cols-3 overflow-hidden w-full min-w-0">
      <main class="col-span-2 bg-muted/20 relative  flex flex-col h-full">
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

              <Separator orientation="vertical" class="h-6 mx-1" />

              <UiButton
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                title="保存ROI"
                :disabled="detectionResults.length === 0 || !selectedProductId"
                @click="handleSaveRoiImages"
              >
                <Download class="h-4 w-4" />
              </UiButton>
            </div>
          </div>

          <!-- Canvas Area -->
          <div class="flex-1 p-6 min-h-0 border-r">
            <div
              ref="viewerViewportRef"
              class="relative w-full h-full rounded-lg bg-background/40 overflow-hidden shadow-2xl select-none touch-none"
              :class="viewerIsPanning ? 'cursor-grabbing' : 'cursor-grab'"
              @pointerdown="onViewerPointerDown"
              @pointermove="onViewerPointerMove"
              @pointerup="onViewerPointerUp"
              @pointercancel="onViewerPointerUp"
              @wheel.prevent="onViewerWheel"
            >
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

      <aside class="col-span-1 bg-card flex flex-col h-full overflow-hidden">
        <Tabs v-model="activeTab" class="flex flex-col h-full">
          <!-- Tabs Header -->
          <div class="border-b bg-muted/30 shrink-0">
            <TabsList class="w-full h-10 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="image"
                class="flex-1 h-10 gap-2 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-muted-foreground hover:bg-muted/50 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background rounded-none px-0 py-0 shadow-none data-[state=active]:shadow-none"
              >
                <ImageIcon class="h-3.5 w-3.5" />
                {{ t('dashboard.imageSettings') }}
              </TabsTrigger>
              <TabsTrigger
                value="camera"
                class="flex-1 h-10 gap-2 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-muted-foreground hover:bg-muted/50 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background rounded-none px-0 py-0 shadow-none data-[state=active]:shadow-none"
              >
                <Camera class="h-3.5 w-3.5" />
                {{ t('dashboard.cameraSettings') }}
              </TabsTrigger>
            </TabsList>
          </div>

          <!-- Dynamic Settings Area -->
          <section class="flex-[2] border-b flex flex-col min-h-0 overflow-hidden">
              <TabsContent value="image" class="flex-1 overflow-auto p-4 space-y-5">
              <!-- Exposure & Gain -->
              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider items-center">
                    <span>{{ t('dashboard.exposure') }}</span>
                    <div class="flex items-center gap-0.5 text-primary">
                      <Input
                        type="number"
                        v-model.number="exposureValue"
                        min="1"
                        max="2000"
                        class="h-7 w-20 px-2 py-1 text-xs text-right font-mono"
                      />
                    </div>
                  </div>
                  <Slider v-model="exposureSliderValue" :max="100" :min="1" :step="1" />
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider items-center">
                    <span>{{ t('dashboard.gain') }}</span>
                    <div class="flex items-center gap-0.5 text-primary">
                      <Input
                        type="number"
                        v-model.number="gainValue"
                        step="10"
                        min="0"
                        max="1957"
                        class="h-7 w-16 px-2 py-1 text-xs text-right font-mono"
                      />
                    </div>
                  </div>
                  <Slider v-model="gainSliderValue" :max="1957" :step="1" />
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider items-center">
                    <span>偏移X</span>
                    <div class="flex items-center gap-0.5 text-primary">
                      <Input
                        type="number"
                        v-model.number="offsetXValue"
                        step="4"
                        min="-1000"
                        max="1000"
                        class="h-7 w-20 px-2 py-1 text-xs text-right font-mono"
                      />
                      <span class="font-mono lowercase">px</span>
                    </div>
                  </div>
                  <Slider v-model="offsetXSliderValue" :max="1000" :min="-1000" :step="4" />
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider items-center">
                    <span>偏移Y</span>
                    <div class="flex items-center gap-0.5 text-primary">
                      <Input
                        type="number"
                        v-model.number="offsetYValue"
                        step="2"
                        min="-1000"
                        max="1000"
                        class="h-7 w-20 px-2 py-1 text-xs text-right font-mono"
                      />
                      <span class="font-mono lowercase">px</span>
                    </div>
                  </div>
                  <Slider v-model="offsetYSliderValue" :max="1000" :min="-1000" :step="2" />
                </div>
              </div>

              <!-- Image Actions Grid -->
              <div class="grid grid-cols-2 gap-2 pt-2">
                <UiButton 
                  variant="outline" 
                  size="sm" 
                  class="h-14 flex flex-col gap-1 text-[10px] font-bold"
                  :class="{ 'bg-primary/10 border-primary text-primary': mainViewState === 'live' }"
                  @click="startLive"
                >
                  <Video class="h-4 w-4" :class="mainViewState === 'live' ? 'text-primary' : 'text-primary'" />
                  {{ t('dashboard.live') }}
                </UiButton>
                <UiButton
                  variant="outline"
                  size="sm"
                  class="h-14 flex flex-col gap-1 text-[10px] font-bold"
                  :disabled="isInferring || !selectedProductId"
                  @click="takeCapture"
                >
                  <Loader2 v-if="isInferring && selectedProductHasImage && selectedProductHasAnnotation" class="h-4 w-4 animate-spin text-primary" />
                  <CameraIcon v-else class="h-4 w-4 text-primary" />
                  {{ selectedProductHasImage && selectedProductHasAnnotation ? (isInferring ? '识别中...' : '拍照识别') : '添加产品图' }}
                </UiButton>

                <UiButton variant="outline" size="sm" class="h-14 flex flex-col gap-1 text-[10px] font-bold" @click="startInference">
                  <Wand2 class="h-4 w-4" />
                  选择图片推理
                </UiButton>
              </div>
            </TabsContent>

            <TabsContent value="camera" class="flex-1 overflow-auto p-4 space-y-4">
              <!-- Camera List -->
              <div v-for="cam in cameras" :key="cam.id"
                class="p-3 rounded-lg border space-y-3 relative group cursor-pointer transition-all"
                :class="selectedCameraId === cam.id ? 'border-primary bg-primary/10' : 'bg-muted/10 hover:border-primary/50'"
                @click="selectedCameraId = cam.id; saveSelectedCamera(); loadCameraSettingsToForm(cam)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div :class="['w-2 h-2 rounded-full', cam.status === 'online' || cam.isEnabled !== false ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500']"></div>
                    <span class="text-xs font-bold">{{ cam.name }}</span>
                    <Wifi v-if="cam.isNetworkCamera" class="h-3 w-3 text-blue-500" />
                    <div v-if="selectedCameraId === cam.id" class="px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] rounded">当前</div>
                  </div>
                  <div class="flex items-center gap-1">
                    <UiButton v-if="cam.isNetworkCamera" variant="ghost" size="icon" class="h-6 w-6" @click.stop="cam.status === 'online' ? handleDisconnectCamera(cam) : handleConnectCamera(cam)">
                      <component :is="cam.status === 'online' ? Unplug : Plug" :class="['h-3 w-3', cam.status === 'online' ? 'text-green-600' : 'text-muted-foreground']" />
                    </UiButton>
                    <UiButton v-if="cam.isNetworkCamera && cam.status === 'online'" variant="ghost" size="icon" class="h-6 w-6" @click.stop="handleCaptureFromCamera(cam)">
                      <Aperture class="h-3 w-3 text-primary" />
                    </UiButton>
                    <UiButton v-if="cam.isNetworkCamera && cam.status === 'online'" variant="ghost" size="icon" class="h-6 w-6" @click.stop="startCameraPreview(cam)">
                      <Video class="h-3 w-3 text-blue-500" />
                    </UiButton>
                    <UiButton variant="ghost" size="icon" class="h-6 w-6" @click.stop="openCameraConfig(cam)" title="配置">
                      <Settings class="h-3 w-3 text-muted-foreground" />
                    </UiButton>
                    <UiButton variant="ghost" size="icon" class="h-6 w-6" @click.stop="toggleCameraEnabled(cam)">
                      <component :is="cam.isEnabled !== false ? Power : PowerOff" :class="['h-3 w-3', cam.isEnabled !== false ? 'text-green-600' : 'text-red-500']" />
                    </UiButton>
                    <UiButton variant="ghost" size="icon" class="h-6 w-6 text-destructive hover:bg-destructive/10" @click.stop="handleRemoveCamera(cam)">
                      <Trash2 class="h-3 w-3" />
                    </UiButton>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-y-2 text-[10px]">
                  <div class="text-muted-foreground uppercase font-bold tracking-tight">状态</div>
                  <div class="text-right font-mono" :class="cam.status === 'online' || cam.isEnabled !== false ? 'text-green-600' : 'text-red-500'">{{ cam.status === 'online' ? '已连接' : (cam.isEnabled !== false ? '已启用' : '已禁用') }}</div>
                  <div class="text-muted-foreground uppercase font-bold tracking-tight">IP</div>
                  <div class="text-right font-mono">{{ cam.ip }}</div>
                  <div v-if="cam.resolution" class="text-muted-foreground uppercase font-bold tracking-tight">分辨率</div>
                  <div v-if="cam.resolution" class="text-right font-mono">{{ cam.resolution }}</div>
                </div>
              </div>

              <UiButton variant="outline" class="w-full h-10 border-dashed gap-2 text-xs font-bold" @click="openCameraTypeModal">
                <Plus class="h-3.5 w-3.5" />
                {{ t('dashboard.add') }}
              </UiButton>
            </TabsContent>
          </section>

          <!-- Product List -->
          <section class="flex-1 border-b flex flex-col min-h-0">
            <div class="h-10 px-4 flex items-center justify-between bg-muted/30 border-b shrink-0">
              <div class="flex items-center gap-2">
                <List class="h-4 w-4 text-primary" />
                <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">{{ t('dashboard.productList') }}</span>
              </div>
              <UiButton variant="ghost" size="icon" class="h-6 w-6 text-primary hover:bg-primary/10" @click="openProductModal">
                <Plus class="h-3.5 w-3.5" />
              </UiButton>
            </div>
            <div class="flex-1 overflow-y-auto p-2">
              <div class="space-y-1">
                <div
                  v-for="product in products"
                  :key="product.id"
                  class="group p-2 text-xs rounded cursor-pointer flex items-center gap-3 transition-all border border-transparent"
                  :class="selectedProductId === product.id ? 'bg-primary/10 border-primary/20 shadow-sm' : 'hover:bg-muted'"
                  @click="handleSelectProduct(product.id)"
                  @dblclick="handleProductDoubleClick(product)"
                >
                  <div
                    class="w-8 h-8 rounded shrink-0 flex items-center justify-center transition-colors"
                    :class="selectedProductId === product.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/40'"
                  >
                    <Package class="h-4 w-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold truncate" :class="{ 'text-primary': selectedProductId === product.id }">{{ product.name }}</div>
                  </div>
                  <div class="flex items-center gap-1">
                    <div v-if="selectedProductId === product.id" class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse mr-1"></div>
                    <UiButton 
                      variant="ghost" 
                      size="icon" 
                      class="h-6 w-6 text-primary hover:bg-primary/10"
                      @click.stop="viewProductImage(product)"
                      :title="'查看图片'"
                    >
                      <Eye class="h-3 w-3" />
                    </UiButton>
                    <UiButton 
                      variant="ghost" 
                      size="icon" 
                      class="h-6 w-6 text-primary hover:bg-primary/10"
                      @click.stop="handleEditProduct(product)"
                    >
                      <Pencil class="h-3 w-3" />
                    </UiButton>
                    <UiButton 
                      variant="ghost" 
                      size="icon" 
                      class="h-6 w-6 text-destructive hover:bg-destructive/10"
                      @click.stop="openDeleteModal(product)"
                    >
                      <Trash2 class="h-3 w-3" />
                    </UiButton>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Prediction Results -->
          <section class="flex-[1.5] flex flex-col min-h-0 overflow-hidden">
            <div class="h-10 px-4 flex items-center justify-between bg-muted/30 border-b shrink-0">
              <div class="flex items-center gap-2">
                <BarChart3 class="h-4 w-4 text-primary" />
                <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">{{ t('dashboard.predictionResults') }}</span>
              </div>
              <div class="flex items-center gap-1">
                <UiButton variant="ghost" size="sm" class="h-6 px-2 text-[10px] font-bold gap-1 transition-colors" :class="showDetectionBoxes ? 'text-primary' : 'text-muted-foreground'" @click="showDetectionBoxes = !showDetectionBoxes" :title="showDetectionBoxes ? '隐藏标注框' : '显示标注框'">
                  <component :is="showDetectionBoxes ? Square : Square" class="h-3 w-3" />
                </UiButton>
                <UiButton variant="ghost" size="sm" class="h-6 px-2 text-[10px] font-bold gap-1 transition-colors" :class="showDetectionLabels ? 'text-primary' : 'text-muted-foreground'" @click="showDetectionLabels = !showDetectionLabels" :title="showDetectionLabels ? '隐藏标签' : '显示标签'">
                  <component :is="showDetectionLabels ? Eye : EyeOff" class="h-3 w-3" />
                </UiButton>
                <UiButton variant="ghost" size="sm" class="h-6 px-2 text-[10px] font-bold gap-1 text-muted-foreground hover:text-destructive transition-colors" @click="clearResults">
                  <RotateCcw class="h-3 w-3" />
                  {{ t('dashboard.clear') }}
                </UiButton>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-3 min-h-0">
              <!-- 目标检测结果 - 树形展示 -->
              <div v-if="detectionResults.length > 0" class="space-y-2">
                <!-- 遍历 anomaly_type -->
                <div v-for="(categories, anomalyType) in groupedDetectionResults" :key="anomalyType" class="border border-border rounded-lg overflow-hidden">
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
                  <div v-show="!treeCollapsedState['type_' + anomalyType]" class="border-t border-border">
                    <div v-for="(posIds, category) in categories" :key="category" class="border-b border-border/50 last:border-b-0">
                      <button
                        @click="treeCollapsedState['cat_' + anomalyType + '_' + category] = !treeCollapsedState['cat_' + anomalyType + '_' + category]"
                        class="w-full px-3 py-2 pl-8 flex items-center justify-between hover:bg-muted/30 transition-colors"
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
                      <div v-show="!treeCollapsedState['cat_' + anomalyType + '_' + category]" class="border-t border-border/30">
                        <div v-for="(items, posId) in posIds" :key="posId" class="border-b border-border/30 last:border-b-0">
                          <button
                            @click="treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId] = !treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId]"
                            class="w-full px-3 py-1.5 pl-12 flex items-center justify-between hover:bg-muted/20 transition-colors"
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
                          <div v-show="!treeCollapsedState['pos_' + anomalyType + '_' + category + '_' + posId]" class="border-t border-border/20">
                            <div
                              v-for="({ item, index: itemIndex }, idx) in items"
                              :key="idx"
                              @dblclick="highlightDetectionBox(itemIndex)"
                              class="px-3 py-1.5 pl-16 flex items-center justify-between hover:bg-muted/10 cursor-pointer group"
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
              <div v-else-if="predictionResults.length > 0" class="space-y-4">
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

              <div v-else class="h-full flex flex-col items-center justify-center text-muted-foreground/40 space-y-3 py-12">
                <div class="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <BarChart3 class="h-8 w-8" />
                </div>
                <p class="text-xs font-bold uppercase tracking-wider">暂无预测数据</p>
              </div>
            </div>
          </section>
        </Tabs>
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

    <!-- Camera Config Modal -->
    <div v-if="showCameraConfigModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
