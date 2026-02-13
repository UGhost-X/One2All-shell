<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Settings2, Pin, PinOff, Settings } from 'lucide-vue-next'
import UiButton from '@/components/ui/button/Button.vue'

const { t } = useI18n()
const route = useRoute()

definePageMeta({ keepalive: true })

const isPinned = ref(false)
const togglePin = async () => {
  if (window.electronAPI) {
    isPinned.value = await window.electronAPI.toggleAlwaysOnTop()
  }
}

onMounted(async () => {
  if (window.electronAPI) {
    isPinned.value = await window.electronAPI.isAlwaysOnTop()
  }
})

const steps = computed(() => [
  { key: 'annotation', label: t('common.dataAnnotation'), to: '/annotation' },
  { key: 'training', label: t('common.dataTraining'), to: '/training' },
  { key: 'deploy', label: t('common.serviceDeployment'), to: '/deploy' }
])
</script>

<template>
  <div class="flex flex-col h-screen bg-background text-foreground overflow-hidden">
    <header class="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 z-20">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">
          <Settings2 class="h-5 w-5" />
        </div>
        <h1 class="text-lg font-bold tracking-tight">{{ t('common.appName') }}</h1>
      </div>

      <div class="flex-1 flex items-center justify-center">
        <nav class="step-nav">
          <NuxtLink
            v-for="(step, index) in steps"
            :key="step.key"
            :to="step.to"
            :class="[
              'step-item',
              index === 0 ? 'step-first' : index === steps.length - 1 ? 'step-last' : 'step-middle',
              route.path === step.to ? 'step-active' : 'step-inactive'
            ]"
          >
            <span class="step-label">{{ step.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <UiButton 
          variant="ghost" 
          size="icon" 
          @click="togglePin"
          :title="isPinned ? t('common.unpin') : t('common.pin')"
          :class="{ 'text-primary bg-primary/10': isPinned }"
        >
          <component :is="isPinned ? PinOff : Pin" class="h-4 w-4" />
        </UiButton>
        
        <NuxtLink :to="{ path: '/settings', query: { from: route.fullPath } }">
          <UiButton variant="ghost" size="icon" :title="t('common.settings')">
            <Settings class="h-4 w-4" />
          </UiButton>
        </NuxtLink>
      </div>
    </header>

    <main class="flex-1 overflow-auto bg-muted/20 p-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-lg font-bold">{{ t('common.serviceDeployment') }}</h1>
      </div>
    </main>
  </div>
</template>

<style scoped>
.step-nav {
  display: flex;
  align-items: center;
  height: 36px;
}

.step-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 28px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.step-item:not(.step-first) {
  margin-left: -14px;
}

.step-first {
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 0 50%);
}

.step-middle {
  clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 16px 100%, 0 50%);
}

.step-last {
  clip-path: polygon(16px 0, 100% 0, 100% 100%, 16px 100%, 0 50%);
}

.step-active {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
  z-index: 2;
}

.step-inactive {
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
}

.step-label {
  white-space: nowrap;
}
</style>
