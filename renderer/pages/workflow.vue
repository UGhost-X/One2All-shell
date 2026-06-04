<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated, watch, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Trash2, GripVertical, Save, ArrowUp, ArrowDown, Settings2, Power } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import UiButton from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import UiSelect from '@/components/ui/select/Select.vue'
import UiSelectContent from '@/components/ui/select/SelectContent.vue'
import UiSelectItem from '@/components/ui/select/SelectItem.vue'
import UiSelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import UiSelectValue from '@/components/ui/select/SelectValue.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'

definePageMeta({ keepalive: true })

const router = useRouter()
const toast = inject<any>('toast')

// ====== 数据 ======
interface CameraData {
  id: string
  name: string
  ip: string
  isNetworkCamera: boolean
  status: string
}

interface ProductData {
  id: string
  name: string
  model: string
}

let _stepUidCounter = 0

interface StepForm {
  _uid: number           // 稳定的唯一标识，用作 v-for key
  orderIndex: number
  cameraId: string | null
  productId: string | null
  timeoutMs: number
  cameraName?: string
  productName?: string
}

function makeStep(partial?: Partial<StepForm>): StepForm {
  return {
    _uid: ++_stepUidCounter,
    orderIndex: 0,
    cameraId: null,
    productId: null,
    timeoutMs: 30000,
    ...partial
  }
}

interface WorkflowItem {
  id: string
  name: string
  description?: string
  steps: StepForm[]
  createdAt?: string
  updatedAt?: string
}

const cameras = ref<CameraData[]>([])
const products = ref<ProductData[]>([])
const workflows = ref<WorkflowItem[]>([])

const selectedWorkflowId = ref<string | null>(null)
const editingName = ref('')
const editingDescription = ref('')
const editingSteps = ref<StepForm[]>([])
const isSaving = ref(false)
const openSelects = reactive<Record<string, boolean>>({})
const activeWorkflowId = ref<string | null>(null)

// 新建工作流对话框
const isNewWorkflowDialogOpen = ref(false)
const newWorkflowName = ref('')
const newWorkflowDescription = ref('')

// ====== 计算属性 ======
const availableCameras = computed(() => cameras.value)
const availableProducts = computed(() => products.value)

const stepSummary = computed(() => {
  return editingSteps.value.map((_s, i) => {
    const cam = cameras.value.find(c => c.id === editingSteps.value[i].cameraId)
    const prod = products.value.find(p => p.id === editingSteps.value[i].productId)
    return {
      index: i,
      cameraName: cam?.name || '未设置',
      productName: prod?.name || '未设置'
    }
  })
})

// 每个步骤选中的相机/产品名称（用于 Select 显示）
function cameraNameForStep(step: StepForm) {
  if (!step.cameraId) return ''
  const cam = cameras.value.find(c => c.id === step.cameraId)
  return cam ? cam.name : ''
}

function productNameForStep(step: StepForm) {
  if (!step.productId) return ''
  const prod = products.value.find(p => p.id === step.productId)
  return prod ? prod.name : ''
}

// ====== 数据加载 ======
async function loadData() {
  try {
    const api = (window as any).electronAPI
    if (!api) {
      setTimeout(() => loadData(), 500)
      return
    }

    const [camList, prodList, wfList] = await Promise.all([
      api.getCameras(),
      api.getProducts(),
      api.listWorkflows()
    ])


    cameras.value = camList || []
    products.value = prodList || []
    workflows.value = (wfList || []).map((wf: any) => ({
      id: wf.id,
      name: wf.name,
      description: wf.description,
      steps: (wf.steps || []).map((s: any) => makeStep({
        orderIndex: s.orderIndex,
        cameraId: s.cameraId,
        productId: s.productId,
        timeoutMs: s.timeoutMs || 30000,
        cameraName: s.camera?.name || '',
        productName: s.product?.name || ''
      })),
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt
    }))
  } catch (err) {
    console.error('[workflow] 加载数据失败:', err)
  }
}

onMounted(() => {
  loadData()
  // 恢复启用的工作流
  const savedActiveId = localStorage.getItem('activeWorkflowId')
  if (savedActiveId) {
    activeWorkflowId.value = savedActiveId
  }
})

onActivated(() => {
  loadData()
  // 重新同步启用的工作流（index.vue 可能已切换）
  const savedActiveId = localStorage.getItem('activeWorkflowId')
  activeWorkflowId.value = savedActiveId || null
})

