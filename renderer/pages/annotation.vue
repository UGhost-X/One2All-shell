<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted, watch } from 'vue'
import { Canvas, Rect, Polygon, FabricImage, Point, Line, Circle, Textbox, ActiveSelection } from 'fabric'
import { 
  Square, 
  Hexagon, 
  MousePointer2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Download,
  Crosshair,
  Move
} from 'lucide-vue-next'

// --- Types ---
interface Annotation {
  id: string
  type: 'rect' | 'polygon'
  label: string
  points: any[] 
  color: string
}

interface ImageData {
  url: string
  name: string
  annotations: Annotation[]
}

// --- State ---
const canvasRef = ref<HTMLCanvasElement | null>(null)
let fCanvas: Canvas | null = null

const { t, locale, setLocale } = useI18n()

const toggleLocale = () => {
  const nextLocale = locale.value === 'zh' ? 'en' : 'zh'
  setLocale(nextLocale)
}

const activeTool = ref<'select' | 'rect' | 'polygon' | 'pan'>('select')
const images = reactive<ImageData[]>([
  { 
    url: 'https://picsum.photos/id/237/800/600', 
    name: 'dog.jpg',
    annotations: [] 
  },
  { 
    url: 'https://picsum.photos/id/238/800/600', 
    name: 'city.jpg',
    annotations: [] 
  },
  { 
    url: 'https://picsum.photos/id/239/800/600', 
    name: 'mountain.jpg',
    annotations: [] 
  }
])
const currentImgIndex = ref(0)
const zoomLevel = ref(1)
const selectedId = ref<string | null>(null)
const isShowCrosshair = ref(true)
const isDraggingCanvas = ref(false)

// --- Drawing State ---
let isDrawing = false
let startPoint: Point | null = null
let tempObj: any = null
let polygonPoints: Point[] = []
let activeLine: Line | null = null
let tempPoints: Circle[] = []
let tempLines: Line[] = []
let lastPosX = 0
let lastPosY = 0

// --- Initialization ---
onMounted(() => {
  if (canvasRef.value) {
    fCanvas = new Canvas(canvasRef.value, {
      width: 800,
      height: 600,
      backgroundColor: '#f0f0f0',
      selection: true,
    })

    initCanvasEvents()
    loadImage(images[currentImgIndex.value].url)
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (fCanvas) {
    fCanvas.dispose()
  }
  window.removeEventListener('keydown', handleKeyDown)
})

// --- Methods ---

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedId.value) {
      deleteAnnotation(selectedId.value)
    }
  } else if (e.key === 'w' || e.key === 'W') {
    activeTool.value = 'rect'
  } else if (e.key === 'p' || e.key === 'P') {
    activeTool.value = 'polygon'
  } else if (e.key === 'v' || e.key === 'V') {
    activeTool.value = 'select'
  } else if (e.key === 'h' || e.key === 'H') {
    activeTool.value = 'pan'
  } else if (e.key === 'Escape') {
    cancelDrawing()
  }
}

const cancelDrawing = () => {
  isDrawing = false
  if (tempObj) fCanvas?.remove(tempObj)
  tempPoints.forEach(p => fCanvas?.remove(p))
  tempLines.forEach(l => fCanvas?.remove(l))
  if (activeLine) fCanvas?.remove(activeLine)
  
  tempPoints = []
  tempLines = []
  polygonPoints = []
  activeLine = null
  tempObj = null
  activeTool.value = 'select'
  fCanvas?.renderAll()
}

