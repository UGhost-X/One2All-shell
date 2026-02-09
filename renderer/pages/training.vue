<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRuntimeConfig } from '#app'
import { X, Settings2, Pin, PinOff, Settings } from 'lucide-vue-next'
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

const currentPreset = ref<'none' | 'basic' | 'standard' | 'heavy' | 'custom'>('none')

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
  }
})

const augmentConfig = computed({
  get: () => presetsData.value[currentPreset.value === 'custom' ? 'standard' : currentPreset.value] || presetsData.value.none,
  set: (val) => {
    if (currentPreset.value !== 'custom') {
      presetsData.value[currentPreset.value] = val
    }
  }
})

// Add a helper to update config that marks as custom if needed
const updateConfig = (fn: (cfg: any) => void) => {
  // If we are on a preset and change something, we could either:
  // 1. Update that preset's memory (user requested "temporary memory capability")
  // 2. Switch to custom (less ideal if they want memory per preset)
  // The user said: "switching back shouldn't reset, should have memory"
  // So we just update the current preset's data.
  fn(presetsData.value[currentPreset.value])
}

const applyPreset = (type: 'none' | 'basic' | 'standard' | 'heavy') => {
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
    
    // Process multiple results
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
    }
  }
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

        <div v-if="innerStep === 'augment'" class="flex-1 min-h-0 grid grid-cols-[400px,1fr] gap-6">
          <aside class="border rounded-xl bg-background p-4 flex flex-col gap-4 overflow-hidden h-full">
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

            <!-- 快捷预设 -->
            <div class="grid grid-cols-3 gap-2 shrink-0">
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
              <UiButton class="w-full" @click="innerStep = 'train'">{{ t('training.view.next') }}</UiButton>
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

                  <UiButton variant="ghost" size="sm" class="h-8 text-xs gap-2" @click="augmentedImageUrl = ''; augmentedResults = []; selectedIndices.clear()">
                    <X class="h-3 w-3" />
                    {{ t('training.view.backToOriginal') }}
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
                      <div :class="['grid gap-4 items-start content-start mx-auto transition-all origin-top-left']"
                          :style="{
                            gridTemplateColumns: `repeat(${previewGridCols}, 1fr)`,
                            width: `${previewImageSize[0]}%`
                          }">
                        <div v-for="(res, idx) in augmentedResults" :key="idx" 
                            class="relative group border-2 rounded-lg overflow-hidden bg-background shadow-sm transition-all cursor-pointer hover:border-primary/50"
                            :class="[selectedIndices.has(idx) ? 'border-primary ring-2 ring-primary/20' : 'border-transparent']"
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
                          <div v-if="res.params" class="absolute  bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1.5 mr-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <div class="flex flex-wrap gap-x-2 gap-y-1">
                              <span v-for="(val, key) in res.params" :key="key" class="whitespace-nowrap">
                                {{ key }}: {{ typeof val === 'number' ? val.toFixed(2) : val }}
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

        <div v-else-if="innerStep === 'train'" class="grid grid-cols-[360px,1fr] gap-6">
          <aside class="border rounded-xl bg-background p-4 space-y-4">
            <div class="space-y-1">
              <div class="flex justify-between">
                <Label>{{ t('training.train.epochs') }}</Label>
                <span class="text-xs font-medium">{{ trainConfig.epochs[0] }}</span>
              </div>
              <Slider v-model="trainConfig.epochs" :min="1" :max="100" />
            </div>
            <div class="space-y-1">
              <div class="flex justify-between">
                <Label>{{ t('training.train.batchSize') }}</Label>
                <span class="text-xs font-medium">{{ trainConfig.batchSize[0] }}</span>
              </div>
              <Slider v-model="trainConfig.batchSize" :min="1" :max="64" />
            </div>
            <div class="space-y-1">
              <Label>{{ t('training.train.learningRate') }}</Label>
              <Input type="number" v-model="trainConfig.learningRate" step="0.0001" class="w-28" />
            </div>
            <Separator />
            <UiButton class="w-full" @click="innerStep = 'monitor'">{{ t('training.train.start') }}</UiButton>
          </aside>
          <section class="border rounded-xl bg-background p-4">
            <div class="text-sm font-bold mb-4">{{ t('training.train.summary') }}</div>
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-lg border p-4 bg-muted/10">
                <div class="text-xs text-muted-foreground mb-1">{{ t('training.geometric.title') }}</div>
                <div class="text-sm font-medium">{{ enabledAugmentations }}</div>
              </div>
              <div class="rounded-lg border p-4 bg-muted/10">
                <div class="text-xs text-muted-foreground mb-1">{{ t('training.train.params') }}</div>
                <div class="text-sm font-medium">
                  {{ t('training.train.epochsValue') }}: {{ trainConfig.epochs[0] }} | 
                  {{ t('training.train.batchValue') }}: {{ trainConfig.batchSize[0] }} | 
                  {{ t('training.train.lrValue') }}: {{ trainConfig.learningRate }}
                </div>
              </div>
              <div class="rounded-lg border p-4 bg-muted/10">
                <div class="text-xs text-muted-foreground mb-1">{{ t('training.train.currentProduct') }}</div>
                <div class="text-sm font-medium">{{ productName || t('training.train.notSelected') }}</div>
              </div>
              <div class="rounded-lg border p-4 bg-muted/10">
                <div class="text-xs text-muted-foreground mb-1">{{ t('training.train.augmentedImages') }}</div>
                <div class="text-sm font-medium">{{ t('training.train.imagesCount', { count: augmentedResults.length > 0 ? augmentedResults.length : requestedNumResults }) }}</div>
              </div>
              <div class="rounded-lg border p-4 bg-muted/10">
                <div class="text-xs text-muted-foreground mb-1">{{ t('training.train.annotationsCount') }}</div>
                <div class="text-sm font-medium">{{ t('training.train.annotationsValue', { count: currentAnnotations.length }) }}</div>
              </div>
            </div>
          </section>
        </div>

        <div v-else class="grid grid-cols-[360px,1fr] gap-6">
          <aside class="border rounded-xl bg-background p-4 space-y-4">
            <div class="space-y-1">
              <Label>{{ t('training.monitor.currentTask') }}</Label>
              <div class="text-sm">{{ t('training.monitor.product') }} {{ productName || t('training.train.notSelected') }}</div>
            </div>
            <Separator />
            <UiButton @click="innerStep = 'train'">{{ t('training.monitor.backToParams') }}</UiButton>
          </aside>
          <section class="border rounded-xl bg-background p-4 space-y-4">
            <div class="rounded-lg border p-6">
              <div class="text-sm font-bold mb-2">{{ t('training.monitor.progress') }}</div>
              <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div class="h-2 bg-primary w-1/3"></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-lg border p-6 h-48"></div>
              <div class="rounded-lg border p-6 h-48"></div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Full Image Preview Modal -->
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
</style>
