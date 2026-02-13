<script setup lang="ts">
import Toast from '@/components/ui/toast/Toast.vue'
import { ref, provide } from 'vue'

const toastRef = ref()

// Provide toast globally
provide('toast', {
  success: (msg: string) => toastRef.value?.success(msg),
  error: (msg: string) => toastRef.value?.error(msg),
  warning: (msg: string) => toastRef.value?.warning(msg),
  info: (msg: string) => toastRef.value?.info(msg)
})
</script>

<template>
  <div>
    <NuxtPage />
    <Toast ref="toastRef" />
  </div>
</template>

<style>
/* Global styles can go here */
</style>
