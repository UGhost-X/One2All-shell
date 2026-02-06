<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { TabsRoot } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: string
  defaultValue?: string
  orientation?: 'horizontal' | 'vertical'
  dir?: 'ltr' | 'rtl'
  activationMode?: 'automatic' | 'manual'
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <TabsRoot
    :model-value="props.modelValue"
    :default-value="props.defaultValue"
    :orientation="props.orientation"
    :dir="props.dir"
    :activation-mode="props.activationMode"
    :class="cn('w-full', props.class)"
    @update:model-value="(v) => emits('update:modelValue', v)"
  >
    <slot />
  </TabsRoot>
</template>
