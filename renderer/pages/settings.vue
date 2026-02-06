<script setup lang="ts">
import { 
  ChevronLeft, 
  FolderOpen, 
  Save,
  Monitor,
  Database
} from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'

const { t, locale, setLocale } = useI18n()

const dataPath = ref('C:/Users/Public/One2All/Data')
const isSaving = ref(false)
const showSavedMessage = ref(false)

onMounted(async () => {
  if (window.electronAPI?.getSettings) {
    const settings = await window.electronAPI.getSettings()
    if (settings.dataPath) dataPath.value = settings.dataPath
  }
})

const handleSave = async () => {
  isSaving.value = true
  
  if (window.electronAPI?.saveSettings) {
    await window.electronAPI.saveSettings({
      dataPath: dataPath.value,
      locale: locale.value
    })
  }

  setTimeout(() => {
    isSaving.value = false
    showSavedMessage.value = true
    setTimeout(() => {
      showSavedMessage.value = false
    }, 3000)
  }, 500)
}

const browseFolder = async () => {
  if (window.electronAPI?.selectDirectory) {
    const path = await window.electronAPI.selectDirectory()
    if (path) dataPath.value = path
  }
}

const changeLanguage = (lang: 'zh' | 'en') => {
  setLocale(lang)
}
</script>

<template>
  <div class="flex flex-col h-screen bg-background text-foreground overflow-hidden">
    <!-- Header -->
    <header class="h-14 border-b flex items-center px-6 bg-card shrink-0 z-20 shadow-sm">
      <div class="flex items-center gap-4">
        <NuxtLink to="/">
          <UiButton variant="ghost" size="icon" class="h-8 w-8">
            <ChevronLeft class="h-5 w-5" />
          </UiButton>
        </NuxtLink>
        <h1 class="text-lg font-bold tracking-tight">{{ t('settings.title') }}</h1>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-auto bg-muted/20 p-8">
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- General Settings -->
        <section class="space-y-3">
          <div class="flex items-center gap-2 text-muted-foreground px-1">
            <Monitor class="h-3.5 w-3.5" />
            <h2 class="text-[11px] font-bold uppercase tracking-wider">{{ t('settings.general') }}</h2>
          </div>
          
          <UiCard>
            <UiCardContent class="pt-6">
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <Label>{{ t('settings.language') }}</Label>
                  <div class="text-[11px] text-muted-foreground font-medium">选择界面的显示语言</div>
                </div>
                <div class="flex items-center gap-2">
                  <UiButton 
                    :variant="locale === 'zh' ? 'default' : 'outline'" 
                    size="sm"
                    class="w-20"
                    @click="changeLanguage('zh')"
                  >
                    中文
                  </UiButton>
                  <UiButton 
                    :variant="locale === 'en' ? 'default' : 'outline'" 
                    size="sm"
                    class="w-20"
                    @click="changeLanguage('en')"
                  >
                    English
                  </UiButton>
                </div>
              </div>
            </UiCardContent>
          </UiCard>
        </section>

        <!-- Storage Settings -->
        <section class="space-y-3">
          <div class="flex items-center gap-2 text-muted-foreground px-1">
            <Database class="h-3.5 w-3.5" />
            <h2 class="text-[11px] font-bold uppercase tracking-wider">{{ t('settings.storage') }}</h2>
          </div>
          
          <UiCard>
            <UiCardContent class="pt-6 space-y-4">
              <div class="space-y-3">
                <div class="space-y-1">
                  <Label>{{ t('settings.dataDir') }}</Label>
                  <div class="text-[11px] text-muted-foreground font-medium">用于存储拍摄的照片和预测数据</div>
                </div>
                <div class="flex gap-2">
                  <Input 
                    v-model="dataPath"
                    readonly
                    class="font-mono text-xs"
                  />
                  <UiButton variant="outline" class="shrink-0" @click="browseFolder">
                    <FolderOpen class="mr-2 h-4 w-4" />
                    {{ t('settings.browse') }}
                  </UiButton>
                </div>
              </div>
            </UiCardContent>
          </UiCard>
        </section>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-4 pt-2">
          <transition name="fade">
            <span v-if="showSavedMessage" class="text-xs text-green-600 font-bold flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
              {{ t('settings.saved') }}
            </span>
          </transition>
          
          <UiButton 
            class="min-w-[120px]" 
            @click="handleSave"
            :disabled="isSaving"
          >
            <Save v-if="!isSaving" class="mr-2 h-4 w-4" />
            <div v-else class="mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            {{ t('settings.save') }}
          </UiButton>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