const initCanvasEvents = () => {
  if (!fCanvas) return

  fCanvas.on('mouse:down', (opt) => {
    const pointer = fCanvas!.getScenePoint(opt.e)
    
    if (activeTool.value === 'pan') {
      isDraggingCanvas.value = true
      fCanvas!.selection = false
      lastPosX = (opt.e as MouseEvent).clientX
      lastPosY = (opt.e as MouseEvent).clientY
      return
    }

    if (activeTool.value === 'rect') {
      isDrawing = true
      startPoint = pointer
      tempObj = new Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: 'rgba(59, 130, 246, 0.2)',
        stroke: '#3b82f6',
        strokeWidth: 2,
        selectable: false,
      })
      fCanvas!.add(tempObj)
    } else if (activeTool.value === 'polygon') {
      isDrawing = true
      const point = new Point(pointer.x, pointer.y)
      polygonPoints.push(point)
      
      const circle = new Circle({
        left: pointer.x - 4,
        top: pointer.y - 4,
        radius: 4,
        fill: '#3b82f6',
        stroke: '#fff',
        strokeWidth: 1,
        selectable: false,
        evented: false
      })
      tempPoints.push(circle)
      fCanvas!.add(circle)

      if (polygonPoints.length > 1) {
        const line = new Line([
          polygonPoints[polygonPoints.length - 2].x,
          polygonPoints[polygonPoints.length - 2].y,
          polygonPoints[polygonPoints.length - 1].x,
          polygonPoints[polygonPoints.length - 1].y
        ], {
          stroke: '#3b82f6',
          strokeWidth: 2,
          selectable: false,
          evented: false
        })
        tempLines.push(line)
        fCanvas!.add(line)
      }

      // Create or update the active line that follows the mouse
      if (activeLine) fCanvas!.remove(activeLine)
      activeLine = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: '#3b82f6',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false
      })
      fCanvas!.add(activeLine)
    }
  })

  fCanvas.on('mouse:move', (opt) => {
    if (!fCanvas) return
    const pointer = fCanvas.getScenePoint(opt.e)

    if (isDraggingCanvas.value) {
      const e = opt.e
      const vpt = fCanvas.viewportTransform
      vpt[4] += (e as MouseEvent).clientX - lastPosX
      vpt[5] += (e as MouseEvent).clientY - lastPosY    
      fCanvas.requestRenderAll()
      lastPosX = (e as MouseEvent).clientX
      lastPosY = (e as MouseEvent).clientY
      return
    }

    // Update crosshair if enabled
    // (Custom crosshair logic could go here)

    if (!isDrawing) return

    if (activeTool.value === 'rect' && startPoint && tempObj) {
      const width = pointer.x - startPoint.x
      const height = pointer.y - startPoint.y
      tempObj.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width > 0 ? startPoint.x : pointer.x,
        top: height > 0 ? startPoint.y : pointer.y,
      })
      fCanvas.renderAll()
    } else if (activeTool.value === 'polygon' && activeLine) {
      activeLine.set({ x2: pointer.x, y2: pointer.y })
      fCanvas.renderAll()
    }
  })

  fCanvas.on('mouse:up', (opt) => {
    if (activeTool.value === 'pan') {
      isDraggingCanvas.value = false
      fCanvas!.selection = true
      return
    }

    if (activeTool.value === 'rect' && isDrawing) {
      if (tempObj && (tempObj.width > 5 || tempObj.height > 5)) {
        finishDrawing()
      } else {
        cancelDrawing()
      }
    }
  })

  fCanvas.on('mouse:dblclick', () => {
    if (activeTool.value === 'polygon' && isDrawing && polygonPoints.length >= 3) {
      finishDrawing()
    }
  })

  fCanvas.on('selection:created', (e) => {
    const obj = e.selected?.[0] as any
    if (obj && obj.id) {
      selectedId.value = obj.id
    }
  })

  fCanvas.on('selection:updated', (e) => {
    const obj = e.selected?.[0] as any
    if (obj && obj.id) {
      selectedId.value = obj.id
    }
  })

  fCanvas.on('selection:cleared', () => {
    selectedId.value = null
  })
}

