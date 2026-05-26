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
import { ref, onMounted, onActivated, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'

const { t, locale, setLocale } = useI18n()
const route = useRoute()
const router = useRouter()

const dataPath = ref('C:/Users/Public/One2All/Data')
const isSaving = ref(false)
const showSavedMessage = ref(false)

// Modbus 配置
const modbusEnabled = ref(true)
const modbusIp = ref('192.168.1.12')
const modbusPort = ref(502)
const modbusUnitId = ref(1)
const modbusButtonChannel = ref(1)
const modbusResetChannel = ref(2)
const modbusLightGreen = ref(0)
const modbusLightYellow = ref(1)
const modbusLightRed = ref(2)
const modbusBuzzer = ref(3)

const backendMode = ref<'local' | 'remote'>('local')
const backendIp = ref('127.0.0.1')
const remoteBackendIp = ref('')
const backendUrl = ref('http://127.0.0.1:8000')
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

async function loadSettings() {
  if (!window.electronAPI?.getSettings) return
  const settings = await window.electronAPI.getSettings()
  if (settings.dataPath) dataPath.value = settings.dataPath
  if (settings.backendMode) backendMode.value = settings.backendMode
  if (settings.backendUrl) {
    backendUrl.value = settings.backendUrl
    try {
      const url = new URL(settings.backendUrl)
      if (settings.backendMode === 'remote') {
        remoteBackendIp.value = url.hostname
      } else {
        backendIp.value = url.hostname
      }
      backendPort.value = url.port || '8000'
    } catch {
      if (settings.backendMode === 'remote') {
        remoteBackendIp.value = ''
      }
    }
  } else if (settings.backendIp) {
    backendIp.value = settings.backendIp
  }
  if (settings.backendPort) backendPort.value = settings.backendPort
  if (settings.modbusSettings) {
    modbusEnabled.value = settings.modbusSettings.enabled !== false
    modbusIp.value = settings.modbusSettings.ip || '192.168.1.12'
    modbusPort.value = settings.modbusSettings.port || 502
    modbusUnitId.value = settings.modbusSettings.unitId || 1
    modbusButtonChannel.value = settings.modbusSettings.buttonChannel ?? 1
    modbusResetChannel.value = settings.modbusSettings.resetChannel ?? 2
    modbusLightGreen.value = settings.modbusSettings.lightGreen ?? 0
    modbusLightYellow.value = settings.modbusSettings.lightYellow ?? 1
    modbusLightRed.value = settings.modbusSettings.lightRed ?? 2
    modbusBuzzer.value = settings.modbusSettings.buzzer ?? 3
  }
}

onMounted(loadSettings)
onActivated(loadSettings)

const handleSave = async () => {
  isSaving.value = true

  const finalUrl = backendMode.value === 'local'
    ? `http://127.0.0.1:${backendPort.value}`
    : `http://${remoteBackendIp.value}:${backendPort.value}`

  if (window.electronAPI?.saveSettings) {
    const success = await window.electronAPI.saveSettings({
      dataPath: dataPath.value,
      locale: locale.value,
      backendMode: backendMode.value,
      backendIp: backendMode.value === 'local' ? '127.0.0.1' : remoteBackendIp.value,
      backendUrl: finalUrl,
      backendPort: backendPort.value,
      modbusSettings: {
        enabled: modbusEnabled.value,
        ip: modbusIp.value,
        port: Number(modbusPort.value),
        unitId: Number(modbusUnitId.value),
        buttonChannel: Number(modbusButtonChannel.value),
        resetChannel: Number(modbusResetChannel.value),
        lightGreen: Number(modbusLightGreen.value),
        lightYellow: Number(modbusLightYellow.value),
        lightRed: Number(modbusLightRed.value),
        buzzer: Number(modbusBuzzer.value)
      }
    })

    if (success) {
      showSavedMessage.value = true
      setTimeout(() => {
        showSavedMessage.value = false
      }, 3000)
    } else {
      alert('保存设置失败，请重试')
    }
  }

  isSaving.value = false
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
          <UiCard>
            <UiCardContent class="pt-6">
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <Label>{{ t('settings.language') }}</Label>
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
          <UiCard>
            <UiCardContent class="pt-6 space-y-6">
              <div class="space-y-3">
                <div class="space-y-1">
                  <Label>运行模式</Label>
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

              <div class="space-y-3">
                <div class="space-y-1">
                  <Label>服务地址</Label>
                </div>
                <div class="flex items-center gap-2">
                  <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">http://</span>
                    <Input
                      :model-value="backendMode === 'local' ? '127.0.0.1' : remoteBackendIp"
                      @update:model-value="remoteBackendIp = $event"
                      :readonly="backendMode === 'local'"
                      :placeholder="backendMode === 'local' ? '127.0.0.1' : '输入远程IP'"
                      class="font-mono text-sm pl-[60px]"
                    />
                  </div>
                  <span class="text-muted-foreground">:</span>
                  <Input
                    v-model="backendPort"
                    type="number"
                    placeholder="8000"
                    class="font-mono text-sm w-[100px]"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div class="w-2 h-2 rounded-full" :class="backendMode === 'local' ? 'bg-green-500' : 'bg-blue-500'"></div>
                <span class="text-xs text-muted-foreground">
                  当前配置:
                  <code class="bg-background px-1.5 py-0.5 rounded text-xs">
                    {{ backendMode === 'local' ? `http://127.0.0.1:${backendPort}` : `http://${remoteBackendIp}:${backendPort}` }}
                  </code>
                </span>
              </div>
            </UiCardContent>
          </UiCard>
        </section>

        <section class="space-y-3">
          <UiCard>
            <UiCardContent class="pt-6 space-y-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="space-y-1">
                    <Label>Modbus 按钮监控配置</Label>
                    <p class="text-xs text-muted-foreground">配置外部按钮的 Modbus 通信参数</p>
                  </div>
                  <UiButton
                    :variant="modbusEnabled ? 'default' : 'outline'"
                    size="sm"
                    @click="modbusEnabled = !modbusEnabled"
                  >
                    {{ modbusEnabled ? '已启用' : '已禁用' }}
                  </UiButton>
                </div>
                <div v-if="modbusEnabled" class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <Label class="text-xs">IP 地址</Label>
                    <Input v-model="modbusIp" placeholder="192.168.1.12" class="font-mono text-sm" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-xs">端口</Label>
                    <Input v-model.number="modbusPort" type="number" placeholder="502" class="font-mono text-sm" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-xs">从站 ID</Label>
                    <Input v-model.number="modbusUnitId" type="number" placeholder="1" class="font-mono text-sm" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-xs">拍照按钮 DI 通道</Label>
                    <Input v-model.number="modbusButtonChannel" type="number" placeholder="1" class="font-mono text-sm" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-xs">复位按钮 DI 通道</Label>
                    <Input v-model.number="modbusResetChannel" type="number" placeholder="2" class="font-mono text-sm" />
                  </div>
                </div>
                <div v-if="modbusEnabled" class="mt-3 pt-3 border-t">
                  <Label class="text-xs text-muted-foreground mb-3 block">三色灯与蜂鸣器输出通道（线圈）</Label>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <Label class="text-xs">
                        <span class="inline-block w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5 align-middle"></span>
                        绿灯通道
                      </Label>
                      <Input v-model.number="modbusLightGreen" type="number" placeholder="0" class="font-mono text-sm" />
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-xs">
                        <span class="inline-block w-2.5 h-2.5 bg-yellow-500 rounded-full mr-1.5 align-middle"></span>
                        黄灯通道
                      </Label>
                      <Input v-model.number="modbusLightYellow" type="number" placeholder="1" class="font-mono text-sm" />
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-xs">
                        <span class="inline-block w-2.5 h-2.5 bg-red-500 rounded-full mr-1.5 align-middle"></span>
                        红灯通道
                      </Label>
                      <Input v-model.number="modbusLightRed" type="number" placeholder="2" class="font-mono text-sm" />
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-xs">
                        <span class="inline-block w-2.5 h-2.5 bg-amber-700 rounded-full mr-1.5 align-middle"></span>
                        蜂鸣器通道
                      </Label>
                      <Input v-model.number="modbusBuzzer" type="number" placeholder="3" class="font-mono text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </UiCardContent>
          </UiCard>
        </section>

        <section class="space-y-3">
          <UiCard>
            <UiCardContent class="pt-6 space-y-4">
              <div class="space-y-3">
                <div class="space-y-1">
                  <Label>{{ t('settings.dataDir') }}</Label>
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
