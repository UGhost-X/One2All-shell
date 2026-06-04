<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Circle, AlertCircle, Loader2, XCircle } from 'lucide-vue-next'

const props = defineProps<{
  isExecuting: boolean
  currentStepIndex: number
  stepStatuses: Record<number, string>
  totalSteps: number
}>()

const emit = defineEmits<{
  cancel: []
}>()

interface StepInfo {
  index: number
  label: string
  status: 'pending' | 'capturing' | 'inferring' | 'completed' | 'failed'
}

const steps = computed<StepInfo[]>(() => {
  const result: StepInfo[] = []
  const statuses = props.stepStatuses || {}

  for (let i = 0; i < props.totalSteps; i++) {
    result.push({
      index: i,
      label: `步骤 ${i + 1}`,
      status: (statuses[i] || 'pending') as StepInfo['status']
    })
  }
  return result
})

const currentStepLabel = computed(() => {
  if (props.currentStepIndex < 0 || props.currentStepIndex >= steps.value.length) return ''
  const step = steps.value[props.currentStepIndex]
  const statusLabel: Record<string, string> = {
    capturing: '正在拍照',
    inferring: '正在识别',
    pending: '等待中',
    completed: '已完成',
    failed: '失败'
  }
  return `${step.label}: ${statusLabel[step.status] || ''}`
})
</script>

<template>
  <div v-if="isExecuting" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border rounded-xl shadow-lg px-5 py-4 min-w-[380px]">
    <!-- 当前步骤文本 -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-semibold text-foreground">
        {{ currentStepLabel || '准备中...' }}
      </span>
      <button
        class="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
        @click="emit('cancel')"
      >
        取消
      </button>
    </div>

    <!-- 步骤进度条 -->
    <div class="flex items-center gap-1.5">
      <template v-for="step in steps" :key="step.index">
        <!-- 连接线 -->
        <div
          v-if="step.index > 0"
          class="flex-1 h-0.5 rounded"
          :class="
            step.status === 'completed' ? 'bg-green-500' :
            step.status === 'failed' ? 'bg-red-400' :
            'bg-muted'
          "
        />
        <!-- 步骤图标 -->
        <div
          class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors"
          :class="{
            'bg-green-500 text-white': step.status === 'completed',
            'bg-red-500 text-white': step.status === 'failed',
            'bg-primary text-primary-foreground animate-pulse': step.status === 'capturing' || step.status === 'inferring',
            'bg-muted text-muted-foreground': step.status === 'pending'
          }"
          :title="step.label + ' - ' + step.status"
        >
          <CheckCircle2 v-if="step.status === 'completed'" class="h-4 w-4" />
          <XCircle v-else-if="step.status === 'failed'" class="h-4 w-4" />
          <Loader2 v-else-if="step.status === 'capturing' || step.status === 'inferring'" class="h-4 w-4 animate-spin" />
          <Circle v-else class="h-4 w-4" />
        </div>
      </template>
    </div>
  </div>
</template>