const finishDrawing = () => {
  if (!fCanvas) return
  isDrawing = false

  const id = `ann_${Date.now()}`
  let newAnn: Annotation | null = null
  const color = '#3b82f6'

  if (activeTool.value === 'rect' && tempObj) {
    newAnn = {
      id,
      type: 'rect',
      label: t('annotation.defaultLabel'),
      points: [tempObj.left, tempObj.top, tempObj.width, tempObj.height],
      color
    }
    fCanvas.remove(tempObj)
    
    const rect = new Rect({
      left: tempObj.left,
      top: tempObj.top,
      width: tempObj.width,
      height: tempObj.height,
      fill: 'rgba(59, 130, 246, 0.1)',
      stroke: color,
      strokeWidth: 2,
      id: id as any,
      cornerColor: '#fff',
      cornerStrokeColor: color,
      cornerSize: 8,
      transparentCorners: false,
    } as any)
    fCanvas.add(rect)
    fCanvas.setActiveObject(rect)
  } else if (activeTool.value === 'polygon' && polygonPoints.length >= 3) {
    newAnn = {
      id,
      type: 'polygon',
      label: t('annotation.defaultLabel'),
      points: polygonPoints.map(p => ({ x: p.x, y: p.y })),
      color
    }
    
    // Clear temp items
    tempPoints.forEach(p => fCanvas!.remove(p))
    tempLines.forEach(l => fCanvas!.remove(l))
    if (activeLine) fCanvas!.remove(activeLine)
    
    const poly = new Polygon(polygonPoints, {
      fill: 'rgba(59, 130, 246, 0.1)',
      stroke: color,
      strokeWidth: 2,
      id: id as any,
      objectCaching: false,
    } as any)
    fCanvas.add(poly)
    fCanvas.setActiveObject(poly)
    
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
  activeTool.value = 'select'
  fCanvas.renderAll()
}

const loadImage = (url: string) => {
  if (!fCanvas) return
  fCanvas.clear()
  FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
    img.selectable = false
    img.evented = false
    fCanvas!.add(img)
    fCanvas!.centerObject(img)
    
    // Re-draw existing annotations for this image
    const currentAnns = images[currentImgIndex.value].annotations
    currentAnns.forEach(ann => drawAnnotation(ann))
    
    fCanvas!.renderAll()
  })
}

const drawAnnotation = (ann: Annotation) => {
  if (!fCanvas) return
  if (ann.type === 'rect') {
    const rect = new Rect({
      left: ann.points[0],
      top: ann.points[1],
      width: ann.points[2],
      height: ann.points[3],
      fill: 'rgba(59, 130, 246, 0.1)',
      stroke: ann.color,
      strokeWidth: 2,
      id: ann.id as any,
    } as any)
    fCanvas.add(rect)
  } else {
    const poly = new Polygon(ann.points, {
      fill: 'rgba(59, 130, 246, 0.1)',
      stroke: ann.color,
      strokeWidth: 2,
      id: ann.id as any,
      objectCaching: false,
    } as any)
    fCanvas.add(poly)
  }
}

const deleteAnnotation = (id: string) => {
  if (!fCanvas) return
  const obj = fCanvas.getObjects().find((o: any) => o.id === id)
  if (obj) {
    fCanvas.remove(obj)
    const currentAnns = images[currentImgIndex.value].annotations
    const index = currentAnns.findIndex(a => a.id === id)
    if (index !== -1) currentAnns.splice(index, 1)
    fCanvas.renderAll()
  }
}

const handleZoom = (delta: number) => {
  if (!fCanvas) return
  let newZoom = fCanvas.getZoom() + delta
  if (newZoom > 10) newZoom = 10
  if (newZoom < 0.1) newZoom = 0.1
  
  const center = fCanvas.getCenterPoint()
  fCanvas.zoomToPoint(center, newZoom)
  zoomLevel.value = newZoom
}

const resetZoom = () => {
  if (!fCanvas) return
  fCanvas.setZoom(1)
  zoomLevel.value = 1
  fCanvas.viewportTransform = [1, 0, 0, 1, 0, 0]
  fCanvas.centerObject(fCanvas.getObjects('image')[0])
  fCanvas.renderAll()
}

const changeImage = (dir: number) => {
  const next = currentImgIndex.value + dir
  if (next >= 0 && next < images.length) {
    currentImgIndex.value = next
    loadImage(images[next].url)
  }
}

const getAnnotationCount = () => {
  return images[currentImgIndex.value].annotations.length
}

// Watch tool changes to update cursor
watch(activeTool, (tool) => {
  if (!fCanvas) return
  if (tool === 'select') fCanvas.defaultCursor = 'default'
  else if (tool === 'pan') fCanvas.defaultCursor = 'grab'
  else fCanvas.defaultCursor = 'crosshair'
})

</script>

