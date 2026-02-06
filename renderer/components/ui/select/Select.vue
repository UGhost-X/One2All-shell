<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { SelectRoot } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  name?: string
  open?: boolean
  defaultOpen?: boolean
  dir?: 'ltr' | 'rtl'
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:open', value: boolean): void
}>()
</script>

<template>
  <SelectRoot
    :model-value="props.modelValue"
    :default-value="props.defaultValue"
    :disabled="props.disabled"
    :required="props.required"
    :name="props.name"
    :open="props.open"
    :default-open="props.defaultOpen"
    :dir="props.dir"
    :class="cn(props.class)"
    @update:model-value="(v) => emits('update:modelValue', v)"
    @update:open="(v) => emits('update:open', v)"
  >
    <slot />
  </SelectRoot>
</template>
