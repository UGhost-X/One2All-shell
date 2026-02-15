<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Settings2, Pin, PinOff, Settings, Home, Edit3, Zap, Server } from 'lucide-vue-next'
import UiButton from '@/components/ui/button/Button.vue'

const { t } = useI18n()
const route = useRoute()

const isPinned = ref(false)
const currentProductId = ref<number | null>(null)

const togglePin = async () => {
  if (window.electronAPI) {
    isPinned.value = await window.electronAPI.toggleAlwaysOnTop()
  }
}

onMounted(async () => {
  if (window.electronAPI) {
    isPinned.value = await window.electronAPI.isAlwaysOnTop()
  }
  
  const qProductId = route.query.productId
  if (qProductId) {
    currentProductId.value = Number(qProductId)
  }
})

watch(() => route.query.productId, (newId) => {
  if (newId) {
    currentProductId.value = Number(newId)
  }
})

// 构建带productId的链接
const getNavTo = (path: string) => {
  if (path === '/') return '/'
  if (currentProductId.value) {
    return { path, query: { productId: currentProductId.value } }
  }
  return path
}

const navItems = computed(() => [
  { key: 'home', label: t('common.home'), to: '/', icon: Home },
  { key: 'annotation', label: t('common.dataAnnotation'), to: '/annotation', icon: Edit3 },
  { key: 'training', label: t('common.dataTraining'), to: '/training', icon: Zap },
  { key: 'deploy', label: t('common.serviceDeployment'), to: '/deploy', icon: Server }
])

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

// 主页不显示header
const showHeader = computed(() => route.path !== '/')
</script>

<template>
  <header v-if="showHeader" class="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 z-20">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
        <Settings2 class="h-5 w-5" />
      </div>
      <h1 class="text-lg font-bold tracking-tight">{{ t('common.appName') }}</h1>
    </div>

    <div class="flex-1 flex items-center justify-center">
      <nav class="flex items-center gap-1 bg-muted/50 rounded-full p-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="getNavTo(item.to)"
          :class="[
            'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            isActive(item.to) 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          ]"
        >
          <component :is="item.icon" class="h-4 w-4" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="flex items-center gap-2">
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
</template>
