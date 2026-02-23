<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted, watch, nextTick, onActivated, onDeactivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Canvas, Rect, Polygon, FabricImage, Point, Line, Circle } from 'fabric'
import { 
  Square, 
  Hexagon, 
  Save, 
  Undo2,
  Redo2,
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Plus,
  Check,
  X,
  Settings2,
  Palette,
  BookOpen,
  Maximize
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

definePageMeta({ 
  keepalive: true,
  name: 'AnnotationPage'
})

import Separator from '@/components/ui/separator/Separator.vue'
import UiSelect from '@/components/ui/select/Select.vue'
import UiSelectContent from '@/components/ui/select/SelectContent.vue'
import UiSelectItem from '@/components/ui/select/SelectItem.vue'
import UiSelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import UiSelectValue from '@/components/ui/select/SelectValue.vue'

// --- Types ---
interface Annotation {
  id: string
  type: 'rect' | 'polygon'
  labelId: string
  label: string
  points: any[] 
  color: string
}

interface LabelConfig {
  id: string
  name: string
  type: 'rect' | 'polygon'
  color: string
}

interface ImageData {
  url: string
  fullPath?: string
  name: string
  annotations: Annotation[]
}

// --- State ---
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const fCanvas = ref<Canvas | null>(null)

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const productId = ref<number | null>(null)
const imagePath = ref<string | null>(null)
const productName = ref<string>('')
const activeSchemeId = ref<number | null>(null)

const showLabelPanel = ref(true)

// --- Image Viewer State (Home同款) ---
const viewerViewportRef = ref<HTMLElement | null>(null)
const viewerImageNatural = ref<{ w: number; h: number } | null>(null)
const viewerViewportSize = ref({ w: 0, h: 0 })
const viewerZoom = ref(1)
const viewerPanX = ref(0)
const viewerPanY = ref(0)
const viewerRotationDeg = ref(0)

const viewerScale = computed(() => {
  const img = viewerImageNatural.value
  const vp = viewerViewportSize.value
  if (!img || vp.w <= 0 || vp.h <= 0) return 1
  const baseScale = Math.min(vp.w / img.w, vp.h / img.h)
  return baseScale * viewerZoom.value
})

const updateViewerViewportSize = () => {
  const el = viewerViewportRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  
  // Use container dimensions as fallback if rect is 0
  const w = rect.width || (containerRef.value?.clientWidth ?? 800)
  const h = rect.height || (containerRef.value?.clientHeight ?? 600)
  
  viewerViewportSize.value = { w, h }
  
  if (fCanvas.value) {
    fCanvas.value.setDimensions({
      width: w,
      height: h
    })
    fCanvas.value.renderAll()
  }
}

const activeTool = ref<'select' | 'rect' | 'polygon'>('select')
const images = reactive<ImageData[]>([])
const currentImgIndex = ref(0)
const selectedId = ref<string | null>(null)

// --- Scheme Management ---
const schemes = ref<any[]>([])
const showSchemeModal = ref(false)
const newSchemeName = ref('')
const isCreatingScheme = ref(false)

const fetchSchemes = async () => {
  if (window.electronAPI) {
    schemes.value = await window.electronAPI.getSchemes()
  }
}

const schemeSelectValue = ref('')
const schemeSelectOpen = ref(false)
watch(activeSchemeId, () => {
  schemeSelectValue.value = activeSchemeId.value ? String(activeSchemeId.value) : ''
}, { immediate: true })

const onSchemeValueChange = async (value: string) => {
  schemeSelectValue.value = value
  if (!schemeSelectValue.value) return
  await bindScheme(Number(schemeSelectValue.value))
  schemeSelectOpen.value = false
}

const bindScheme = async (schemeId: number) => {
  if (!productId.value || !window.electronAPI) return
  try {
    await window.electronAPI.bindScheme(productId.value, schemeId)
    const scheme = schemes.value.find(s => s.id === schemeId)
    if (scheme) {
      activeSchemeId.value = scheme.id
      const config = JSON.parse(scheme.config)
      labelConfigs.splice(0, labelConfigs.length, ...config.labels)
      if (config.customColors) {
        customColors.splice(0, customColors.length, ...config.customColors)
      } else {
        customColors.splice(0, customColors.length)
      }
      // Don't auto-select label anymore per user request
      activeLabelId.value = null
      activeTool.value = 'select'
    }
    showSchemeModal.value = false
  } catch (err) {
    console.error('Failed to bind scheme:', err)
  }
}

const createScheme = async () => {
  if (!newSchemeName.value.trim() || !window.electronAPI) return
  try {
    const newScheme = await window.electronAPI.saveScheme({
      name: newSchemeName.value.trim(),
      config: JSON.stringify({ labels: [] })
    })
    await fetchSchemes()
    await bindScheme(newScheme.id)
    newSchemeName.value = ''
    isCreatingScheme.value = false
  } catch (err) {
    console.error('Failed to create scheme:', err)
  }
}

const showDeleteSchemeModal = ref(false)
const schemeToDelete = ref<any>(null)

const openDeleteSchemeModal = (scheme: any) => {
  schemeToDelete.value = scheme
  showDeleteSchemeModal.value = true
}

const confirmDeleteScheme = async () => {
  const scheme = schemeToDelete.value
  if (!scheme || !window.electronAPI) return
  try {
    await window.electronAPI.deleteScheme(scheme.id)
    await fetchSchemes()

    if (activeSchemeId.value === scheme.id) {
      activeSchemeId.value = null
      activeLabelId.value = null
      labelConfigs.splice(0, labelConfigs.length)
      customColors.splice(0, customColors.length)
      activeTool.value = 'select'
      showSchemeModal.value = true
    }
  } catch (err) {
    console.error('Failed to delete scheme:', err)
  } finally {
    showDeleteSchemeModal.value = false
    schemeToDelete.value = null
  }
}

// --- Label Config State ---
const labelConfigs = reactive<LabelConfig[]>([
  { id: '1', name: 'Label A', type: 'rect', color: '#3b82f6' },
  { id: '2', name: 'Label B', type: 'polygon', color: '#ef4444' },
  { id: '3', name: 'Label C', type: 'rect', color: '#10b981' },
])
const activeLabelId = ref<string | null>(null)

// --- Label Management ---
const isEditingLabel = ref(false)
const isAddingMode = ref(false)
const editingLabel = reactive<LabelConfig>({
  id: '',
  name: '',
  type: 'rect',
  color: '#3b82f6'
})

const customColors = reactive<string[]>([])

const addNewLabel = async () => {
  // If no active scheme, create one first
  if (!activeSchemeId.value && window.electronAPI && productId.value) {
    const schemeName = `Scheme for ${productName.value || productId.value}`
    const newScheme = await window.electronAPI.saveScheme({
      name: schemeName,
      config: JSON.stringify({ labels: [] })
    })
    activeSchemeId.value = newScheme.id
    await window.electronAPI.bindScheme(productId.value, newScheme.id)
  }

  const newId = Math.random().toString(36).substr(2, 9)
  
  // High contrast color palette
  const palette = [...defaultPalette, ...customColors]
  
  // Find a color that isn't already used
  const usedColors = labelConfigs.map(l => l.color.toLowerCase())
  const availableColor = palette.find(c => !usedColors.includes(c.toLowerCase())) || palette[Math.floor(Math.random() * palette.length)]
  
  const newLabel: LabelConfig = {
    id: newId,
    name: `New Label ${labelConfigs.length + 1}`,
    type: 'rect',
    color: availableColor
  }
  
  editLabel(newLabel, true)
}

const defaultPalette = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', 
  '#06b6d4', '#f97316', '#84cc16', '#14b8a6', '#6366f1', '#d946ef'
]

