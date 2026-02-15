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
  Pencil
} from 'lucide-vue-next'
import { computed, ref, onBeforeUnmount, onMounted, watch, nextTick, inject } from 'vue'
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

const isPinned = ref(false)
const isToolbarFixed = ref(true)
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
const exposureValue = ref(67)
const gainValue = ref(1.2)

const predictionConfidence = ref<number | null>(null)
const predictionResults = ref<Array<{ label: string; score: number }>>([])

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
  }
}

onMounted(async () => {
  if (window.electronAPI) {
    isPinned.value = await window.electronAPI.isAlwaysOnTop()
    await fetchInitialData()
    
    if (products.value.length > 0 && !selectedProductId.value) {
      handleSelectProduct(products.value[0].id)
    }
  }
  document.addEventListener('fullscreenchange', syncFullscreenState)
})

const togglePin = async () => {
  if (window.electronAPI) {
    isPinned.value = await window.electronAPI.toggleAlwaysOnTop()
  }
}

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
      
      showToast('产品已删除', 'info')
    } catch (err) {
      console.error('Failed to delete product:', err)
      showToast('删除失败', 'error')
    }
  }
  showDeleteModal.value = false
  productToDelete.value = null
}

const removeProduct = async (id: number) => {
  // Legacy method kept for compatibility if needed, but we prefer openDeleteModal
  if (window.electronAPI) {
    await window.electronAPI.deleteProduct(id)
    await fetchInitialData()
  }
}

// Camera Actions
const handleAddCamera = async () => {
  if (window.electronAPI) {
    const newCam = {
      name: `相机 #${cameras.value.length + 1}`,
      ip: `192.168.1.${100 + cameras.value.length + 1}`,
      status: 'offline'
    }
    await window.electronAPI.addCamera(newCam)
    await fetchInitialData()
  }
}

const handleRemoveCamera = async (id: number) => {
  if (window.electronAPI) {
    await window.electronAPI.deleteCamera(id)
    await fetchInitialData()
  }
}

const toggleCameraEnabled = async (cam: any) => {
  if (window.electronAPI) {
    await window.electronAPI.updateCamera(cam.id, { isEnabled: !cam.isEnabled })
    await fetchInitialData()
  }
}

const selectedProductId = ref<number | null>(null)

const handleSelectProduct = async (id: number) => {
  selectedProductId.value = id
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
const startLive = () => {
  if (!selectedProductId.value) {
    alert('请先选择一个产品')
    return
  }
  mainViewState.value = 'live'
  // In a real app, this would set a stream URL or start a websocket
  mainViewUrl.value = 'camera-stream-placeholder'
}

const takeCapture = async () => {
  if (!selectedProductId.value) {
    alert('请先选择一个产品')
    return
  }

  const product = products.value.find(p => p.id === selectedProductId.value)
  if (product?.lastImagePath) {
    showToast('该产品已绑定图片，不允许再次拍摄', 'error')
    return
  }

  // 模拟拍照过程
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 480
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#333'
    ctx.fillRect(0, 0, 640, 480)
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    ctx.fillText(`Captured at ${new Date().toLocaleTimeString()}`, 50, 50)
  }
  
  const dataUrl = canvas.toDataURL('image/jpeg')
  const fileName = `capture_${Date.now()}.jpg`
  
  if (window.electronAPI?.saveImage) {
    try {
      const filePath = await window.electronAPI.saveImage({
        productId: selectedProductId.value,
        fileName,
        dataUrl
      })
      console.log('Image saved to:', filePath)
      mainViewUrl.value = dataUrl
      mainViewState.value = 'image'
      
      // 更新本地产品列表中的路径，或者重新获取列表
      await fetchInitialData()
    } catch (err) {
      console.error('Failed to save captured image:', err)
    }
  } else {
    mainViewUrl.value = dataUrl
    mainViewState.value = 'image'
  }
}

const handleImportFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  const product = products.value.find(p => p.id === selectedProductId.value)
  if (product?.lastImagePath) {
    showToast('该产品已绑定图片，不允许再次导入', 'error')
    if (input) input.value = ''
    return
  }

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

  const product = products.value.find(p => p.id === selectedProductId.value)
  if (product?.lastImagePath) {
    showToast('该产品已绑定图片，不允许再次导入', 'error')
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
    exposureValue.value = Math.max(0, Math.min(200, Math.round(next)))
  },
})

const gainSliderValue = computed({
  get: () => [gainValue.value],
  set: (v: number[]) => {
    const next = Number(v?.[0] ?? 0)
    gainValue.value = Number(Math.max(0, Math.min(4, next)).toFixed(1))
  },
})

