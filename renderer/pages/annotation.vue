<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
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
watch(activeSchemeId, () => {
  schemeSelectValue.value = activeSchemeId.value ? String(activeSchemeId.value) : ''
}, { immediate: true })

const onSchemeValueChange = async (value: string) => {
  schemeSelectValue.value = value
  if (!schemeSelectValue.value) return
  await bindScheme(Number(schemeSelectValue.value))
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
      // Auto-select first label if available
      if (labelConfigs.length > 0) {
        activeLabelId.value = labelConfigs[0].id
        activeTool.value = labelConfigs[0].type
      }
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

// --- Label Config State ---
const labelConfigs = reactive<LabelConfig[]>([
  { id: '1', name: 'Label A', type: 'rect', color: '#3b82f6' },
  { id: '2', name: 'Label B', type: 'polygon', color: '#ef4444' },
  { id: '3', name: 'Label C', type: 'rect', color: '#10b981' },
])
const activeLabelId = ref<string | null>(null)

// --- Label Management ---
const isEditingLabel = ref(false)
const editingLabel = reactive<LabelConfig>({
  id: '',
  name: '',
  type: 'rect',
  color: '#3b82f6'
})

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
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  
  const newLabel: LabelConfig = {
    id: newId,
    name: `New Label ${labelConfigs.length + 1}`,
    type: 'rect',
    color: randomColor
  }
  labelConfigs.push(newLabel)
  
  // Save to DB immediately
  if (activeSchemeId.value && window.electronAPI) {
    await window.electronAPI.saveScheme({
      id: activeSchemeId.value,
      config: JSON.stringify({ labels: labelConfigs })
    })
  }

  editLabel(newLabel)
}

