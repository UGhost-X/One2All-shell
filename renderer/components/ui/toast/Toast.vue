<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
  duration?: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

const addToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
  const id = nextId++
  toasts.value.push({ id, message, type, duration })
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

const removeToast = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

defineExpose({
  addToast,
  success: (msg: string, dur?: number) => addToast(msg, 'success', dur),
  error: (msg: string, dur?: number) => addToast(msg, 'error', dur),
  warning: (msg: string, dur?: number) => addToast(msg, 'warning', dur),
  info: (msg: string, dur?: number) => addToast(msg, 'info', dur)
})

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success': return CheckCircle2
    case 'error': return XCircle
    case 'warning': return AlertCircle
    case 'info': return Info
  }
}

const getTypeStyles = (type: ToastType) => {
  switch (type) {
    case 'success': return 'border-emerald-500/20 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-50'
    case 'error': return 'border-destructive/20 bg-destructive/5 text-destructive dark:bg-destructive/10'
    case 'warning': return 'border-amber-500/20 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-50'
    case 'info': return 'border-blue-500/20 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-50'
  }
}

const getIconStyles = (type: ToastType) => {
  switch (type) {
    case 'success': return 'text-emerald-500'
    case 'error': return 'text-destructive'
    case 'warning': return 'text-amber-500'
    case 'info': return 'text-blue-500'
  }
}
</script>

<template>
  <div class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-md pointer-events-none">
    <TransitionGroup 
      name="toast"
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform -translate-y-2 opacity-0 scale-95"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md min-w-[320px] max-w-full"
        :class="getTypeStyles(toast.type)"
      >
        <component :is="getIcon(toast.type)" class="h-5 w-5 shrink-0" :class="getIconStyles(toast.type)" />
        <p class="flex-1 text-sm font-medium leading-tight">{{ toast.message }}</p>
        <button 
          @click="removeToast(toast.id)"
          class="shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X class="h-4 w-4 opacity-50 hover:opacity-100" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-move {
  transition: all 0.3s ease;
}
</style>