const fullPalette = computed(() => [...defaultPalette, ...customColors])

const handleAddColor = (event: Event) => {
  const input = event.target as HTMLInputElement
  const color = input.value
  if (color && !fullPalette.value.some(c => c.toLowerCase() === color.toLowerCase())) {
    customColors.push(color)
    editingLabel.color = color
  }
}

const editLabel = (config: LabelConfig, isNew = false) => {
  isAddingMode.value = isNew
  Object.assign(editingLabel, config)
  isEditingLabel.value = true
}

type AnnotationSnapshot = Annotation[]
const undoStack: AnnotationSnapshot[] = []
const redoStack: AnnotationSnapshot[] = []

const cloneAnnotations = (anns: Annotation[]): Annotation[] => {
  return JSON.parse(JSON.stringify(anns))
}

const pushHistory = () => {
  const current = images[currentImgIndex.value]
  if (!current) return
  undoStack.push(cloneAnnotations(current.annotations))
  if (undoStack.length > 20) undoStack.shift()
  redoStack.length = 0
}

const applySnapshotToCurrent = (snapshot: Annotation[]) => {
  const current = images[currentImgIndex.value]
  if (!current) return
  current.annotations.splice(0, current.annotations.length, ...cloneAnnotations(snapshot))
}

const redrawCurrentAnnotations = () => {
  if (!fCanvas.value) return
  const annObjects = fCanvas.value.getObjects().filter((o: any) => {
    return o?.id && String(o.id).startsWith('ann_')
  })
  annObjects.forEach((o: any) => fCanvas.value?.remove(o))
  const current = images[currentImgIndex.value]
  if (!current) return
  current.annotations.forEach(ann => drawAnnotation(ann))
  fCanvas.value.renderAll()
}

const undo = () => {
  const current = images[currentImgIndex.value]
  if (!current || undoStack.length === 0) return
  if (isDrawing) cancelDrawing()
  redoStack.push(cloneAnnotations(current.annotations))
  const prev = undoStack.pop()!
  applySnapshotToCurrent(prev)
  selectedId.value = null
  redrawCurrentAnnotations()
}

const redo = () => {
  const current = images[currentImgIndex.value]
  if (!current || redoStack.length === 0) return
  if (isDrawing) cancelDrawing()
  undoStack.push(cloneAnnotations(current.annotations))
  const next = redoStack.pop()!
  applySnapshotToCurrent(next)
  selectedId.value = null
  redrawCurrentAnnotations()
}

const saveLabelConfig = async () => {
  if (isAddingMode.value) {
    labelConfigs.push({ ...editingLabel })
    activeLabelId.value = editingLabel.id
  } else {
    const index = labelConfigs.findIndex(c => c.id === editingLabel.id)
    if (index !== -1) {
      labelConfigs[index] = { ...editingLabel }
      // Update existing annotations with this label
      images.forEach(img => {
        img.annotations.forEach((ann: any) => {
          if (ann.labelId === editingLabel.id) {
            ann.label = editingLabel.name
            ann.color = editingLabel.color
          }
        })
      })

      // Update canvas if current image has annotations with this label
      if (fCanvas.value) {
        fCanvas.value.getObjects().forEach((obj: any) => {
          if (obj.labelId === editingLabel.id) {
            obj.set({
              stroke: editingLabel.color,
              fill: `${editingLabel.color}1A`
            })
          }
        })
        fCanvas.value.renderAll()
      }
    }
  }

  // Save to DB
  if (activeSchemeId.value && window.electronAPI) {
    await window.electronAPI.saveScheme({
      id: activeSchemeId.value,
      config: JSON.stringify({ labels: labelConfigs, customColors })
    })
  }

  if (activeLabelId.value === editingLabel.id) {
    activeTool.value = editingLabel.type
  }

  isEditingLabel.value = false
}

const removeLabel = async (id: string) => {
  const index = labelConfigs.findIndex(c => c.id === id)
  if (index !== -1) {
    labelConfigs.splice(index, 1)
    if (activeLabelId.value === id) activeLabelId.value = null

    // If we have an active scheme, update it in DB
    if (activeSchemeId.value && window.electronAPI) {
      await window.electronAPI.saveScheme({
        id: activeSchemeId.value,
        config: JSON.stringify({ labels: labelConfigs, customColors })
      })
    }
  }
}

// --- Drawing State ---
let isDrawing = false
let startPoint: Point | null = null
let tempObj: any = null
let polygonPoints: Point[] = []
let activeLine: Line | null = null
let tempPoints: Circle[] = []
let tempLines: Line[] = []

// --- Initialization ---
let listenersBound = false
const bindWindowListeners = () => {
  if (listenersBound) return
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', handleResize)
  listenersBound = true
}

const unbindWindowListeners = () => {
  if (!listenersBound) return
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
  listenersBound = false
}

