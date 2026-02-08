<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()

const steps = computed(() => [
  { key: 'annotation', label: t('common.dataAnnotation'), to: '/annotation' },
  { key: 'training', label: t('common.dataTraining'), to: '/training' },
  { key: 'deploy', label: t('common.serviceDeployment'), to: '/deploy' }
])
</script>

<template>
  <div class="flex flex-col h-screen bg-background text-foreground overflow-hidden">
    <header class="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 z-20">
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