watch(selectedWorkflowId, (newId) => {
  if (newId) {
    const wf = workflows.value.find(w => w.id === newId)
    if (wf) {
      editingName.value = wf.name
      editingDescription.value = wf.description || ''
      editingSteps.value = wf.steps.length > 0
        ? wf.steps.map(s => makeStep({ ...s }))
        : [makeStep()]
    }
  }
})

// ====== 工作流 CRUD ======
function createNewWorkflow() {
  newWorkflowName.value = ''
  newWorkflowDescription.value = ''
  isNewWorkflowDialogOpen.value = true
}

function confirmCreateWorkflow() {
  if (!newWorkflowName.value.trim()) {
    toast?.error('请输入工作流名称')
    return
  }
  selectedWorkflowId.value = null
  editingName.value = newWorkflowName.value.trim()
  editingDescription.value = newWorkflowDescription.value.trim()
  editingSteps.value = [makeStep()]
  isNewWorkflowDialogOpen.value = false
}

function toggleActiveWorkflow() {
  if (!selectedWorkflowId.value) return
  if (activeWorkflowId.value === selectedWorkflowId.value) {
    // 停用
    activeWorkflowId.value = null
    localStorage.removeItem('activeWorkflowId')
    toast?.info('已停用当前工作流')
  } else {
    // 启用：自动替换之前启用的工作流（仅允许一个启用）
    const wasAnotherActive = activeWorkflowId.value !== null
    activeWorkflowId.value = selectedWorkflowId.value
    localStorage.setItem('activeWorkflowId', selectedWorkflowId.value)
    toast?.info(wasAnotherActive ? '已切换启用工作流（已自动关闭之前启用的工作流）' : '已启用当前工作流')
  }
}

async function saveWorkflow() {
  if (!editingName.value.trim()) {
    toast?.error('请输入工作流名称')
    return
  }

  isSaving.value = true
  try {
    const api = (window as any).electronAPI
    if (!api) return

    const steps = editingSteps.value
      .filter(s => s.cameraId || s.productId)
      .map((s, i) => ({
        orderIndex: i,
        cameraId: s.cameraId || null,
        productId: s.productId || null,
        timeoutMs: s.timeoutMs || 30000
      }))

    if (steps.length === 0) {
      toast?.error('请至少添加一个步骤（设置相机或产品）')
      isSaving.value = false
      return
    }

    const data = {
      id: selectedWorkflowId.value || undefined,
      name: editingName.value.trim(),
      description: editingDescription.value.trim() || undefined,
      steps
    }

    if (selectedWorkflowId.value) {
      await api.updateWorkflow({ ...data, id: selectedWorkflowId.value })
    } else {
      const created = await api.createWorkflow(data)
      selectedWorkflowId.value = created.id
    }

    await loadData()
    toast?.success('工作流已保存')
  } catch (err: any) {
    console.error('保存工作流失败:', err)
    toast?.error('保存失败: ' + (err.message || '未知错误'))
  } finally {
    isSaving.value = false
  }
}

async function deleteWorkflow(id: string) {
  await new Promise<void>(resolve => setTimeout(resolve, 0))
  if (!confirm('确定要删除这个工作流吗？此操作不可撤销。')) return
  try {
    const api = (window as any).electronAPI
    if (!api) return
    await api.deleteWorkflow(id)
    if (selectedWorkflowId.value === id) {
      selectedWorkflowId.value = null
      editingSteps.value = []
    }
    await loadData()
    toast?.success('工作流已删除')
  } catch (err) {
    console.error('删除工作流失败:', err)
    toast?.error('删除失败')
  }
}

// ====== 步骤编辑 ======
function addStep() {
  const nextIndex = editingSteps.value.length
  editingSteps.value.push(makeStep({ orderIndex: nextIndex }))
}

function removeStep(index: number) {
  if (editingSteps.value.length <= 1) return
  editingSteps.value.splice(index, 1)
  editingSteps.value.forEach((s, i) => { s.orderIndex = i })
}

// ====== 拖拽排序 ======
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
  // 延迟添加拖拽样式，避免拖拽图像立即应用
  requestAnimationFrame(() => {
    const el = event.target as HTMLElement
    el.closest('.step-card')?.classList.add('opacity-50')
  })
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  if (dragIndex.value === null || dragIndex.value === index) return
  event.dataTransfer!.dropEffect = 'move'
  dragOverIndex.value = index
}