onMounted(async () => {
  // Handle image from route query
  const qProductId = route.query.productId
  const qImagePath = route.query.imagePath
  const qProductName = route.query.productName
  
  if (qProductId) productId.value = Number(qProductId)
  if (qImagePath) imagePath.value = String(qImagePath)
  if (qProductName) productName.value = String(qProductName)

  // Load scheme and annotations from database
  if (productId.value && window.electronAPI) {
    await fetchSchemes()
    const products = await window.electronAPI.getProducts()
    const product = products.find(p => p.id === productId.value)
    if (product?.scheme) {
      activeSchemeId.value = product.scheme.id
      const config = JSON.parse(product.scheme.config)
      labelConfigs.splice(0, labelConfigs.length, ...config.labels)
      // Auto-select first label if available
      if (labelConfigs.length > 0) {
        activeLabelId.value = labelConfigs[0].id
        activeTool.value = labelConfigs[0].type
      }
    } else {
      // No scheme bound, show modal
      showSchemeModal.value = true
    }

  // Normalize function for path comparison
  const normalize = (p: string) => (p || '').replace(/\\/g, '/').toLowerCase()
  const targetPath = imagePath.value ? normalize(imagePath.value) : ''

  // Load all images for this product
  if (productId.value && window.electronAPI) {
    const productImages = await window.electronAPI.getProductImages(productId.value)
    if (productImages && productImages.length > 0) {
      images.splice(0, images.length) // Clear existing demo images
      
      for (const pPath of productImages) {
        const savedAnnotations = await window.electronAPI.getAnnotations(productId.value, pPath)
        const annData = savedAnnotations ? JSON.parse(savedAnnotations.data) : []
        
        // Find if this is the currently requested image to set currentImgIndex
        if (normalize(pPath) === targetPath) {
          currentImgIndex.value = images.length
        }

        images.push({
          url: '', // will be loaded via loadImage when selected
          fullPath: pPath,
          name: pPath.split(/[\\/]/).pop() || 'image.jpg',
          annotations: annData
        })
      }

      // If we couldn't find the targetPath in productImages, but we have product.lastImagePath, add it
      if (currentImgIndex.value === 0 && images.length > 0) {
         // Check if the targetPath was found. If not, maybe it's not in the productImages list yet
         const found = images.some(img => normalize(img.fullPath || '') === targetPath)
         if (!found && imagePath.value) {
            const savedAnnotations = await window.electronAPI.getAnnotations(productId.value, imagePath.value)
            const annData = savedAnnotations ? JSON.parse(savedAnnotations.data) : []
            currentImgIndex.value = images.length
            images.push({
              url: '',
              fullPath: imagePath.value,
              name: imagePath.value.split(/[\\/]/).pop() || 'image.jpg',
              annotations: annData
            })
         }
      }

      // Default to first if not found
      if (currentImgIndex.value >= images.length) {
        currentImgIndex.value = 0
      }

      // Pre-load the current image URL
      const curImg = images[currentImgIndex.value]
      if (curImg && curImg.fullPath) {
        const dataUrl = await window.electronAPI.loadImage(curImg.fullPath)
        curImg.url = dataUrl || ''
      }
    } else if (imagePath.value) {
      // No product images but we have a direct path
      const savedAnnotations = await window.electronAPI.getAnnotations(productId.value, imagePath.value)
      const annData = savedAnnotations ? JSON.parse(savedAnnotations.data) : []
      images.push({
        url: '',
        fullPath: imagePath.value,
        name: imagePath.value.split(/[\\/]/).pop() || 'image.jpg',
        annotations: annData
      })
      currentImgIndex.value = 0
      const curImg = images[0]
      const dataUrl = await window.electronAPI.loadImage(curImg.fullPath!)
      curImg.url = dataUrl || ''
    }
  }
  }

  await nextTick()

  if (canvasRef.value && containerRef.value) {
    const { clientWidth, clientHeight } = containerRef.value
    fCanvas.value = new Canvas(canvasRef.value, {
      width: clientWidth || 800,
      height: clientHeight || 600,
      backgroundColor: 'transparent',
      selection: true,
      uniformScaling: false,
    })

    initCanvasEvents()
    if (images.length > 0) {
      loadImage(currentImgIndex.value)
    }
    bindWindowListeners()
    
    // Ensure viewport size is updated for the new viewer logic
    updateViewerViewportSize()
  }
})

const handleResize = () => {
  if (!fCanvas.value || !containerRef.value || images.length === 0) return
  window.requestAnimationFrame(() => {
    updateViewerViewportSize()
    syncCanvasToViewer()
  })
}

onActivated(() => {
  bindWindowListeners()
  if (!fCanvas.value || !containerRef.value || images.length === 0) return
  window.requestAnimationFrame(() => {
    updateViewerViewportSize()
    syncCanvasToViewer()
  })
})

watch(() => route.query, async (newQuery) => {
  console.log('[Annotation] Route query changed:', newQuery)
  const qProductId = newQuery.productId
  const qImagePath = newQuery.imagePath
  const qProductName = newQuery.productName
  
  if (qProductId) {
    productId.value = Number(qProductId)
    productName.value = String(qProductName || '')
    
    if (qImagePath) {
      imagePath.value = String(qImagePath)
      
      const normalize = (p: string) => (p || '').replace(/\\/g, '/').toLowerCase()
      const targetPath = normalize(imagePath.value)
      
      const existingImg = images.find(img => normalize(img.fullPath || '') === targetPath)
      if (existingImg) {
        const idx = images.indexOf(existingImg)
        currentImgIndex.value = idx
        if (!existingImg.url && existingImg.fullPath) {
          const dataUrl = await window.electronAPI.loadImage(existingImg.fullPath)
          existingImg.url = dataUrl || ''
        }
      } else if (window.electronAPI) {
        const savedAnnotations = await window.electronAPI.getAnnotations(productId.value, imagePath.value)
        const annData = savedAnnotations ? JSON.parse(savedAnnotations.data) : []
        
        const dataUrl = await window.electronAPI.loadImage(imagePath.value)
        
        images.unshift({
          url: dataUrl || '',
          fullPath: imagePath.value,
          name: imagePath.value.split(/[\\/]/).pop() || 'image.jpg',
          annotations: annData
        })
        currentImgIndex.value = 0
      }
    }
  }
}, { immediate: true })

onDeactivated(() => {
  unbindWindowListeners()
})

onUnmounted(() => {
  if (fCanvas.value) {
    fCanvas.value.dispose()
  }
  unbindWindowListeners()
})

// --- Methods ---

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedId.value) {
      deleteAnnotation(selectedId.value)
    }
  } else if (e.key === 'v' || e.key === 'V') {
    activeTool.value = 'select'
  } else if (e.key === 'r' || e.key === 'R') {
    activeTool.value = 'rect'
  } else if (e.key === 'p' || e.key === 'P') {
    activeTool.value = 'polygon'
  } else if (e.key === 'Escape') {
    cancelDrawing()
  }
}

const cancelDrawing = () => {
  isDrawing = false
  if (tempObj) fCanvas.value?.remove(tempObj)
  tempPoints.forEach(p => fCanvas.value?.remove(p))
  tempLines.forEach(l => fCanvas.value?.remove(l))
  if (activeLine) fCanvas.value?.remove(activeLine)
  
  tempPoints = []
  tempLines = []
  polygonPoints = []
  activeLine = null
  tempObj = null
  activeTool.value = 'select'
  fCanvas.value?.renderAll()
}

const getRotationCosSin = () => {
  const theta = (viewerRotationDeg.value * Math.PI) / 180
  return { cos: Math.cos(theta), sin: Math.sin(theta) }
}