<template>
  <div class="flex h-screen bg-background text-foreground overflow-hidden font-sans">
    <!-- Left Toolbar -->
    <aside class="w-14 border-r bg-muted/30 flex flex-col items-center py-4 gap-3 z-10">
      <div class="mb-4 flex items-center justify-center">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">A</div>
      </div>
      
      <UiButton 
        variant="ghost" 
        size="icon" 
        :class="{ 'bg-primary/10 text-primary shadow-sm': activeTool === 'select' }"
        @click="activeTool = 'select'"
        :title="t('annotation.tools.select')"
      >
        <MousePointer2 class="h-5 w-5" />
      </UiButton>
      
      <UiButton 
        variant="ghost" 
        size="icon" 
        :class="{ 'bg-primary/10 text-primary shadow-sm': activeTool === 'rect' }"
        @click="activeTool = 'rect'"
        :title="t('annotation.tools.rect')"
      >
        <Square class="h-5 w-5" />
      </UiButton>
      
      <UiButton 
        variant="ghost" 
        size="icon" 
        :class="{ 'bg-primary/10 text-primary shadow-sm': activeTool === 'polygon' }"
        @click="activeTool = 'polygon'"
        :title="t('annotation.tools.polygon')"
      >
        <Hexagon class="h-5 w-5" />
      </UiButton>

      <UiButton 
        variant="ghost" 
        size="icon" 
        :class="{ 'bg-primary/10 text-primary shadow-sm': activeTool === 'pan' }"
        @click="activeTool = 'pan'"
        :title="t('annotation.tools.pan')"
      >
        <Move class="h-5 w-5" />
      </UiButton>

      <div class="border-t w-8 my-1 opacity-50"></div>

      <UiButton variant="ghost" size="icon" @click="handleZoom(0.2)" :title="t('annotation.tools.zoomIn')">
        <ZoomIn class="h-5 w-5" />
      </UiButton>
      
      <UiButton variant="ghost" size="icon" @click="handleZoom(-0.2)" :title="t('annotation.tools.zoomOut')">
        <ZoomOut class="h-5 w-5" />
      </UiButton>
      
      <UiButton variant="ghost" size="icon" @click="resetZoom" :title="t('annotation.tools.resetView')">
        <RotateCcw class="h-5 w-5" />
      </UiButton>

      <div class="border-t w-8 my-1 opacity-50"></div>

      <UiButton 
        variant="ghost" 
        size="icon" 
        :class="{ 'text-primary': isShowCrosshair }"
        @click="isShowCrosshair = !isShowCrosshair"
        :title="t('annotation.tools.toggleCrosshair')"
      >
        <Crosshair class="h-5 w-5" />
      </UiButton>

      <div class="mt-auto flex flex-col gap-3">
        <UiButton variant="ghost" size="icon" :title="t('annotation.tools.saveChanges')">
          <Save class="h-5 w-5 text-green-600" />
        </UiButton>
        <NuxtLink to="/">
          <UiButton variant="ghost" size="icon" :title="t('annotation.tools.exit')">
            <ChevronLeft class="h-5 w-5" />
          </UiButton>
        </NuxtLink>
      </div>
    </aside>

    <!-- Canvas Area -->
    <main class="flex-1 flex flex-col relative overflow-hidden bg-[#e5e7eb]">
      <header class="h-12 border-b bg-background flex items-center px-6 justify-between shadow-sm z-10">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <UiButton variant="outline" size="icon" class="h-8 w-8" @click="changeImage(-1)" :disabled="currentImgIndex === 0">
              <ChevronLeft class="h-4 w-4" />
            </UiButton>
            <span class="text-sm font-semibold min-w-[100px] text-center">
              {{ images[currentImgIndex].name }} 
              <span class="text-muted-foreground font-normal">({{ currentImgIndex + 1 }}/{{ images.length }})</span>
            </span>
            <UiButton variant="outline" size="icon" class="h-8 w-8" @click="changeImage(1)" :disabled="currentImgIndex === images.length - 1">
              <ChevronRight class="h-4 w-4" />
            </UiButton>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <UiButton variant="ghost" size="sm" @click="toggleLocale">
              {{ locale === 'zh' ? '中文' : 'English' }}
            </UiButton>
          </div>
          <div class="text-xs font-mono bg-muted px-2 py-1 rounded">
            {{ t('annotation.zoom') }}: {{ Math.round(zoomLevel * 100) }}%
          </div>
          <UiButton variant="default" size="sm" class="h-8 gap-2">
            <Download class="h-3.5 w-3.5" /> {{ t('annotation.exportData') }}
          </UiButton>
        </div>
      </header>
      
      <div class="flex-1 flex items-center justify-center overflow-hidden relative">
        <!-- Crosshair implementation (optional, could be done with CSS or another canvas layer) -->
        <div v-if="isShowCrosshair && activeTool !== 'select'" class="pointer-events-none absolute inset-0 z-0">
          <!-- Horizontal line -->
          <!-- <div class="absolute w-full h-px bg-primary/30 top-1/2"></div> -->
          <!-- Vertical line -->
          <!-- <div class="absolute h-full w-px bg-primary/30 left-1/2"></div> -->
        </div>

        <div class="shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white">
          <canvas ref="canvasRef"></canvas>
        </div>
      </div>

      <footer class="h-10 border-t bg-background flex items-center px-6 text-[11px] text-muted-foreground justify-between z-10">
        <div class="flex gap-4">
          <span><kbd class="px-1.5 py-0.5 rounded border bg-muted">W</kbd> {{ t('annotation.shortcuts.rect') }}</span>
          <span><kbd class="px-1.5 py-0.5 rounded border bg-muted">P</kbd> {{ t('annotation.shortcuts.polygon') }}</span>
          <span><kbd class="px-1.5 py-0.5 rounded border bg-muted">Del</kbd> {{ t('annotation.shortcuts.delete') }}</span>
          <span><kbd class="px-1.5 py-0.5 rounded border bg-muted">Esc</kbd> {{ t('annotation.shortcuts.cancel') }}</span>
        </div>
        <div>
          {{ t('annotation.polygonHint') }}
        </div>
      </footer>
    </main>

    <!-- Right Sidebar -->
    <aside class="w-80 border-l bg-background flex flex-col z-10">
      <div class="h-12 border-b flex items-center px-4 font-bold text-sm tracking-tight uppercase text-muted-foreground">
        {{ t('annotation.labels', { count: getAnnotationCount() }) }}
      </div>
      
      <div class="flex-1 overflow-auto p-4 space-y-2">
        <div 
          v-for="ann in images[currentImgIndex].annotations" 
          :key="ann.id"
          class="group flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer"
          :class="selectedId === ann.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent hover:bg-muted/50'"
          @click="selectedId = ann.id"
        >
          <div class="h-4 w-4 rounded-full border-2 border-white shadow-sm" :style="{ backgroundColor: ann.color }"></div>
          <div class="flex-1">
            <div class="font-bold text-sm leading-none">{{ ann.label }}</div>
            <div class="text-[10px] text-muted-foreground mt-1 font-mono">{{ t('annotation.id') }}: {{ ann.id.slice(-6) }}</div>
          </div>
          <div class="flex flex-col items-end gap-1">
             <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {{ t(`annotation.types.${ann.type}`) }}
            </span>
          </div>
          <UiButton 
            variant="ghost" 
            size="icon" 
            class="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
            @click.stop="deleteAnnotation(ann.id)"
          >
            <Trash2 class="h-4 w-4" />
          </UiButton>
        </div>
        
        <div v-if="getAnnotationCount() === 0" class="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Square class="h-6 w-6" />
          </div>
          <p class="text-sm font-medium">{{ t('annotation.noAnnotations') }}</p>
          <p class="text-[11px] mt-1">{{ t('annotation.startLabeling') }}</p>
        </div>
      </div>

      <!-- Properties Panel -->
      <div class="border-t bg-muted/10">
        <div class="h-10 border-b flex items-center px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {{ t('annotation.properties') }}
        </div>
        <div class="p-5 space-y-4" v-if="selectedId">
          <div class="space-y-2">
            <label class="text-[11px] font-bold text-muted-foreground uppercase">{{ t('annotation.annotationLabel') }}</label>
            <input 
              type="text" 
              class="w-full bg-background border-2 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors"
              v-model="images[currentImgIndex].annotations.find(a => a.id === selectedId)!.label"
              :placeholder="t('annotation.labelPlaceholder')"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-3 pt-2">
            <UiButton variant="outline" size="sm" class="h-9 gap-2 text-xs" @click="deleteAnnotation(selectedId!)">
              <Trash2 class="h-3.5 w-3.5" /> {{ t('annotation.delete') }}
            </UiButton>
            <UiButton variant="outline" size="sm" class="h-9 gap-2 text-xs">
              <Move class="h-3.5 w-3.5" /> {{ t('annotation.move') }}
            </UiButton>
          </div>
        </div>
        <div v-else class="h-40 flex flex-col items-center justify-center text-[11px] text-muted-foreground italic px-10 text-center">
          {{ t('annotation.selectToModify') }}
        </div>
      </div>
    </aside>
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
