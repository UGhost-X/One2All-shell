<template>
  <div class="roi-selector">
    <div v-if="rois.length === 0" class="text-sm text-muted-foreground py-4 text-center">
      {{ emptyText }}
    </div>
    <div v-else class="roi-grid">
      <div
        v-for="roi in rois"
        :key="roi.id"
        class="roi-item"
        :class="{
          'selected': selectedIds.includes(roi.id),
          'used': roi.usedInRetrain
        }"
        @click="toggleSelection(roi.id)"
      >
        <div class="roi-checkbox">
          <input
            type="checkbox"
            :checked="selectedIds.includes(roi.id)"
            :disabled="roi.usedInRetrain"
            @click.stop
            @change="toggleSelection(roi.id)"
          />
        </div>
        <div class="roi-image">
          <img
            v-if="roi.thumbnailPath"
            :src="`file://${roi.thumbnailPath}`"
            :alt="roi.category"
            @error="handleImageError"
          />
          <div v-else class="roi-placeholder">
            <ImageIcon class="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
        <div class="roi-info">
          <span class="roi-category">{{ roi.category }}</span>
          <span class="roi-type" :class="`type-${roi.roiType.toLowerCase()}`">
            {{ getRoiTypeLabel(roi) }}
          </span>
          <span v-if="roi.usedInRetrain" class="roi-used-badge">
            {{ $t('training.retrain.used') }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="showStats" class="roi-stats">
      <span>{{ $t('training.retrain.selected') }}: {{ selectedIds.length }} / {{ rois.length }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ImageIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface RoiImage {
  id: string
  productId: string
  sourceTaskUuid: string
  category: string
  modelIsAnomaly: boolean
  userIsAnomaly: boolean
  isYoloAnomaly?: boolean
  roiType: 'FP' | 'FN' | 'NORMAL'
  filePath: string
  fileName: string
  thumbnailPath?: string
  usedInRetrain: boolean
  usedTaskUuid?: string
  usedAt?: Date
  generation: number
  createdAt: Date
  updatedAt: Date
}

const props = defineProps<{
  modelValue: string[]
  rois: RoiImage[]
  emptyText?: string
  showStats?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const selectedIds = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const toggleSelection = (roiId: string) => {
  const roi = props.rois.find(r => r.id === roiId)
  if (roi?.usedInRetrain) return

  const index = selectedIds.value.indexOf(roiId)
  if (index > -1) {
    selectedIds.value = selectedIds.value.filter(id => id !== roiId)
  } else {
    selectedIds.value = [...selectedIds.value, roiId]
  }
}

const getRoiTypeLabel = (roi: RoiImage) => {
  if (roi.roiType === 'FP') {
    return roi.isYoloAnomaly ? 'YOLO-FP' : 'DIN-FP'
  }
  const labels: Record<string, string> = {
    'FN': t('training.retrain.fn'),
    'NORMAL': t('training.retrain.normal')
  }
  return labels[roi.roiType] || roi.roiType
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
  const parent = target.parentElement
  if (parent) {
    const placeholder = document.createElement('div')
    placeholder.className = 'roi-placeholder'
    placeholder.innerHTML = '<svg class="w-6 h-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
    parent.appendChild(placeholder)
  }
}
</script>

<style scoped>
.roi-selector {
  @apply w-full;
}

.roi-grid {
  @apply grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2;
}

.roi-item {
  @apply relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:border-primary;
  @apply bg-card;
}

.roi-item.selected {
  @apply border-primary ring-1 ring-primary;
}

.roi-item.used {
  @apply opacity-50 cursor-not-allowed;
}

.roi-checkbox {
  @apply absolute top-1 left-1 z-10;
}

.roi-checkbox input {
  @apply w-4 h-4 rounded border-border;
}

.roi-image {
  @apply aspect-square flex items-center justify-center bg-muted;
}

.roi-image img {
  @apply w-full h-full object-cover;
}

.roi-placeholder {
  @apply w-full h-full flex items-center justify-center;
}

.roi-info {
  @apply p-2 text-xs space-y-1;
}

.roi-category {
  @apply block font-medium truncate;
}

.roi-type {
  @apply inline-block px-1.5 py-0.5 rounded text-xs font-medium;
}

.type-fp {
  @apply bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300;
}

.type-fn {
  @apply bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300;
}

.type-normal {
  @apply bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300;
}

.roi-used-badge {
  @apply block text-xs text-muted-foreground mt-1;
}

.roi-stats {
  @apply mt-2 pt-2 border-t text-sm text-muted-foreground;
}
</style>