const syncCanvasToViewer = () => {
  if (!fCanvas.value || !viewerImageNatural.value) return
  const s = viewerScale.value
  const vp = viewerViewportSize.value
  const cx = vp.w / 2
  const cy = vp.h / 2
  
  const { cos, sin } = getRotationCosSin()
  const a = cos * s
  const b = sin * s
  const c = -sin * s
  const d = cos * s
  
  // To center the image (whose top-left is at 0,0) in the viewport:
  // The center of the image in scene space is (w/2, h/2).
  // We want this to map to the viewport center (cx + panX, cy + panY).
  const imgW = viewerImageNatural.value.w
  const imgH = viewerImageNatural.value.h
  const tx = cx + viewerPanX.value - (a * imgW / 2 + c * imgH / 2)
  const ty = cy + viewerPanY.value - (b * imgW / 2 + d * imgH / 2)

  fCanvas.value.viewportTransform = [a, b, c, d, tx, ty]
  fCanvas.value.renderAll()
}

const initCanvasEvents = () => {
  if (!fCanvas.value) return

  fCanvas.value.on('mouse:down', (opt) => {
    // If clicking on an annotation, don't start drawing a new one
    const target = opt.target as any
    const targetId = target?.id ? String(target.id) : ''
    if (targetId.startsWith('ann_')) {
      return
    }

    // We use getScenePoint to get coordinates in the transformed image space
    const pointer = fCanvas.value!.getScenePoint(opt.e)
    
    if (activeTool.value === 'rect') {
      if (!activeLabelId.value) return
      const config = labelConfigs.find(c => c.id === activeLabelId.value)
      if (!config || config.type !== 'rect') return

      isDrawing = true
      startPoint = pointer
      tempObj = new Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: `${config.color}33`,
        stroke: config.color,
        strokeWidth: 2 / viewerScale.value,
        selectable: false,
      })
      fCanvas.value!.add(tempObj)
    } else if (activeTool.value === 'polygon') {
      // ... similar adjustments for polygon strokeWidth ...
      if (!activeLabelId.value) return
      const config = labelConfigs.find(c => c.id === activeLabelId.value)
      if (!config || config.type !== 'polygon') return

      isDrawing = true
      const point = new Point(pointer.x, pointer.y)
      polygonPoints.push(point)
      
      const s = viewerScale.value
      const circle = new Circle({
        left: pointer.x - 4/s,
        top: pointer.y - 4/s,
        radius: 4/s,
        fill: config.color,
        stroke: '#fff',
        strokeWidth: 1/s,
        selectable: false,
        evented: false
      })
      tempPoints.push(circle)
      fCanvas.value!.add(circle)

      if (polygonPoints.length > 1) {
        const line = new Line([
          polygonPoints[polygonPoints.length - 2].x,
          polygonPoints[polygonPoints.length - 2].y,
          polygonPoints[polygonPoints.length - 1].x,
          polygonPoints[polygonPoints.length - 1].y
        ], {
          stroke: config.color,
          strokeWidth: 2/s,
          selectable: false,
          evented: false
        })
        tempLines.push(line)
        fCanvas.value!.add(line)
      }

      if (activeLine) fCanvas.value!.remove(activeLine)
      activeLine = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: config.color,
        strokeWidth: 2/s,
        strokeDashArray: [5/s, 5/s],
        selectable: false,
        evented: false
      })
      fCanvas.value!.add(activeLine)
    }
  })

  fCanvas.value.on('mouse:move', (opt) => {
    if (!fCanvas.value) return
    const pointer = fCanvas.value.getScenePoint(opt.e)

    if (!isDrawing) return

  if (activeTool.value === 'rect' && startPoint && tempObj) {
    const width = pointer.x - startPoint.x
    const height = pointer.y - startPoint.y
    
    // Maintain minimum size
    const finalWidth = Math.abs(width)
    const finalHeight = Math.abs(height)
    
    tempObj.set({
      width: finalWidth,
      height: finalHeight,
      left: width > 0 ? startPoint.x : pointer.x,
      top: height > 0 ? startPoint.y : pointer.y,
    })
    fCanvas.value.renderAll()
  } else if (activeTool.value === 'polygon' && activeLine) {
      activeLine.set({ x2: pointer.x, y2: pointer.y })
      fCanvas.value.renderAll()
    }
  })

  fCanvas.value.on('mouse:up', (opt) => {
    if (activeTool.value === 'rect' && isDrawing) {
      if (tempObj && (tempObj.width > 2 || tempObj.height > 2)) {
        finishDrawing()
      } else {
        cancelDrawing()
      }
    }
  })

  fCanvas.value.on('mouse:dblclick', () => {
    if (activeTool.value === 'polygon' && isDrawing && polygonPoints.length >= 3) {
      finishDrawing()
    }
  })

  fCanvas.value.on('selection:created', (e) => {
    const obj = e.selected?.[0] as any
    if (obj && obj.id) {
      selectedId.value = obj.id
    }
  })

  fCanvas.value.on('selection:updated', (e) => {
    const obj = e.selected?.[0] as any
    if (obj && obj.id) {
      selectedId.value = obj.id
    }
  })

  fCanvas.value.on('selection:cleared', () => {
    selectedId.value = null
  })

  fCanvas.value.on('object:modified', (e) => {
    const obj = e.target as any
    const objId = obj?.id ? String(obj.id) : ''
    if (!objId.startsWith('ann_')) return

    const current = images[currentImgIndex.value]
    if (!current) return
    const index = current.annotations.findIndex(a => a.id === objId)
    if (index === -1) return

    pushHistory()

    const ann = current.annotations[index]
    if (ann.type === 'rect') {
      const left = Number(obj.left ?? 0)
      const top = Number(obj.top ?? 0)
      const w = Number(obj.width ?? 0) * Number(obj.scaleX ?? 1)
      const h = Number(obj.height ?? 0) * Number(obj.scaleY ?? 1)
      // COCO bbox: [x, y, width, height]
      ann.points = [left, top, w, h]
      obj.set({ width: w, height: h, scaleX: 1, scaleY: 1 })
    } else if (ann.type === 'polygon') {
      const left = Number(obj.left ?? 0)
      const top = Number(obj.top ?? 0)
      const scaleX = Number(obj.scaleX ?? 1)
      const scaleY = Number(obj.scaleY ?? 1)
      const pathOffset = obj.pathOffset ?? { x: 0, y: 0 }
      
      const points = (obj.points ?? []).map((p: any) => ({
        x: (Number(p.x ?? 0) - Number(pathOffset.x ?? 0)) * scaleX + left,
        y: (Number(p.y ?? 0) - Number(pathOffset.y ?? 0)) * scaleY + top,
      }))
      // COCO segmentation: [x1, y1, x2, y2, ...]
      ann.points = points.flatMap((p: any) => [p.x, p.y])
      // Reset scale after applying it to points
      obj.set({
        points: (obj.points ?? []).map((p: any) => ({
          x: p.x * scaleX,
          y: p.y * scaleY
        })),
        scaleX: 1,
        scaleY: 1,
        pathOffset: {
          x: pathOffset.x * scaleX,
          y: pathOffset.y * scaleY
        }
      })
    }
  })
}

