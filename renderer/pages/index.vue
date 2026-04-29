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
  Usb
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

const handleCaptureFromCamera = async (camera: any) => {
  if (!camera.isNetworkCamera) {
    showToast('请使用主界面的拍照功能拍摄USB相机', 'info')
    return
  }
  if (!window.electronAPI?.captureFromCamera) return
  if (!selectedProductId.value) {
    showToast('请先选择一个产品', 'error')
    return
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
        if (paramResult.statusCode === 404) {
          needReconnect = true
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }
        }
      }

      const result = await window.electronAPI.captureFromCamera(cameraId)

      if (result.statusCode === 404) {
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
          return
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
}

const cameraServiceUrl = ref('')

const loadCameraServiceUrl = async () => {
  if (window.electronAPI?.getSettings) {
    try {
      const settings = await window.electronAPI.getSettings()
      console.log('Loaded settings:', settings)
      if (settings?.backendUrl) {
        cameraServiceUrl.value = settings.backendUrl
        console.log('Updated cameraServiceUrl to:', cameraServiceUrl.value)
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
  console.log('getBackendUrl called, base:', base, 'path:', path)
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
    showToast('相机配置已保存', 'info')
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

const updateCameraSettings = async () => {
  const targetCamera = liveNetworkCamera.value || cameras.value.find(c => c.id === selectedCameraId.value)
  if (targetCamera && targetCamera.isNetworkCamera) {
    if (window.electronAPI?.updateCameraParameters) {
      const cameraId = targetCamera.name
      const actualExposure = exposureValue.value * 52
      const maxRetries = 3
      let needReconnect = false

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (needReconnect && window.electronAPI?.connectCamera) {
            const config = targetCamera.config ? JSON.parse(targetCamera.config) : {}
            const connectResult = await window.electronAPI.connectCamera(cameraId, {
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

          if (response.statusCode === 404) {
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

const takeCapture = async () => {
  if (!selectedProductId.value) {
    alert('请先选择一个产品')
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
    await handleCaptureFromCamera(targetCamera)
    return
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
  } catch (err) {
    console.error('Failed to capture from camera:', err)
    showToast('拍照失败：无法访问相机', 'error')
  }
}

const runCaptureInference = async (dataUrl: string) => {
  await fetchInferenceServices()

  if (inferenceServices.value.length === 0) {
    showToast('当前没有可用的推理服务，请先在部署页面启动服务', 'error')
    return
  }

  isInferring.value = true
  inferenceAbortController = new AbortController()

  try {
    const blob = await fetch(dataUrl).then(r => r.blob())
    const formData = new FormData()
    formData.append('service_id', inferenceServices.value[0]?.service_id || '')
    formData.append('file', blob, 'capture.jpg')

    const selectedService = inferenceServices.value.find(s => s.service_id === inferenceServices.value[0]?.service_id)
    const inferenceUrl = await getInferenceUrl(selectedService?.inference_url)
    const res = await fetch(`${inferenceUrl}/predict`, {
      method: 'POST',
      body: formData,
      signal: inferenceAbortController.signal
    })

    const data = await res.json()
    const result = data.status === 'success' && data.result ? data.result : data
    let allResults: any[] = []

    if (result.workpiece_results && Array.isArray(result.workpiece_results)) {
      allResults = result.workpiece_results.flatMap((wp: any) => wp.results || [])
    } else if (result.workpieces && Array.isArray(result.workpieces)) {
      allResults = result.workpieces.flatMap((wp: any) => wp.results || [])
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
  const groups: Record<string, Record<string, Record<string, typeof detectionResults.value[0][]>>> = {}

  detectionResults.value.forEach((item) => {
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
    groups[type][cat][pos].push(item)
  })

  return groups
})

// 高亮检测框状态
const highlightedIndex = ref<number | null>(null)
let highlightTimer: NodeJS.Timeout | null = null
let breatheAnimationId: number | null = null

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
  if (highlightTimer) {
    clearTimeout(highlightTimer)
    highlightTimer = null
  }
  if (breatheAnimationId) {
    cancelAnimationFrame(breatheAnimationId)
    breatheAnimationId = null
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

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      points.forEach(p => {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      })

      const width = maxX - minX
      const height = maxY - minY

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.beginPath()
      ctx.moveTo(points[0].x - minX, points[0].y - minY)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x - minX, points[i].y - minY)
      }
      ctx.closePath()
      ctx.clip()

      ctx.drawImage(img, minX, minY, width, height, 0, 0, width, height)

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      }, 'image/jpeg', 0.95)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageUrl
  })
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
  document.removeEventListener('fullscreenchange', syncFullscreenState)
  viewerResizeObserver?.disconnect()
  viewerResizeObserver = null
  if (inferenceAbortController) {
    inferenceAbortController.abort()
    inferenceAbortController = null
  }
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

        <div v-else-if="mainViewState === 'image'" class="flex-1 min-w-0 min-h-0 relative bg-black/5 overflow-hidden">
          <div class="absolute inset-0 p-6">
            <div
              ref="viewerViewportRef"
              class="relative w-full h-full rounded-lg bg-background/40 overflow-hidden shadow-2xl select-none touch-none"
              :class="viewerIsPanning ? 'cursor-grabbing' : 'cursor-grab'"
              @pointerdown="onViewerPointerDown"
              @pointermove="onViewerPointerMove"
              @pointerup="onViewerPointerUp"
              @pointercancel="onViewerPointerUp"
              @wheel.prevent="onViewerWheel"
            >              <div class="absolute left-1/2 top-1/2 will-change-transform" :style="viewerTransformStyle">
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
                  class="absolute top-0 left-0 pointer-events-none"
                  :style="viewerImageStyle"
                />
              </div>

              <!-- Floating Toolbar Container -->
              <div 
                class="absolute top-0 left-0 right-0 h-20 z-30 flex justify-center items-start pt-3 pointer-events-none"
                @mouseenter="handleToolbarHover(true)"
                @mouseleave="handleToolbarHover(false)"
              >
                <Transition
                  enter-active-class="transition duration-300 ease-out"
                  enter-from-class="transform -translate-y-full opacity-0"
                  enter-to-class="transform translate-y-0 opacity-100"
                  leave-active-class="transition duration-200 ease-in"
                  leave-from-class="transform translate-y-0 opacity-100"
                  leave-to-class="transform -translate-y-full opacity-0"
                >
                  <div
                    v-if="isToolbarFixed || isToolbarHovered"
                    class="flex items-center gap-1 bg-background/90 backdrop-blur-md border rounded-xl p-1.5 shadow-2xl pointer-events-auto ring-1 ring-black/5"
                    @pointerdown.stop
                    @wheel.stop
                  >
                    <div class="flex items-center gap-0.5 px-1 mr-1">
                      <UiButton 
                        variant="ghost" 
                        size="icon" 
                        class="h-8 w-8 transition-colors"
                        :class="isToolbarFixed ? 'text-primary bg-primary/10' : 'text-muted-foreground'"
                        :title="isToolbarFixed ? '取消固定' : '固定工具栏'" 
                        @click="isToolbarFixed = !isToolbarFixed"
                      >
                        <component :is="isToolbarFixed ? PinOff : Pin" class="h-4 w-4" />
                      </UiButton>
                    </div>

                    <Separator orientation="vertical" class="h-6 mr-1" />

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
                    <UiButton variant="ghost" size="icon" class="h-8 w-8" title="截图" @click="captureScreenshot">
                      <Download class="h-4 w-4" />
                    </UiButton>
                  </div>
                </Transition>
              </div>

              <!-- Hover Trigger Area (Invisible when toolbar is hidden) -->
              <div 
                v-if="!isToolbarFixed && !isToolbarHovered"
                class="absolute top-0 left-1/4 right-1/4 h-6 z-20 pointer-events-auto"
                @mouseenter="handleToolbarHover(true)"
              ></div>
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
                  :disabled="isInferring"
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
                              v-for="(item, idx) in items"
                              :key="idx"
                              @dblclick="highlightDetectionBox(detectionResults.indexOf(item))"
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