function onDragLeave(_index: number) {
  dragOverIndex.value = null
}

function onDrop(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const from = dragIndex.value
  const to = index
  const items = editingSteps.value
  const [moved] = items.splice(from, 1)
  items.splice(to, 0, moved)
  items.forEach((s, i) => { s.orderIndex = i })
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd(_index: number, event: DragEvent) {
  const el = event.target as HTMLElement
  el.closest('.step-card')?.classList.remove('opacity-50')
  dragIndex.value = null
  dragOverIndex.value = null
}

function moveStepUp(index: number) {
  if (index <= 0) return
  const temp = editingSteps.value[index]
  editingSteps.value[index] = editingSteps.value[index - 1]
  editingSteps.value[index - 1] = temp
  editingSteps.value.forEach((s, i) => { s.orderIndex = i })
}

function moveStepDown(index: number) {
  if (index >= editingSteps.value.length - 1) return
  const temp = editingSteps.value[index]
  editingSteps.value[index] = editingSteps.value[index + 1]
  editingSteps.value[index + 1] = temp
  editingSteps.value.forEach((s, i) => { s.orderIndex = i })
}

</script>

<template>
  <AppHeader />
  <div class="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
    <!-- 主区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧面板 -->
      <div class="w-72 border-r flex flex-col bg-muted/30">
        <!-- 配置列表 -->
        <div class="flex-1 flex flex-col min-h-0">
          <div class="flex-1 overflow-auto p-2 space-y-1">
            <div v-if="workflows.length === 0" class="text-center text-muted-foreground text-sm py-8">
              暂无工作流，点击下方按钮创建
            </div>
            <div
              v-for="wf in workflows"
              :key="wf.id"
              :class="[
                'flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group relative',
                selectedWorkflowId === wf.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-muted border border-transparent'
              ]"
              @click="selectedWorkflowId = wf.id"
            >
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ wf.name }}</div>
                <div class="text-xs text-muted-foreground">{{ wf.steps.length }} 个步骤</div>
              </div>
              <Badge
                v-if="activeWorkflowId === wf.id"
                variant="default"
                class="h-5 text-[10px] px-1.5"
              >
                启用
              </Badge>
              <button
                class="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                title="删除"
                @click.stop="deleteWorkflow(wf.id)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div class="p-2 border-t shrink-0">
            <UiButton variant="outline" size="sm" class="w-full" @click="createNewWorkflow">
              <Plus class="h-4 w-4 mr-1" /> 新建工作流
            </UiButton>
          </div>
        </div>

      </div>

      <!-- 右侧编辑器 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 未选择 -->
        <div v-if="!selectedWorkflowId && editingSteps.length === 0" class="flex-1 flex items-center justify-center text-muted-foreground">
          <div class="text-center">
            <Settings2 class="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p class="text-sm">选择一个工作流进行编辑，或创建新的工作流</p>
          </div>
        </div>

        <!-- 编辑器 -->
        <template v-if="selectedWorkflowId !== null || editingSteps.length > 0">
          <!-- 步骤列表 -->
          <div class="flex-1 overflow-auto p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold">检测步骤 ({{ editingSteps.length }})</h3>
              <div class="flex items-center gap-2">
                <UiButton variant="outline" size="sm" @click="addStep">
                  <Plus class="h-3.5 w-3.5 mr-1" /> 添加步骤
                </UiButton>
                <UiButton
                  :variant="activeWorkflowId === selectedWorkflowId ? 'default' : 'outline'"
                  size="sm"
                  :disabled="!selectedWorkflowId"
                  @click="toggleActiveWorkflow"
                >
                  <Power class="h-4 w-4 mr-1" />
                  {{ activeWorkflowId === selectedWorkflowId ? '已启用' : '启用' }}
                </UiButton>
                <UiButton @click="saveWorkflow" :disabled="isSaving" size="sm">
                  <Save class="h-4 w-4 mr-1" /> {{ isSaving ? '保存中...' : '保存' }}
                </UiButton>
              </div>
            </div>



            <div class="space-y-3">
              <div
                v-for="(step, index) in editingSteps"
                :key="step._uid"
                :class="[
                  'step-card flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors group',
                  dragOverIndex === index && dragIndex !== index
                    ? 'border-primary border-dashed bg-primary/5'
                    : 'hover:border-primary/30'
                ]"
                draggable="true"
                @dragstart="onDragStart(index, $event)"
                @dragover="onDragOver(index, $event)"
                @dragleave="onDragLeave(index)"
                @drop="onDrop(index)"
                @dragend="onDragEnd(index, $event)"
              >
                <div class="flex items-center gap-2 shrink-0">
                  <GripVertical class="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" title="拖拽排序" />
                  <span class="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {{ index + 1 }}
                  </span>
                </div>

                <!-- 相机选择 (shadcn Select) -->
                <div class="flex-1 min-w-0 flex flex-col justify-center">
                  <Label class="text-xs text-muted-foreground mb-1 block">相机</Label>
                  <UiSelect
                    :model-value="step.cameraId ?? undefined"
                    :open="openSelects[`camera-${step._uid}`]"
                    @update:model-value="(v: any) => { step.cameraId = v || null }"
                    @update:open="(v: boolean) => { openSelects[`camera-${step._uid}`] = v }"
                  >
                    <UiSelectTrigger class="h-8 text-sm">
                      <UiSelectValue placeholder="-- 选择相机 --">
                        {{ cameraNameForStep(step) || '' }}
                      </UiSelectValue>
                    </UiSelectTrigger>
                    <UiSelectContent>
                      <UiSelectItem v-if="availableCameras.length === 0" value="__empty__" disabled>
                        请先在主页添加相机
                      </UiSelectItem>
                      <UiSelectItem
                        v-for="cam in availableCameras"
                        :key="cam.id"
                        :value="cam.id"
                      >
                        {{ cam.name }}
                      </UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                </div>

                <!-- 产品选择 (shadcn Select) -->
                <div class="flex-1 min-w-0 flex flex-col justify-center">
                  <Label class="text-xs text-muted-foreground mb-1 block">产品</Label>
                  <UiSelect
                    :model-value="step.productId ?? undefined"
                    :open="openSelects[`product-${step._uid}`]"
                    @update:model-value="(v: any) => { step.productId = v || null }"
                    @update:open="(v: boolean) => { openSelects[`product-${step._uid}`] = v }"
                  >
                    <UiSelectTrigger class="h-8 text-sm">
                      <UiSelectValue placeholder="-- 选择产品 --">
                        {{ productNameForStep(step) || '' }}
                      </UiSelectValue>
                    </UiSelectTrigger>
                    <UiSelectContent>
                      <UiSelectItem v-if="availableProducts.length === 0" value="__empty__" disabled>
                        请先在主页添加产品
                      </UiSelectItem>
                      <UiSelectItem
                        v-for="prod in availableProducts"
                        :key="prod.id"
                        :value="prod.id"
                      >
                        {{ prod.name }}
                      </UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>
                </div>

                <!-- 操作按钮 -->
                <div class="flex items-center gap-1 shrink-0">
                  <UiButton variant="ghost" size="icon" class="h-7 w-7" :disabled="index === 0" title="上移" @click="moveStepUp(index)">
                    <ArrowUp class="h-3.5 w-3.5" />
                  </UiButton>
                  <UiButton variant="ghost" size="icon" class="h-7 w-7" :disabled="index >= editingSteps.length - 1" title="下移" @click="moveStepDown(index)">
                    <ArrowDown class="h-3.5 w-3.5" />
                  </UiButton>
                  <UiButton variant="ghost" size="icon" class="h-7 w-7" :disabled="editingSteps.length <= 1" title="删除" @click="removeStep(index)">
                    <Trash2 class="h-3.5 w-3.5" />
                  </UiButton>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 新建工作流对话框 -->
    <Dialog :open="isNewWorkflowDialogOpen" @update:open="isNewWorkflowDialogOpen = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新建工作流</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="workflow-name">工作流名称</Label>
            <Input
              id="workflow-name"
              v-model="newWorkflowName"
              placeholder="请输入工作流名称"
              @keydown.enter="confirmCreateWorkflow"
            />
          </div>
          <div class="space-y-2">
            <Label for="workflow-desc">工作流描述（可选）</Label>
            <Input
              id="workflow-desc"
              v-model="newWorkflowDescription"
              placeholder="请输入工作流描述"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <UiButton variant="outline" @click="isNewWorkflowDialogOpen = false">取消</UiButton>
          <UiButton @click="confirmCreateWorkflow">确定</UiButton>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