const finishDrawing = () => {
  if (!fCanvas.value || !activeLabelId.value) return
  const config = labelConfigs.find(c => c.id === activeLabelId.value)
  if (!config) return

  isDrawing = false

  pushHistory()

  const id = `ann_${Date.now()}`
  let newAnn: Annotation | null = null
  const color = config.color

  if (activeTool.value === 'rect' && tempObj) {
    newAnn = {
      id,
      type: 'rect',
      labelId: config.id,
      label: config.name,
      // COCO bbox: [x, y, width, height]
      points: [tempObj.left, tempObj.top, tempObj.width, tempObj.height],
      color
    }
    fCanvas.value.remove(tempObj)
    
    const rect = new Rect({
      left: tempObj.left,
      top: tempObj.top,
      width: tempObj.width,
      height: tempObj.height,
      fill: `${color}1A`,
      stroke: color,
      strokeWidth: 2,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: true,
      lockScalingFlip: true,
      hasControls: true,
      id: id as any,
      labelId: config.id as any,
      cornerColor: '#fff',
      cornerStrokeColor: color,
      cornerSize: 8,
      cornerStyle: 'circle',
      transparentCorners: false,
      padding: 5,
    } as any)

    rect.setControlVisible('mtr', false);
    
    fCanvas.value.add(rect)
    fCanvas.value.setActiveObject(rect)
  } else if (activeTool.value === 'polygon' && polygonPoints.length >= 3) {
    newAnn = {
      id,
      type: 'polygon',
      labelId: config.id,
      label: config.name,
      // COCO segmentation: [x1, y1, x2, y2, ...]
      points: polygonPoints.flatMap(p => [p.x, p.y]),
      color
    }
    
    // Clear temp items
    tempPoints.forEach(p => fCanvas.value!.remove(p))
    tempLines.forEach(l => fCanvas.value!.remove(l))
    if (activeLine) fCanvas.value!.remove(activeLine)
    
    const poly = new Polygon(polygonPoints, {
      fill: `${color}1A`, // 10% opacity
      stroke: color,
      strokeWidth: 2,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: true,
      lockScalingFlip: true,
      hasControls: true,
      cornerColor: '#fff',
      cornerStrokeColor: color,
      cornerSize: 8,
      cornerStyle: 'circle',
      transparentCorners: false,
      padding: 5,
      id: id as any,
      labelId: config.id as any,
      objectCaching: false,
      
    } as any)
    //取消长柄
    poly.setControlVisible('mtr', false);
    fCanvas.value.add(poly)
    fCanvas.value.setActiveObject(poly)
    
    polygonPoints = []
    tempPoints = []
    tempLines = []
    activeLine = null
  }

  if (newAnn) {
    images[currentImgIndex.value].annotations.push(newAnn)
  }
  
  tempObj = null
  startPoint = null
  fCanvas.value.renderAll()
}

const loadImage = async (index: number) => {
  if (!fCanvas.value || !containerRef.value || index < 0 || index >= images.length) return
  
  const imgData = images[index]
  let url = imgData.url
  
  // If URL is missing, try to load it
  if (!url && imgData.fullPath && window.electronAPI) {
    const dataUrl = await window.electronAPI.loadImage(imgData.fullPath)
    imgData.url = dataUrl || ''
    url = imgData.url
  }

  if (!url) {
    console.error('No URL for image at index', index)
    return
  }

  fCanvas.value.clear()
  
  // Reset viewer state (Home同款)
  viewerZoom.value = 1
  viewerPanX.value = 0
  viewerPanY.value = 0
  viewerRotationDeg.value = 0
  
  try {
    const img = await FabricImage.fromURL(url)
    if (!fCanvas.value) return
    
    // Set natural dimensions for viewer logic
    viewerImageNatural.value = { w: img.width, h: img.height }
    updateViewerViewportSize()
    
    // Position image at 0,0 with top-left origin for COCO compatibility
    img.set({
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
      hoverCursor: 'default'
    })
    
    fCanvas.value.add(img)
    fCanvas.value.sendObjectToBack(img)
    
    // Draw existing annotations
    const currentAnns = images[index].annotations
    currentAnns.forEach(ann => drawAnnotation(ann))
    
    syncCanvasToViewer()
    fCanvas.value.renderAll()
  } catch (err) {
    console.error('Failed to load image into fabric:', err)
  }
}

const drawAnnotation = (ann: Annotation) => {
  if (!fCanvas.value) return
  if (ann.type === 'rect') {
    const rect = new Rect({
      left: ann.points[0],
      top: ann.points[1],
      width: ann.points[2],
      height: ann.points[3],
      fill: `${ann.color}1A`, // 10% opacity
      stroke: ann.color,
      strokeWidth: 2,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: true,
      lockScalingFlip: true,
      hasControls: true,
      id: ann.id as any,
      labelId: ann.labelId as any,
      cornerColor: '#fff',
      cornerStrokeColor: ann.color,
      cornerSize: 12,
      cornerStyle: 'circle',
      transparentCorners: false,
      padding: 5,
    } as any)
    fCanvas.value.add(rect)
  } else {
    // COCO segmentation is [x1, y1, x2, y2, ...]
    // Need to convert to [{x, y}, ...] for fabric.Polygon
    const points: {x: number, y: number}[] = []
    if (Array.isArray(ann.points)) {
      for (let i = 0; i < ann.points.length; i += 2) {
        if (typeof ann.points[i] === 'number' && typeof ann.points[i+1] === 'number') {
          points.push({ x: ann.points[i], y: ann.points[i+1] })
        }
      }
    }

    const poly = new Polygon(points.length > 0 ? points : (ann.points as any), {
      fill: `${ann.color}1A`, // 10% opacity
      stroke: ann.color,
      strokeWidth: 2,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: true,
      lockScalingFlip: true,
      hasControls: true,
      cornerColor: '#fff',
      cornerStrokeColor: ann.color,
      cornerSize: 12,
      cornerStyle: 'circle',
      transparentCorners: false,
      padding: 5,
      id: ann.id as any,
      labelId: ann.labelId as any,
      objectCaching: false,
    } as any)
    fCanvas.value.add(poly)
  }
}

const deleteAnnotation = (id: string) => {
  if (!fCanvas.value) return
  pushHistory()
  const obj = fCanvas.value.getObjects().find((o: any) => o.id === id)
  if (obj) {
    fCanvas.value.remove(obj)
    const currentAnns = images[currentImgIndex.value].annotations
    const index = currentAnns.findIndex(a => a.id === id)
    if (index !== -1) currentAnns.splice(index, 1)
    fCanvas.value.renderAll()
  }
}