const editLabel = (config: LabelConfig) => {
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

    // If we have an active scheme, update it in DB
    if (activeSchemeId.value && window.electronAPI) {
      await window.electronAPI.saveScheme({
        id: activeSchemeId.value,
        config: JSON.stringify({ labels: labelConfigs })
      })
    }

    if (activeLabelId.value === editingLabel.id) {
      activeTool.value = editingLabel.type
    }

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
        config: JSON.stringify({ labels: labelConfigs })
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

  // Load all images for this product
  if (productId.value && window.electronAPI) {
    const productImages = await window.electronAPI.getProductImages(productId.value)
    if (productImages && productImages.length > 0) {
      images.splice(0, images.length) // Clear existing demo images
      
      // Normalize function for path comparison
      const normalize = (p: string) => p.replace(/\\/g, '/').toLowerCase()
      const targetPath = imagePath.value ? normalize(imagePath.value) : ''

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
    })

    initCanvasEvents()
    if (images.length > 0) {
      loadImage(currentImgIndex.value)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    
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

onUnmounted(() => {
  if (fCanvas.value) {
    fCanvas.value.dispose()
  }
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
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
  
  // Fabric.js viewportTransform: [scaleX, skewY, skewX, scaleY, translateX, translateY]
  // We need to apply scale, rotation and translation
  // For rotation, it's more complex with viewportTransform. 
  // Let's simplify: Fabric canvas stays at viewport size, we transform objects? 
  // No, better to transform the whole viewport.
  
  const a = cos * s
  const b = sin * s
  const c = -sin * s
  const d = cos * s
  const tx = cx + viewerPanX.value
  const ty = cy + viewerPanY.value
  
  // We also need to account for the fact that (0,0) in our logical image is its center.
  // In Fabric, objects are relative to canvas (0,0).
  // Our viewer layout uses translate(-50%, -50%) which means image center is at (tx, ty).
  
  fCanvas.value.viewportTransform = [a, b, c, d, tx, ty]
  fCanvas.value.renderAll()
}

const initCanvasEvents = () => {
  if (!fCanvas.value) return

  fCanvas.value.on('mouse:down', (opt) => {
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
        strokeWidth: 2 / viewerScale.value, // Keep stroke consistent regardless of zoom
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
      points: [tempObj.left, tempObj.top, tempObj.width, tempObj.height],
      color
    }
    fCanvas.value.remove(tempObj)
    
    const rect = new Rect({
      left: tempObj.left,
      top: tempObj.top,
      width: tempObj.width,
      height: tempObj.height,
      fill: `${color}1A`, // 10% opacity
      stroke: color,
      strokeWidth: 2,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
      id: id as any,
      labelId: config.id as any,
      cornerColor: '#fff',
      cornerStrokeColor: color,
      cornerSize: 8,
      transparentCorners: false,
    } as any)
    fCanvas.value.add(rect)
    fCanvas.value.setActiveObject(rect)
  } else if (activeTool.value === 'polygon' && polygonPoints.length >= 3) {
    newAnn = {
      id,
      type: 'polygon',
      labelId: config.id,
      label: config.name,
      points: polygonPoints.map(p => ({ x: p.x, y: p.y })),
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
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
      id: id as any,
      labelId: config.id as any,
      objectCaching: false,
    } as any)
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
  // Keep the same tool if drawing multiple
  // activeTool.value = 'select' 
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
    
    // Position image at 0,0 with center origin
    img.set({
      left: 0,
      top: 0,
      originX: 'center',
      originY: 'center',
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
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
      id: ann.id as any,
      labelId: ann.labelId as any,
      cornerColor: '#fff',
      cornerStrokeColor: ann.color,
      cornerSize: 8,
      transparentCorners: false,
    } as any)
    fCanvas.value.add(rect)
  } else {
    const poly = new Polygon(ann.points, {
      fill: `${ann.color}1A`, // 10% opacity
      stroke: ann.color,
      strokeWidth: 2,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
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
        fCanvas.value!.setActiveObject(obj)
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

const changeImage = async (dir: number) => {
  const next = currentImgIndex.value + dir
  if (next >= 0 && next < images.length) {
    currentImgIndex.value = next
    undoStack.length = 0
    redoStack.length = 0
    selectedId.value = null
    loadImage(next)
  }
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
    alert('保存失败')
    isSaving.value = false
  }
}

// Watch for changes to current image's annotations and auto-save (optional)
// watch(() => images[currentImgIndex.value]?.annotations, () => {
//   saveAllChanges()
// }, { deep: true })

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
  if (!config) return
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
    <!-- Top Header -->
    <header class="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 z-20">
      <div class="flex items-center gap-4">
        <NuxtLink to="/">
          <UiButton variant="ghost" size="icon" :title="t('annotation.tools.exit')">
            <ChevronLeft class="h-5 w-5" />
          </UiButton>
        </NuxtLink>
        <div class="h-6 w-[1px] bg-border"></div>
        <h1 class="text-sm font-semibold truncate max-w-[200px]">{{ images[currentImgIndex]?.name }}</h1>
      </div>

      <div class="flex items-center gap-2">
        <UiButton 
          variant="ghost" 
          size="icon" 
          @click="changeImage(-1)" 
          :disabled="currentImgIndex === 0"
        >
          <ChevronLeft class="h-5 w-5" />
        </UiButton>
        <span class="text-xs font-medium min-w-[40px] text-center">
          {{ currentImgIndex + 1 }} / {{ images.length }}
        </span>
        <UiButton 
          variant="ghost" 
          size="icon" 
          @click="changeImage(1)" 
          :disabled="currentImgIndex === images.length - 1"
        >
          <ChevronRight class="h-5 w-5" />
        </UiButton>

        <div class="h-6 w-[1px] bg-border mx-1"></div>

        <UiButton 
          variant="default" 
          size="sm" 
          class="gap-2 min-w-[100px]"
          :title="t('annotation.tools.saveChanges')"
          @click="saveAllChanges"
          :disabled="isSaving"
        >
          <template v-if="isSaving">
            <Check class="h-4 w-4" />
            已保存
          </template>
          <template v-else>
            <Save class="h-4 w-4" />
            {{ t('annotation.tools.saveChanges') }}
          </template>
        </UiButton>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- Narrow Left Toolbar -->
      <aside class="w-14 border-r bg-background flex flex-col items-center py-4 gap-4 z-50">
        <UiButton 
          variant="ghost" 
          size="icon" 
          class="h-10 w-10 rounded-xl transition-all"
          :class="{ 'bg-primary text-primary-foreground shadow-lg': showLabelPanel }"
          @click="showLabelPanel = !showLabelPanel"
          title="标签管理"
        >
          <Palette class="h-5 w-5" />
        </UiButton>

        <Separator class="w-8" />

        <div class="flex flex-col gap-2">
          <UiButton 
            variant="ghost" 
            size="icon" 
            class="h-10 w-10 rounded-xl"
            @click="undo"
            title="撤销"
          >
            <Undo2 class="h-5 w-5" />
          </UiButton>

          <UiButton 
            variant="ghost" 
            size="icon" 
            class="h-10 w-10 rounded-xl"
            @click="redo"
            title="重做"
          >
            <Redo2 class="h-5 w-5" />
          </UiButton>
        </div>

        <div class="mt-auto">
          <UiButton 
            variant="ghost" 
            size="icon" 
            class="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
            @click="resetZoom"
            title="重置视图"
          >
            <Maximize class="h-5 w-5" />
          </UiButton>
        </div>
      </aside>

      <!-- Expandable Label Sidebar -->
      <aside 
        class="border-r bg-muted/5 flex flex-col transition-all duration-300 ease-in-out overflow-hidden relative"
        :class="showLabelPanel ? 'w-64' : 'w-0'"
      >
        <div class="w-64 flex flex-col h-full">
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
              <span class="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">标注方案</span>
              <div class="flex items-center gap-1">
                <UiButton variant="ghost" size="icon" class="h-5 w-5 hover:bg-primary/10 hover:text-primary" @click="showSchemeModal = true" title="方案管理">
                  <BookOpen class="h-3 w-3" />
                </UiButton>
                <UiButton variant="ghost" size="icon" class="h-5 w-5 hover:bg-primary/10 hover:text-primary" @click="addNewLabel" title="新增标签">
                  <Plus class="h-3 w-3" />
                </UiButton>
              </div>
            </div>
            <UiSelect :model-value="schemeSelectValue" @update:model-value="onSchemeValueChange">
              <UiSelectTrigger class="h-8 px-2 py-1.5 rounded-lg shadow-sm text-xs font-medium">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <UiSelectValue placeholder="未选择方案" />
                </div>
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem v-for="s in schemes" :key="s.id" :value="String(s.id)">{{ s.name }}</UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>

          <!-- Label List -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div class="space-y-1">
              <div 
                v-for="config in labelConfigs" 
                :key="config.id"
                class="group relative flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer border border-transparent"
                :class="[
                  activeLabelId === config.id 
                    ? 'bg-primary/10 border-primary/20 shadow-sm' 
                    : 'hover:bg-accent/50'
                ]"
                @click="activeLabelId = config.id"
              >
                <div 
                  class="w-3 h-3 rounded-sm shrink-0 shadow-inner" 
                  :style="{ backgroundColor: config.color }"
                ></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium truncate" :class="{ 'text-primary': activeLabelId === config.id }">
                      {{ config.name }}
                    </span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UiButton variant="ghost" size="icon" class="h-6 w-6" title="编辑" @click.stop="editLabel(config)">
                        <Settings2 class="h-3.5 w-3.5" />
                      </UiButton>
                      <UiButton variant="ghost" size="icon" class="h-6 w-6 hover:bg-destructive/10 hover:text-destructive" title="删除" @click.stop="removeLabel(config.id)">
                        <Trash2 class="h-3.5 w-3.5" />
                      </UiButton>
                    </div>
                  </div>
                </div>
                
                <!-- Active Indicator -->
                <div 
                  v-if="activeLabelId === config.id"
                  class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full"
                ></div>
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
              <h3 class="text-sm font-bold tracking-tight">编辑标签</h3>
              <UiButton variant="ghost" size="icon" class="h-8 w-8 rounded-full" @click="isEditingLabel = false">
                <ChevronLeft class="h-4 w-4" />
              </UiButton>
            </div>
            
            <div class="space-y-5 flex-1">
              <div class="space-y-2">
                <label class="text-[11px] font-bold uppercase text-muted-foreground ml-1">标签名称</label>
                <UiInput v-model="editingLabel.name" class="h-9 bg-muted/30 focus-visible:ring-primary/30" />
              </div>
              
              <div class="space-y-2">
                <label class="text-[11px] font-bold uppercase text-muted-foreground ml-1">标签类型</label>
                <div class="grid grid-cols-2 gap-2">
                  <UiButton
                    variant="outline"
                    size="sm"
                    class="h-9 gap-2"
                    :class="editingLabel.type === 'rect' ? 'border-primary bg-primary/5 text-primary' : ''"
                    @click="editingLabel.type = 'rect'"
                  >
                    <Square class="h-4 w-4" />
                    <span class="text-xs">矩形</span>
                  </UiButton>
                  <UiButton
                    variant="outline"
                    size="sm"
                    class="h-9 gap-2"
                    :class="editingLabel.type === 'polygon' ? 'border-primary bg-primary/5 text-primary' : ''"
                    @click="editingLabel.type = 'polygon'"
                  >
                    <Hexagon class="h-4 w-4" />
                    <span class="text-xs">多边形</span>
                  </UiButton>
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="text-[11px] font-bold uppercase text-muted-foreground ml-1">标签颜色</label>
                <div class="grid grid-cols-5 gap-2 p-1">
                  <button 
                    v-for="color in ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#444']" 
                    :key="color"
                    class="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 active:scale-95 shadow-sm"
                    :class="editingLabel.color === color ? 'border-primary' : 'border-transparent'"
                    :style="{ backgroundColor: color }"
                    @click="editingLabel.color = color"
                  ></button>
                </div>
              </div>
            </div>
            
            <UiButton class="w-full mt-auto shadow-lg shadow-primary/20" @click="saveLabelConfig">
              保存更改
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
              <Check v-if="activeSchemeId === scheme.id" class="h-4 w-4 text-primary" />
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
  </div>
</template>

<style scoped>
.canvas-container {
  margin: 0 auto;
  user-select: none;
}

kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