const handleExposureInput = (value: string | number) => {
  const val = typeof value === 'number' ? value : parseInt(String(value))
  if (!isNaN(val)) {
    exposureValue.value = Math.max(0, Math.min(200, val))
  }
}

const handleGainInput = (value: string | number) => {
  const val = typeof value === 'number' ? value : parseFloat(String(value))
  if (!isNaN(val)) {
    gainValue.value = Number(Math.max(0, Math.min(4, val)).toFixed(1))
  }
}

// Prediction Actions
const clearResults = () => {
  predictionConfidence.value = null
  predictionResults.value = []
}

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
})
</script>

<template>
  <div class="flex flex-col h-screen bg-background text-foreground overflow-hidden">
    <header class="h-14 border-b flex items-center px-6 bg-card shrink-0 z-20 shadow-sm">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">
          <Settings2 class="h-5 w-5" />
        </div>
        <h1 class="text-lg font-bold tracking-tight">{{ t('common.appName') }}</h1>
      </div>
      
      <div class="ml-auto flex items-center gap-3">
        <UiButton 
          variant="ghost" 
          size="icon" 
          @click="togglePin"
          :title="isPinned ? t('common.unpin') : t('common.pin')"
          :class="{ 'text-primary bg-primary/10': isPinned }"
        >
          <component :is="isPinned ? PinOff : Pin" class="h-4 w-4" />
        </UiButton>
        
        <NuxtLink to="/settings">
          <UiButton variant="ghost" size="icon" :title="t('common.settings')">
            <Settings class="h-4 w-4" />
          </UiButton>
        </NuxtLink>
        
        <Separator orientation="vertical" class="h-6 mx-1" />
        
        <NuxtLink 
          v-if="selectedProductId"
          :to="{ path: '/annotation', query: { productId: selectedProductId } }"
        >
          <UiButton variant="default" size="sm" class="h-8">
            {{ t('common.dataAnnotation') }}
          </UiButton>
        </NuxtLink>
      </div>
    </header>

    <div class="flex-1 grid grid-cols-3 overflow-hidden">
      <!-- Main Content Area (Left) -->
      <main class="col-span-2 min-w-0 min-h-0 bg-muted/20 relative overflow-hidden flex flex-col">
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
          <!-- Placeholder for Video Stream -->
          <div class="w-full h-full flex items-center justify-center">
            <div class="text-center space-y-4">
              <div class="relative w-24 h-24 mx-auto">
                <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <Video class="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p class="text-primary font-mono text-sm animate-pulse">LIVE STREAMING...</p>
            </div>
          </div>
          <div class="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            实时监控
          </div>
        </div>
      </main>

      <!-- Sidebar (Right) -->
      <aside class="col-span-1 border-l bg-card flex flex-col min-w-0 overflow-hidden">
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
                      :model-value="String(exposureValue)"
                      min="0"
                      max="200"
                      class="h-7 w-16 px-2 py-1 text-xs text-right font-mono"
                      @update:modelValue="handleExposureInput"
                    />
                    <span class="font-mono lowercase">ms</span>
                  </div>
                </div>
                <Slider v-model="exposureSliderValue" :max="200" :step="1" />
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider items-center">
                  <span>{{ t('dashboard.gain') }}</span>
                  <div class="flex items-center gap-0.5 text-primary">
                    <Input
                      type="number"
                      :model-value="String(gainValue)"
                      step="0.1"
                      min="0"
                      max="4"
                      class="h-7 w-16 px-2 py-1 text-xs text-right font-mono"
                      @update:modelValue="handleGainInput"
                    />
                    <span class="font-mono lowercase">x</span>
                  </div>
                </div>
                <Slider v-model="gainSliderValue" :max="4" :step="0.1" />
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
              <UiButton variant="outline" size="sm" class="h-14 flex flex-col gap-1 text-[10px] font-bold" @click="takeCapture">
                <CameraIcon class="h-4 w-4 text-primary" />
                {{ t('dashboard.capture') }}
              </UiButton>
              <UiButton variant="outline" size="sm" class="h-14 flex flex-col gap-1 text-[10px] font-bold col-span-2" @click="importImage">
                <Upload class="h-4 w-4 text-primary" />
                {{ t('dashboard.import') }}
              </UiButton>
            </div>
          </TabsContent>

          <TabsContent value="camera" class="flex-1 overflow-auto p-4 space-y-4">
            <!-- Camera List -->
            <div v-for="cam in cameras" :key="cam.id" class="p-3 rounded-lg border bg-muted/10 space-y-3 relative group">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div :class="['w-2 h-2 rounded-full', cam.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500']"></div>
                  <span class="text-xs font-bold">{{ cam.name }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <UiButton variant="ghost" size="icon" class="h-6 w-6" @click="toggleCameraEnabled(cam)">
                    <component :is="cam.isEnabled ? Power : PowerOff" :class="['h-3 w-3', cam.isEnabled ? 'text-green-600' : 'text-red-500']" />
                  </UiButton>
                  <UiButton variant="ghost" size="icon" class="h-6 w-6 text-destructive hover:bg-destructive/10" @click="handleRemoveCamera(cam.id)">
                    <Trash2 class="h-3 w-3" />
                  </UiButton>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-y-2 text-[10px]">
                <div class="text-muted-foreground uppercase font-bold tracking-tight">{{ t('dashboard.cameraStatus') }}</div>
                <div class="text-right font-mono">{{ cam.status }}</div>
                <div class="text-muted-foreground uppercase font-bold tracking-tight">IP</div>
                <div class="text-right font-mono">{{ cam.ip }}</div>
              </div>
            </div>

            <UiButton variant="outline" class="w-full h-10 border-dashed gap-2 text-xs font-bold" @click="handleAddCamera">
              <Plus class="h-3.5 w-3.5" />
              {{ t('dashboard.add') }}
            </UiButton>
          </TabsContent>
        </section>

        <!-- Product List -->
        <section class="flex-1 border-b flex flex-col min-h-0 overflow-hidden">
          <div class="h-10 px-4 flex items-center justify-between bg-muted/30 border-b shrink-0">
            <div class="flex items-center gap-2">
              <List class="h-4 w-4 text-primary" />
              <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">{{ t('dashboard.productList') }}</span>
            </div>
            <UiButton variant="ghost" size="icon" class="h-6 w-6 text-primary hover:bg-primary/10" @click="openProductModal">
              <Plus class="h-3.5 w-3.5" />
            </UiButton>
          </div>
          <div class="flex-1 overflow-auto p-2">
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
                  class="w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-[10px] transition-colors"
                  :class="selectedProductId === product.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/40'"
                >
                  #{{ product.id }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold truncate" :class="{ 'text-primary': selectedProductId === product.id }">{{ product.name }}</div>
                  <div class="text-[10px] text-muted-foreground truncate">{{ product.model }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <div v-if="selectedProductId === product.id" class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse mr-1"></div>
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
            <UiButton variant="ghost" size="sm" class="h-6 px-2 text-[10px] font-bold gap-1 text-muted-foreground hover:text-destructive transition-colors" @click="clearResults">
              <RotateCcw class="h-3 w-3" />
              {{ t('dashboard.clear') }}
            </UiButton>
          </div>
          <div class="flex-1 overflow-auto p-4">
            <div v-if="predictionResults.length > 0" class="space-y-4">
              <div v-if="predictionConfidence !== null" class="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div>
                  <div class="text-[9px] font-bold text-primary uppercase tracking-widest mb-0.5">置信度评分</div>
                  <div class="text-2xl font-bold tracking-tighter">{{ predictionConfidence.toFixed(1) }}%</div>
                </div>
                <div class="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin-slow"></div>
              </div>

              <div class="space-y-3">
                <div v-for="item in predictionResults" :key="item.label" class="space-y-1.5">
                  <div class="flex justify-between text-[10px] font-bold">
                    <span class="text-muted-foreground uppercase tracking-tight">{{ item.label }}</span>
                    <span class="font-mono">{{ item.score.toFixed(1) }}%</span>
                  </div>
                  <Progress :model-value="item.score" class="h-1.5" />
                </div>
              </div>
            </div>

            <div v-else class="h-full flex flex-col items-center justify-center text-muted-foreground/40 space-y-2 py-8">
              <BarChart3 class="h-8 w-8" />
              <p class="text-[10px] font-bold uppercase tracking-wider">暂无预测数据</p>
            </div>
          </div>
        </section>
        </Tabs>
      </aside>
    </div>

    <!-- Product Modal -->
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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 border-destructive/20">
        <UiCardHeader class="space-y-2">
          <UiCardTitle class="text-lg text-destructive flex items-center gap-2">
            <Trash2 class="h-5 w-5" />
            确认删除
          </UiCardTitle>
          <UiCardDescription>
            确定要删除 "{{ productToDelete?.name }}" 吗？此操作将永久删除该产品及其所有关联图片，无法恢复。
          </UiCardDescription>
        </UiCardHeader>
        <UiCardFooter class="flex justify-end gap-2">
          <UiButton variant="outline" @click="showDeleteModal = false">取消</UiButton>
          <UiButton variant="destructive" @click="confirmDeleteProductAction">确认删除</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <input ref="importFileInput" type="file" accept="image/*" class="hidden" @change="handleImportFileChange" />
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