// --- Highlighting Logic ---
const highlightAnnotation = (id: string | null) => {
  if (!fCanvas.value) return
  
  fCanvas.value.getObjects().forEach((obj: any) => {
    if (obj.id && obj.id.startsWith('ann_')) {
      if (obj.id === id) {
        // Apply glow effect
        obj.set({
          strokeWidth: 4,
          shadow: {
            color: obj.stroke,
            blur: 15,
            offsetX: 0,
            offsetY: 0
          }
        })
        // Only set active if not already active to avoid interfering with interactions
        if (fCanvas.value!.getActiveObject() !== obj) {
          fCanvas.value!.setActiveObject(obj)
        }
      } else {
        // Reset to normal
        obj.set({
          strokeWidth: 2,
          shadow: null
        })
      }
    }
  })
  fCanvas.value.renderAll()
}

watch(selectedId, (newId) => {
  highlightAnnotation(newId)
})

const resetZoom = () => {
  if (!viewerImageNatural.value) return
  viewerZoom.value = 1
  viewerPanX.value = 0
  viewerPanY.value = 0
  viewerRotationDeg.value = 0
  syncCanvasToViewer()
}


const isSaving = ref(false)
const saveAllChanges = async () => {
  if (!productId.value || !window.electronAPI) return
  const currentImg = images[currentImgIndex.value]
  if (!currentImg || !currentImg.fullPath) return

  isSaving.value = true
  try {
    const currentAnns = currentImg.annotations
    await window.electronAPI.saveAnnotations(
      productId.value,
      currentImg.fullPath,
      JSON.stringify(currentAnns)
    )
    setTimeout(() => {
      isSaving.value = false
    }, 1500)
  } catch (err) {
    console.error('Failed to save annotations:', err)
    alert(t('annotation.saveFailed'))
    isSaving.value = false
  }
}

const handleNextStep = async () => {
  await saveAllChanges()
  // Wait a bit for the "Saved" state to show, then move to training page
  setTimeout(async () => {
    const currentImg = images[currentImgIndex.value]
    if (!currentImg) return
    
    console.log('[Annotation] Going to training with:', {
      productId: productId.value,
      productName: productName.value,
      imagePath: currentImg.fullPath
    })
    
    router.push({
      path: '/training',
      query: {
        productId: productId.value,
        productName: productName.value,
        imagePath: currentImg.fullPath
      }
    })
  }, 1000)
}

const getAnnotationCount = () => {
  if (!images[currentImgIndex.value]) return 0
  return images[currentImgIndex.value].annotations.length
}

// Watch tool changes to update cursor
watch(activeTool, (tool) => {
  if (!fCanvas.value) return
  if (tool === 'select') fCanvas.value.defaultCursor = 'default'
  else fCanvas.value.defaultCursor = 'crosshair'
})

watch(activeLabelId, () => {
  const config = labelConfigs.find(c => c.id === activeLabelId.value)
  if (!config) {
    activeTool.value = 'select'
    return
  }
  activeTool.value = config.type
})

watch(showLabelPanel, async () => {
  await nextTick()
  window.setTimeout(() => {
    updateViewerViewportSize()
    syncCanvasToViewer()
  }, 320)
})

</script>

