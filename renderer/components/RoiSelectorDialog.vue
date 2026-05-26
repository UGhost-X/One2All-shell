<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-5xl max-h-[85vh] flex flex-col p-0">
      <DialogHeader class="px-6 py-4 border-b">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>

      <!-- 筛选工具栏 -->
      <div class="px-6 py-3 border-b bg-muted/30 flex flex-wrap gap-3 items-center">
        <!-- 时间筛选 -->
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-muted-foreground" />
          <Select v-model="selectedDate" :open="isDateSelectOpen" @update:open="isDateSelectOpen = $event" @update:model-value="filterRois">
            <SelectTrigger class="h-8 w-[160px] text-xs">
              <SelectValue placeholder="选择日期" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部日期</SelectItem>
              <SelectItem v-for="date in availableDates" :key="date" :value="date">
                {{ date }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 类别筛选 -->
        <div class="flex items-center gap-2">
          <Tag class="w-4 h-4 text-muted-foreground" />
          <Select v-model="selectedCategory" :open="isCategorySelectOpen" @update:open="isCategorySelectOpen = $event" @update:model-value="filterRois">
            <SelectTrigger class="h-8 w-[140px] text-xs">
              <SelectValue placeholder="选择类别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类别</SelectItem>
              <SelectItem v-for="cat in availableCategories" :key="cat" :value="cat">
                {{ cat }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 类型筛选 -->
        <div class="flex items-center gap-2">
          <Filter class="w-4 h-4 text-muted-foreground" />
          <Select v-model="selectedType" :open="isTypeSelectOpen" @update:open="isTypeSelectOpen = $event" @update:model-value="filterRois">
            <SelectTrigger class="h-8 w-[120px] text-xs">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="FP">误检 (FP)</SelectItem>
              <SelectItem value="FN">漏检 (FN)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex-1"></div>

        <!-- 统计信息 -->
        <div class="text-xs text-muted-foreground">
          <template v-if="deleteMode">
            待删除 {{ deleteSelected.size }} / {{ filteredRois.length }}
          </template>
          <template v-else>
            已选择 {{ localSelected.length }} / {{ filteredRois.length }}
          </template>
        </div>

        <!-- 全选/取消全选 -->
        <Button variant="outline" size="sm" class="h-8 text-xs" @click="toggleSelectAll">
          {{ isAllSelected ? '取消全选' : '全选' }}
        </Button>

        <!-- 删除模式切换 -->
        <Button
          :variant="deleteMode ? 'destructive' : 'outline'"
          size="sm"
          class="h-8 text-xs"
          @click="toggleDeleteMode"
        >
          <Trash2 class="w-3 h-3 mr-1" />
          {{ deleteMode ? '退出删除' : '删除' }}
        </Button>
      </div>

      <!-- ROI 列表 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 按日期分组 -->
        <div v-if="groupedRois.length > 0" class="space-y-6">
          <div v-for="group in groupedRois" :key="group.date" class="space-y-3">
            <!-- 日期标题 -->
            <div class="flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
              <Calendar class="w-4 h-4 text-muted-foreground" />
              <h3 class="text-sm font-medium">{{ group.date }}</h3>
              <Badge variant="secondary" class="text-xs">{{ group.rois.length }} 个</Badge>
              <div class="flex-1 border-b border-dashed border-muted"></div>
            </div>

            <!-- ROI 网格 -->
            <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              <div
                v-for="roi in group.rois"
                :key="roi.id"
                class="relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all"
                :class="getRoiBorderClass(roi)"
                @click="handleRoiClick(roi)"
              >
                <!-- ROI 图片 -->
                <div class="aspect-square bg-muted relative">
                  <img
                    v-if="roi.filePath && roi.fileExists !== false"
                    :src="`file://${roi.filePath}`"
                    class="w-full h-full object-cover"
                    :alt="roi.category"
                  />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
                    <ImageOff class="w-8 h-8" />
                    <span v-if="roi.filePath && roi.fileExists === false" class="text-[10px] text-destructive">文件丢失</span>
                  </div>

                  <!-- 选中标记 (选择模式) -->
                  <div
                    v-if="!deleteMode && isSelected(roi.id)"
                    class="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check class="w-3 h-3 text-primary-foreground" />
                  </div>

                  <!-- 删除选中标记 (删除模式) -->
                  <div
                    v-if="deleteMode && deleteSelected.has(roi.id)"
                    class="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                  >
                    <X class="w-3 h-3 text-destructive-foreground" />
                  </div>
                </div>

                <!-- ROI 信息 -->
                <div class="p-2 bg-background">
                  <div class="flex items-center justify-between gap-1">
                    <span class="text-[10px] truncate flex-1" :title="roi.category">{{ roi.category }}</span>
                    <Badge
                      :variant="roi.roiType === 'FP' ? 'destructive' : roi.roiType === 'FN' ? 'warning' : 'secondary'"
                      class="text-[10px] px-1 py-0 h-4"
                    >
                      {{ roi.roiType }}
                    </Badge>
                  </div>
                  <div class="text-[10px] text-muted-foreground mt-1">
                    {{ formatTime(roi.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ImageOff class="w-12 h-12 mb-4 opacity-50" />
          <p class="text-sm">{{ emptyText }}</p>
          <p class="text-xs mt-1">尝试调整筛选条件</p>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <DialogFooter class="px-6 py-4 border-t gap-3">
        <template v-if="deleteMode">
          <Button variant="outline" @click="toggleDeleteMode">
            取消
          </Button>
          <Button
            variant="destructive"
            :disabled="deleteSelected.size === 0 || isDeleting"
            @click="confirmBatchDelete"
          >
            <Loader2 v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin" />
            <Trash2 v-else class="w-4 h-4 mr-2" />
            {{ isDeleting ? '删除中...' : `删除所选 (${deleteSelected.size})` }}
          </Button>
        </template>
        <template v-else>
          <Button variant="outline" @click="$emit('update:open', false)">
            取消
          </Button>
          <Button @click="confirmSelection">
            确认选择 ({{ localSelected.length }})
          </Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 删除确认对话框 -->
  <Dialog :open="showDeleteConfirm" @update:open="showDeleteConfirm = $event">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-destructive">
          <Trash2 class="w-5 h-5" />
          确认删除
        </DialogTitle>
        <DialogDescription>
          确定要删除选中的 {{ deleteSelected.size }} 个 ROI 吗？此操作不可撤销，会同时删除磁盘上的图片文件。
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-3">
        <Button variant="outline" class="flex-1" @click="showDeleteConfirm = false" :disabled="isDeleting">
          取消
        </Button>
        <Button variant="destructive" class="flex-1" @click="executeBatchDelete" :disabled="isDeleting">
          <Loader2 v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin" />
          确认删除
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import { Calendar, Tag, Filter, Check, ImageOff, Trash2, X, Loader2 } from 'lucide-vue-next'

interface RoiImage {
  id: string
  category: string
  roiType: string
  filePath: string
  thumbnailPath?: string
  posId?: string
  createdAt: string | Date
  usedInRetrain: boolean
  fileExists?: boolean
}

const props = defineProps<{
  open: boolean
  title: string
  description: string
  rois: RoiImage[]
  selected: string[]
  emptyText?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:selected': [value: string[]]
  'confirm': []
  'deleted': []
}>()

// 本地选择状态
const localSelected = ref<string[]>([...props.selected])

// 删除模式
const deleteMode = ref(false)
const deleteSelected = ref<Set<string>>(new Set())
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

// 筛选条件
const selectedDate = ref('all')
const selectedCategory = ref('all')
const selectedType = ref('all')

// Select 下拉框状态
const isDateSelectOpen = ref(false)
const isCategorySelectOpen = ref(false)
const isTypeSelectOpen = ref(false)

// 过滤后的 ROI
const filteredRois = ref<RoiImage[]>([])

// 计算可用的日期列表
const availableDates = computed(() => {
  const dates = new Set<string>()
  props.rois.forEach(roi => {
    const dateStr = typeof roi.createdAt === 'string' ? roi.createdAt : new Date(roi.createdAt).toISOString()
    const date = dateStr.split('T')[0]
    dates.add(date)
  })
  return Array.from(dates).sort().reverse()
})

// 计算可用的类别列表
const availableCategories = computed(() => {
  const categories = new Set<string>()
  props.rois.forEach(roi => {
    categories.add(roi.category)
  })
  return Array.from(categories).sort()
})

// 按日期分组的 ROI
const groupedRois = computed(() => {
  const groups = new Map<string, RoiImage[]>()

  filteredRois.value.forEach(roi => {
    const dateStr = typeof roi.createdAt === 'string' ? roi.createdAt : new Date(roi.createdAt).toISOString()
    const date = dateStr.split('T')[0]
    if (!groups.has(date)) {
      groups.set(date, [])
    }
    groups.get(date)!.push(roi)
  })

  return Array.from(groups.entries())
    .map(([date, rois]) => ({ date, rois }))
    .sort((a, b) => b.date.localeCompare(a.date))
})

// 是否全选
const isAllSelected = computed(() => {
  const allRois = filteredRois.value
  if (allRois.length === 0) return false
  if (deleteMode.value) {
    return allRois.every(r => deleteSelected.value.has(r.id))
  }
  return allRois.every(r => localSelected.value.includes(r.id))
})

// 监听 props 变化
watch(() => props.selected, (newVal) => {
  localSelected.value = [...newVal]
})

watch(() => props.rois, () => {
  filterRois()
}, { immediate: true })

// 关闭时重置删除模式
watch(() => props.open, (val) => {
  if (!val) {
    deleteMode.value = false
    deleteSelected.value = new Set()
  }
})

// 筛选 ROI
function filterRois() {
  let result = [...props.rois]

  // 按日期筛选
  if (selectedDate.value !== 'all') {
    result = result.filter(roi => {
      const dateStr = typeof roi.createdAt === 'string' ? roi.createdAt : new Date(roi.createdAt).toISOString()
      return dateStr.startsWith(selectedDate.value)
    })
  }

  // 按类别筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(roi => roi.category === selectedCategory.value)
  }

  // 按类型筛选
  if (selectedType.value !== 'all') {
    result = result.filter(roi => roi.roiType === selectedType.value)
  }

  filteredRois.value = result
}

// 获取 ROI 边框样式
function getRoiBorderClass(roi: RoiImage) {
  const classes: string[] = []
  if (deleteMode.value) {
    if (deleteSelected.value.has(roi.id)) {
      classes.push('border-destructive ring-2 ring-destructive/20')
    } else {
      classes.push('border-transparent hover:border-destructive/50')
    }
  } else {
    if (isSelected(roi.id)) {
      classes.push('border-primary ring-2 ring-primary/20')
    } else {
      classes.push('border-transparent hover:border-muted')
    }
  }
  return classes
}

// 判断是否选中（选择模式）
function isSelected(roiId: string): boolean {
  return localSelected.value.includes(roiId)
}

// 处理 ROI 点击
function handleRoiClick(roi: RoiImage) {
  if (deleteMode.value) {
    toggleDeleteSelection(roi.id)
  } else {
    toggleSelection(roi)
  }
}

// 切换选择（选择模式）
function toggleSelection(roi: RoiImage) {
  const index = localSelected.value.indexOf(roi.id)
  if (index > -1) {
    localSelected.value = localSelected.value.filter(id => id !== roi.id)
  } else {
    localSelected.value = [...localSelected.value, roi.id]
  }
}

// 切换删除选择（删除模式）
function toggleDeleteSelection(roiId: string) {
  const newSet = new Set(deleteSelected.value)
  if (newSet.has(roiId)) {
    newSet.delete(roiId)
  } else {
    newSet.add(roiId)
  }
  deleteSelected.value = newSet
}

// 切换删除模式
function toggleDeleteMode() {
  deleteMode.value = !deleteMode.value
  if (!deleteMode.value) {
    deleteSelected.value = new Set()
  }
}

// 全选/取消全选
function toggleSelectAll() {
  const allRois = filteredRois.value
  if (deleteMode.value) {
    if (isAllSelected.value) {
      deleteSelected.value = new Set()
    } else {
      deleteSelected.value = new Set(allRois.map(r => r.id))
    }
  } else {
    if (isAllSelected.value) {
      localSelected.value = localSelected.value.filter(id =>
        !allRois.find(r => r.id === id)
      )
    } else {
      const allIds = allRois.map(r => r.id)
      localSelected.value = [...new Set([...localSelected.value, ...allIds])]
    }
  }
}

// 确认选择
function confirmSelection() {
  emit('update:selected', [...localSelected.value])
  emit('confirm')
  emit('update:open', false)
}

// 确认批量删除（打开二次确认）
function confirmBatchDelete() {
  if (deleteSelected.value.size === 0) return
  showDeleteConfirm.value = true
}

// 执行批量删除
async function executeBatchDelete() {
  if (deleteSelected.value.size === 0) return
  isDeleting.value = true
  try {
    const roiIds = Array.from(deleteSelected.value)
    if (window.electronAPI?.deleteRois) {
      const result = await window.electronAPI.deleteRois({ roiIds })
      if (result.success) {
        // 从本地选择中移除已删除的
        localSelected.value = localSelected.value.filter(id => !roiIds.includes(id))
        deleteSelected.value = new Set()
        showDeleteConfirm.value = false
        deleteMode.value = false
        emit('deleted')
      } else {
        console.error('Failed to delete ROIs:', result.error)
      }
    }
  } catch (err) {
    console.error('Failed to delete ROIs:', err)
  } finally {
    isDeleting.value = false
  }
}

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>
