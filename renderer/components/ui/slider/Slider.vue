<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from 'radix-vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: number[]
    defaultValue?: number[]
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    defaultValue: () => [0],
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
  },
)

const emits = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const handleUpdateModelValue = (v: number[] | undefined) => {
  emits('update:modelValue', v ?? [])
}
</script>

<template>
  <SliderRoot
    :model-value="props.modelValue"
    :default-value="props.defaultValue"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    :class="cn('relative flex w-full touch-none select-none items-center', props.class)"
    @update:model-value="handleUpdateModelValue"
  >
    <SliderTrack class="relative h-2 w-full grow overflow-hidden rounded-full bg-oklch(87% 0.065 274.039) border border-input/50">
      <SliderRange class="absolute h-full bg-primary" />
    </SliderTrack>
    <SliderThumb
      class="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderRoot>
</template>