<template>
  <div class="flex h-screen bg-background text-foreground overflow-hidden font-sans flex-col">
    <AppHeader />

    <div class="flex-1 flex overflow-hidden">
      <!-- Narrow Left Toolbar -->
      <aside class="w-14 border-r bg-background flex flex-col items-center py-4 gap-4 z-50">
        <UiButton 
          variant="ghost" 
          size="icon" 
          class="h-10 w-10 rounded-xl transition-all"
          :class="{ 'bg-primary text-primary-foreground shadow-lg': showLabelPanel }"
          @click="showLabelPanel = !showLabelPanel"
          :title="t('annotation.labelManagement')"
        >
          <Palette class="h-5 w-5" />
        </UiButton>

        <Separator class="w-8" />

        <div class="mt-auto flex flex-col gap-2">
          <UiButton 
            variant="ghost" 
            size="icon" 
            class="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
            @click="resetZoom"
            :title="t('annotation.resetView')"
          >
            <Maximize class="h-5 w-5" />
          </UiButton>

          <UiButton 
            variant="ghost" 
            size="icon" 
            class="h-10 w-10 rounded-xl"
            @click="undo"
            :title="t('annotation.undo')"
          >
            <Undo2 class="h-5 w-5" />
          </UiButton>

          <UiButton 
            variant="ghost" 
            size="icon" 
            class="h-10 w-10 rounded-xl"
            @click="redo"
            :title="t('annotation.redo')"
          >
            <Redo2 class="h-5 w-5" />
          </UiButton>
          <Separator class="w-8" />
          <NuxtLink to="/">
            <UiButton variant="ghost" size="icon" class="h-10 w-10 rounded-xl" :title="t('annotation.tools.exit')">
              <ChevronLeft class="h-5 w-5" />
            </UiButton>
          </NuxtLink>
        </div>
      </aside>

      <!-- Expandable Label Sidebar -->
      <aside 
        class="border-r bg-muted/5 flex flex-col transition-all duration-300 ease-in-out overflow-hidden relative"
        :class="showLabelPanel ? 'w-56' : 'w-0'"
      >
        <div class="w-56 flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="h-14 border-b flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm shrink-0">
            <div class="flex items-center gap-2 font-bold text-sm tracking-tight">
              <span>{{ t('annotation.labelManagement') }}</span>
            </div>
            <UiButton variant="ghost" size="icon" class="h-7 w-7" @click="showLabelPanel = false">
              <ChevronLeft class="h-4 w-4" />
            </UiButton>
          </div>

          <!-- Label Scheme Selector -->
          <div class="p-3 border-b bg-muted/20 shrink-0">
            <div class="flex items-center justify-between mb-2 px-1">
              <span class="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{{ t('annotation.labelScheme') }}</span>
              <div class="flex items-center gap-1">
                <UiButton variant="ghost" size="icon" class="h-5 w-5 hover:bg-primary/10 hover:text-primary" @click="showSchemeModal = true" :title="t('annotation.labelScheme')">    
                  <BookOpen class="h-3 w-3" />
                </UiButton>
                <UiButton variant="ghost" size="icon" class="h-5 w-5 hover:bg-primary/10 hover:text-primary" @click="addNewLabel" :title="t('annotation.addLabel')">
                  <Plus class="h-3 w-3" />
                </UiButton>
              </div>
            </div>
            <UiSelect :model-value="schemeSelectValue" v-model:open="schemeSelectOpen" @update:model-value="onSchemeValueChange">
              <UiSelectTrigger class="h-8 px-2 py-1.5 rounded-lg shadow-sm text-xs font-medium w-full">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <UiSelectValue :placeholder="t('annotation.noSchemeSelected')" />
                </div>
              </UiSelectTrigger>
              <UiSelectContent class="w-[var(--radix-select-trigger-width)]">
                <UiSelectItem v-for="s in schemes" :key="s.id" :value="String(s.id)">{{ s.name }}</UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>

          <!-- Label List -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-2" @click.self="activeLabelId = null">
            <div class="space-y-2" @click.self="activeLabelId = null">
              <div 
                v-for="config in labelConfigs" 
                :key="config.id"
                class="group relative flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer border-1 overflow-hidden mr-1.5 ml-1.5"
                :class="[
                  activeLabelId === config.id 
                    ? 'shadow-md scale-[1.02] translate-x-1 z-10' 
                    : 'border-transparent hover:scale-[1.01]'
                ]"
                :style="{ 
                  borderColor: activeLabelId === config.id ? config.color : 'transparent',
                  backgroundColor: `${config.color}15`,
                  backdropFilter: 'blur(4px)'
                }"
                @click.stop="activeLabelId = config.id"
              >
                <!-- Type-based Marker -->
                <div 
                  class="absolute -left-[2px] -top-[2px] -bottom-[2px] w-5 transition-all duration-300 z-10"
                  :style="{ 
                    backgroundColor: config.color,
                    clipPath: config.type === 'rect'
                      ? (activeLabelId === config.id ? 'polygon(0 0, 100% 50%, 0 100%)' : 'polygon(0 0, 60% 50%, 0 100%)')
                      : (activeLabelId === config.id ? 'polygon(0 0, 100% 0, 25% 50%, 100% 100%, 0 100%)' : 'polygon(0 0, 70% 0, 15% 50%, 70% 100%, 0 100%)')
                  }"
                ></div>

                <div class="flex-1 min-w-0 ml-4">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold truncate transition-colors" :class="{ 'text-foreground': activeLabelId === config.id, 'text-muted-foreground': activeLabelId !== config.id }">
                      {{ config.name }}
                    </span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UiButton variant="ghost" size="icon" class="h-6 w-6 rounded-md" :title="t('annotation.edit')" @click.stop="editLabel(config)">
                        <Settings2 class="h-3.5 w-3.5" />
                      </UiButton>
                      <UiButton variant="ghost" size="icon" class="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive" :title="t('annotation.deleteLabel')" @click.stop="removeLabel(config.id)">
                        <Trash2 class="h-3.5 w-3.5" />
                      </UiButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Label Editing Overlay (Inside Sidebar) -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div 
            v-if="isEditingLabel"
            class="absolute inset-0 bg-background/95 backdrop-blur-md z-20 flex flex-col p-4"
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-sm font-bold tracking-tight">{{ isAddingMode ? t('annotation.addLabel') : t('annotation.editLabel') }}</h3>
              <UiButton variant="ghost" size="icon" class="h-8 w-8 rounded-full" @click="isEditingLabel = false">
                <ChevronLeft class="h-4 w-4" />
              </UiButton>
            </div>
            
            <div class="space-y-5 flex-1">
              <div class="space-y-2">
                <label class="text-[11px] font-bold uppercase text-muted-foreground ml-1">{{ t('annotation.labelName') }}</label>
                <UiInput v-model="editingLabel.name" class="h-9 bg-muted/30 focus-visible:ring-primary/30" />
              </div>
              
              <div class="space-y-2">
                <label class="text-[11px] font-bold uppercase text-muted-foreground ml-1">{{ t('annotation.labelType') }}</label>
                <div class="grid grid-cols-2 gap-2">
                  <UiButton
                    variant="outline"
                    size="sm"
                    class="h-9 gap-2"
                    :class="editingLabel.type === 'rect' ? 'border-primary bg-primary/5 text-primary' : ''"
                    @click="editingLabel.type = 'rect'"
                  >
                    <Square class="h-4 w-4" />
                    <span class="text-xs">{{ t('annotation.types.rect') }}</span>
                  </UiButton>
                  <UiButton
                    variant="outline"
                    size="sm"
                    class="h-9 gap-2"
                    :class="editingLabel.type === 'polygon' ? 'border-primary bg-primary/5 text-primary' : ''"
                    @click="editingLabel.type = 'polygon'"
                  >
                    <Hexagon class="h-4 w-4" />
                    <span class="text-xs">{{ t('annotation.types.polygon') }}</span>
                  </UiButton>
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="text-[11px] font-bold uppercase text-muted-foreground ml-1">{{ t('annotation.labelColor') }}</label>
                <div class="grid grid-cols-6 gap-2 p-1">
                  <button 
                    v-for="color in fullPalette" 
                    :key="color"
                    class="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 active:scale-95 shadow-sm relative overflow-hidden"
                    :class="[
                      editingLabel.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-transparent',
                      labelConfigs.some(l => l.color.toLowerCase() === color.toLowerCase() && l.id !== editingLabel.id) ? 'opacity-20 cursor-not-allowed grayscale-[0.5]' : ''
                    ]"
                    :style="{ backgroundColor: color }"
                    :disabled="labelConfigs.some(l => l.color.toLowerCase() === color.toLowerCase() && l.id !== editingLabel.id)"
                    @click="editingLabel.color = color"
                  >
                    <div v-if="labelConfigs.some(l => l.color.toLowerCase() === color.toLowerCase() && l.id !== editingLabel.id)" class="absolute inset-0 flex items-center justify-center">
                      <div class="w-full h-[2px] bg-white/50 rotate-45"></div>
                    </div>
                  </button>
                  
                  <div class="relative w-7 h-7 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors flex items-center justify-center cursor-pointer hover:bg-muted/50">
                    <Plus class="w-3 h-3 text-muted-foreground" />
                    <input 
                      type="color" 
                      class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      @change="handleAddColor"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <UiButton class="w-full mt-auto shadow-lg shadow-primary/20" @click="saveLabelConfig">
              {{ isAddingMode ? t('annotation.confirmAdd') : t('annotation.saveChanges') }}
            </UiButton>
          </div>
        </Transition>
      </aside>

      <!-- Middle: Main Canvas Area -->
      <main class="flex-1 flex flex-col relative bg-muted/20 overflow-hidden">
        <div ref="containerRef" class="flex-1 flex items-center justify-center overflow-hidden p-6 relative bg-black/5">
          <!-- Fabric Canvas Container -->
          <div ref="viewerViewportRef" class="w-full h-full relative overflow-hidden flex items-center justify-center rounded-lg bg-background/40 shadow-2xl">
            <canvas ref="canvasRef"></canvas>
          </div>
        </div>
      </main>

      <!-- Right Sidebar: Annotations List -->
      <aside class="w-72 border-l bg-background flex flex-col z-10">
        <div class="h-12 border-b flex items-center px-4 font-bold text-xs tracking-tight uppercase text-muted-foreground justify-between">
          <span>{{ t('annotation.currentAnnotations') }} ({{ getAnnotationCount() }})</span>
        </div>
        
        <div class="flex-1 overflow-auto p-3 space-y-2 bg-muted/5">
          <div v-if="getAnnotationCount() === 0" class="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <div class="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-2">
              <X class="w-5 h-5 opacity-20" />
            </div>
            <p class="text-xs">{{ t('annotation.noAnnotations') }}</p>
          </div>
          
          <div 
            v-for="ann in images[currentImgIndex]?.annotations" 
            :key="ann.id"
            class="group p-3 rounded-xl border-2 transition-all cursor-pointer bg-background shadow-sm"
            :class="selectedId === ann.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'"
            @click="selectedId = ann.id"
          >
            <div class="flex items-center gap-3">
              <div class="h-3 w-3 rounded-full shrink-0 shadow-sm" :style="{ backgroundColor: ann.color }"></div>
              <div class="flex-1 font-bold text-sm truncate">{{ ann.label }}</div>
              <UiButton 
                variant="ghost" 
                size="icon" 
                class="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" 
                @click.stop="deleteAnnotation(ann.id)"
              >
                <Trash2 class="h-4 w-4" />
              </UiButton>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <component :is="ann.type === 'rect' ? Square : Hexagon" class="h-3 w-3 text-muted-foreground" />
              <span class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{{ t(`annotation.types.${ann.type}`) }}</span>
            </div>
          </div>
        </div>

        <!-- Bottom fixed buttons -->
        <div class="p-4 border-t bg-background mt-auto space-y-2">
          <div v-if="currentImgIndex < images.length - 1" class="flex gap-2">
            <UiButton 
              variant="outline" 
              class="flex-1 gap-2 h-10"
              @click="goToNextImage"
              :disabled="isSaving"
            >
              <ChevronRight class="h-4 w-4" />
              {{ t('annotation.nextImage') || '下一张' }}
            </UiButton>
          </div>
          <UiButton 
            variant="default" 
            class="w-full gap-2 h-10 shadow-lg shadow-primary/20"
            :title="t('annotation.tools.nextStep')"
            @click="handleNextStep"
            :disabled="isSaving"
          >
            <template v-if="isSaving">
              <Check class="h-4 w-4" />
              {{ t('annotation.saveSuccess') }}
            </template>
            <template v-else>
              <ChevronRight class="h-4 w-4" />
              {{ t('annotation.tools.nextStep') }}
            </template>
          </UiButton>
        </div>
      </aside>
    </div>
    <!-- Scheme Selection Modal -->
    <div v-if="showSchemeModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <UiCardHeader class="pb-2">
          <UiCardTitle class="text-lg flex items-center gap-2">
            <BookOpen class="h-5 w-5 text-primary" />
            {{ t('annotation.schemes.title') }}
          </UiCardTitle>
          <UiCardDescription>
            {{ t('annotation.schemes.boundTo', { name: productName || productId }) }}
          </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="py-4 space-y-4">
          <!-- Create New Scheme -->
          <div v-if="isCreatingScheme" class="space-y-3 p-3 rounded-lg border bg-muted/30">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase text-muted-foreground">{{ t('annotation.schemes.name') }}</label>
              <UiInput v-model="newSchemeName" :placeholder="t('annotation.schemes.namePlaceholder')" class="h-9" @keyup.enter="createScheme" />
            </div>
            <div class="flex gap-2">
              <UiButton variant="outline" size="sm" class="flex-1" @click="isCreatingScheme = false">{{ t('annotation.cancel') }}</UiButton>
              <UiButton size="sm" class="flex-1" :disabled="!newSchemeName.trim()" @click="createScheme">{{ t('annotation.schemes.confirmCreate') }}</UiButton>
            </div>
          </div>
          <UiButton v-else variant="outline" class="w-full border-dashed gap-2" @click="isCreatingScheme = true">
            <Plus class="h-4 w-4" />
            {{ t('annotation.schemes.create') }}
          </UiButton>

          <Separator />

          <!-- Scheme List -->
          <div v-if="schemes.length > 0" class="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto pr-2">
            <div 
              v-for="scheme in schemes" 
              :key="scheme.id"
              class="group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5"
              :class="activeSchemeId === scheme.id ? 'border-primary bg-primary/10' : 'border-border'"
              @click="bindScheme(scheme.id)"
            >
              <div class="flex-1">
                <div class="font-bold text-sm">{{ scheme.name }}</div>
                <div class="text-[10px] text-muted-foreground mt-1 truncate max-w-[200px]">
                  {{ t('annotation.schemes.templateCount', { count: JSON.parse(scheme.config).labels.length }) }}
                </div>
              </div>
              <div class="flex items-center gap-1">
                <Check v-if="activeSchemeId === scheme.id" class="h-4 w-4 text-primary" />
                <UiButton
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  @click.stop="openDeleteSchemeModal(scheme)"
                >
                  <Trash2 class="h-4 w-4" />
                </UiButton>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-muted-foreground">
            <div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen class="h-6 w-6 opacity-20" />
            </div>
            <p class="text-xs">{{ t('annotation.schemes.noSchemes') }}</p>
          </div>
        </UiCardContent>

        <UiCardFooter class="pt-2">
          <UiButton variant="outline" class="w-full" @click="showSchemeModal = false" :disabled="!activeSchemeId">{{ t('annotation.schemes.close') }}</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>

    <div v-if="showDeleteSchemeModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <UiCard class="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 border-destructive/20">
        <UiCardHeader class="pb-2">
          <UiCardTitle class="text-lg flex items-center gap-2 text-destructive">
            <Trash2 class="h-5 w-5" />
            {{ t('annotation.schemes.deleteTitle') }}
          </UiCardTitle>
          <UiCardDescription>
            {{ t('annotation.schemes.deleteConfirm', { name: schemeToDelete?.name }) }}
          </UiCardDescription>
        </UiCardHeader>

        <UiCardFooter class="pt-2 flex gap-2 w-full">
          <UiButton variant="outline" class="flex-1" @click="showDeleteSchemeModal = false">{{ t('annotation.cancel') }}</UiButton>
          <UiButton variant="destructive" class="flex-1" @click="confirmDeleteScheme">{{ t('annotation.delete') }}</UiButton>
        </UiCardFooter>
      </UiCard>
    </div>
  </div>
</template>

<style scoped>
.canvas-container {
  margin: 0 auto;
  user-select: none;
}

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

kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
