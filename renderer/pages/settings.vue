<script setup lang="ts">
import { 
  ChevronLeft, 
  FolderOpen, 
  Save,
  Monitor,
  Database,
  Globe,
  Server,
  Wifi
} from 'lucide-vue-next'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'

const { t, locale, setLocale } = useI18n()
const route = useRoute()
const router = useRouter()

const dataPath = ref('C:/Users/Public/One2All/Data')
const isSaving = ref(false)
const showSavedMessage = ref(false)

const backendMode = ref<'local' | 'remote'>('local')
const backendUrl = ref('http://localhost:8000')
const backendPort = ref('8000')

const isLocalMode = computed(() => backendMode.value === 'local')

const handleBack = async () => {
  const from = route.query.from
  if (typeof from === 'string' && from) {
    await router.push(from)
    return
  }

  if (window.history.length > 1) {
    router.back()
    return
  }

  await router.push('/')
}

onMounted(async () => {
  if (window.electronAPI?.getSettings) {
    const settings = await window.electronAPI.getSettings()
    if (settings.dataPath) dataPath.value = settings.dataPath
    if (settings.backendMode) backendMode.value = settings.backendMode
    if (settings.backendUrl) backendUrl.value = settings.backendUrl
    if (settings.backendPort) backendPort.value = settings.backendPort
  }
})

const handleSave = async () => {
  isSaving.value = true
  
  const finalUrl = backendMode.value === 'local' 
    ? `http://localhost:${backendPort.value}` 
    : backendUrl.value
  
  if (window.electronAPI?.saveSettings) {
    await window.electronAPI.saveSettings({
      dataPath: dataPath.value,
      locale: locale.value,
      backendMode: backendMode.value,
      backendUrl: finalUrl,
      backendPort: backendPort.value
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

const changeBackendMode = (mode: 'local' | 'remote') => {
  backendMode.value = mode
}
</script>

<template>
  <div class="flex flex-col h-screen bg-background text-foreground overflow-hidden">
    <header class="h-14 border-b flex items-center px-6 bg-card shrink-0 z-20 shadow-sm">
      <div class="flex items-center gap-4">
        <UiButton variant="ghost" size="icon" class="h-8 w-8" @click="handleBack">
          <ChevronLeft class="h-5 w-5" />
        </UiButton>
        <h1 class="text-lg font-bold tracking-tight">{{ t('settings.title') }}</h1>
      </div>
    </header>

    <main class="flex-1 overflow-auto bg-muted/20 p-8">
      <div class="max-w-2xl mx-auto space-y-6">
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

        <section class="space-y-3">
          <div class="flex items-center gap-2 text-muted-foreground px-1">
            <Server class="h-3.5 w-3.5" />
            <h2 class="text-[11px] font-bold uppercase tracking-wider">后端服务配置</h2>
          </div>
          
          <UiCard>
            <UiCardContent class="pt-6 space-y-6">
              <div class="space-y-3">
                <div class="space-y-1">
                  <Label>运行模式</Label>
                  <div class="text-[11px] text-muted-foreground font-medium">选择本地模型或远程服务器</div>
                </div>
                <div class="flex items-center gap-3">
                  <UiButton 
                    :variant="backendMode === 'local' ? 'default' : 'outline'" 
                    size="sm"
                    class="flex-1"
                    @click="changeBackendMode('local')"
                  >
                    <Wifi class="h-4 w-4 mr-2" />
                    本地模式
                  </UiButton>
                  <UiButton 
                    :variant="backendMode === 'remote' ? 'default' : 'outline'" 
                    size="sm"
                    class="flex-1"
                    @click="changeBackendMode('remote')"
                  >
                    <Globe class="h-4 w-4 mr-2" />
                    远程模式
                  </UiButton>
                </div>
              </div>

              <div v-if="backendMode === 'local'" class="space-y-3">
                <div class="space-y-1">
                  <Label>本地端口</Label>
                  <div class="text-[11px] text-muted-foreground font-medium">Python后端服务运行的端口号</div>
                </div>
                <Input 
                  v-model="backendPort"
                  type="number"
                  placeholder="8000"
                  class="font-mono text-sm max-w-[200px]"
                />
              </div>

              <div v-if="backendMode === 'remote'" class="space-y-3">
                <div class="space-y-1">
                  <Label>远程服务地址</Label>
                  <div class="text-[11px] text-muted-foreground font-medium">输入远程Python后端的完整URL地址</div>
                </div>
                <Input 
                  v-model="backendUrl"
                  type="url"
                  placeholder="http://192.168.1.100:8000"
                  class="font-mono text-sm"
                />
              </div>

              <div class="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div class="w-2 h-2 rounded-full" :class="backendMode === 'local' ? 'bg-green-500' : 'bg-blue-500'"></div>
                <span class="text-xs text-muted-foreground">
                  当前配置: 
                  <code class="bg-background px-1.5 py-0.5 rounded text-xs">
                    {{ backendMode === 'local' ? `http://localhost:${backendPort}` : backendUrl }}
                  </code>
                </span>
              </div>
            </UiCardContent>
          </UiCard>
        </section>

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
