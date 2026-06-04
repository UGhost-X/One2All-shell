<script setup lang="ts">
import { CheckCircle2, XCircle, Camera, Box, SkipForward } from 'lucide-vue-next'

interface StepResultSummary {
  stepIndex: number
  stepName?: string
  cameraName?: string
  productName?: string
  status: string
  isAnomaly: boolean
  anomalyCount: number
  errorMessage?: string
  inferenceSkipped?: boolean
}

defineProps<{
  results: StepResultSummary[]
}>()

const emit = defineEmits<{
  'select-step': [index: number]
}>()
</script>

<template>
  <div class="h-full border rounded-lg overflow-hidden" v-if="results.length > 0">
    <!-- 每步明细 -->
    <div class="divide-y h-full overflow-y-auto">
      <div
        v-for="(r, idx) in results"
        :key="idx"
        class="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
        @click="emit('select-step', r.stepIndex)"
      >
        <!-- 状态图标 -->
        <SkipForward v-if="r.inferenceSkipped" class="h-4 w-4 text-yellow-500 shrink-0" />
        <CheckCircle2 v-else-if="r.status === 'completed' && !r.isAnomaly" class="h-4 w-4 text-green-500 shrink-0" />
        <AlertTriangle v-else-if="r.status === 'completed' && r.isAnomaly" class="h-4 w-4 text-red-500 shrink-0" />
        <XCircle v-else-if="r.status === 'failed'" class="h-4 w-4 text-red-500 shrink-0" />
        <div v-else class="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />

        <!-- 步骤信息 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 text-sm">
            <span class="font-medium">步骤 {{ r.stepIndex + 1 }}</span>
            <span v-if="r.stepName" class="text-muted-foreground">— {{ r.stepName }}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span v-if="r.cameraName" class="flex items-center gap-1">
              <Camera class="h-3 w-3" /> {{ r.cameraName }}
            </span>
            <span v-if="r.productName" class="flex items-center gap-1">
              <Box class="h-3 w-3" /> {{ r.productName }}
            </span>
            <span v-if="r.inferenceSkipped" class="text-yellow-600">
              推理已跳过
            </span>
            <span v-else-if="r.status === 'completed'">
              {{ r.isAnomaly ? `检出 ${r.anomalyCount} 个缺陷` : '无异常' }}
            </span>
            <span v-else-if="r.status === 'failed'" class="text-red-500">
              {{ r.errorMessage || '执行失败' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
