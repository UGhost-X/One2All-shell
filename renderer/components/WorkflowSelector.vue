<script setup lang="ts">
import { ref, computed } from 'vue'
import { Workflow } from 'lucide-vue-next'

interface WorkflowSummary {
  id: string
  name: string
  description?: string
  stepCount: number
}

const props = defineProps<{
  workflows: WorkflowSummary[]
  modelValue: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'manage': []
}>()

const selectedId = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedWorkflow = computed(() =>
  props.workflows.find(w => w.id === selectedId.value)
)
</script>

<template>
  <div class="flex items-center gap-2">
    <select
      v-model="selectedId"
      :disabled="disabled"
      class="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option :value="null" disabled>-- 选择工作流 --</option>
      <option
        v-for="wf in workflows"
        :key="wf.id"
        :value="wf.id"
      >
        {{ wf.name }} ({{ wf.stepCount }} 步)
      </option>
    </select>
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 w-9 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      title="管理工作流"
      @click="emit('manage')"
    >
      <Workflow class="h-4 w-4" />
    </button>
  </div>
</template>
