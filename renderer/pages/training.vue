<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import UiButton from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import Slider from '@/components/ui/slider/Slider.vue'

const { t } = useI18n()
const route = useRoute()

const steps = computed(() => [
  { key: 'annotation', label: t('common.dataAnnotation'), to: '/annotation' },
  { key: 'training', label: t('common.dataTraining'), to: '/training' },
  { key: 'deploy', label: t('common.serviceDeployment'), to: '/deploy' }
])

const innerStep = ref<'augment' | 'train' | 'monitor'>('augment')

const productId = ref<number | null>(null)
const productName = ref('')
const baseImageUrl = ref('')

const augmentParams = ref<
  Array<{ key: 'brightness' | 'contrast' | 'saturation'; label: string; min: number; max: number; value: number }>
>([
  { key: 'brightness', label: '亮度', min: 0.5, max: 1.5, value: 1 },
  { key: 'contrast', label: '对比度', min: 0.5, max: 1.5, value: 1 },
  { key: 'saturation', label: '饱和度', min: 0.5, max: 1.5, value: 1 },
])

const xParamKey = ref<'brightness' | 'contrast' | 'saturation'>('brightness')
const yParamKey = ref<'brightness' | 'contrast' | 'saturation'>('contrast')
const xDivisions = ref(10)
const yDivisions = ref(6)

const getParam = (key: 'brightness' | 'contrast' | 'saturation') => augmentParams.value.find(p => p.key === key)!
const setParamValue = (key: 'brightness' | 'contrast' | 'saturation', v: number) => {
  const p = getParam(key)
  const clamped = Math.min(p.max, Math.max(p.min, v))
  p.value = Number(clamped.toFixed(2))
}

const xValues = computed(() => {
  const p = getParam(xParamKey.value)
  const step = (p.max - p.min) / Math.max(1, xDivisions.value - 1)
  return Array.from({ length: xDivisions.value }, (_, i) => Number((p.min + i * step).toFixed(2)))
})

const yValues = computed(() => {
  const p = getParam(yParamKey.value)
  const step = (p.max - p.min) / Math.max(1, yDivisions.value - 1)
  return Array.from({ length: yDivisions.value }, (_, i) => Number((p.min + i * step).toFixed(2)))
})

const gridCells = computed(() => {
  return yValues.value.map(y => xValues.value.map(x => ({ x, y })))
})

const getFilterStyle = (x: number, y: number) => {
  const values: Record<'brightness' | 'contrast' | 'saturation', number> = {
    brightness: 1,
    contrast: 1,
    saturation: 1,
  }
  values[xParamKey.value] = x
  values[yParamKey.value] = y
  return `brightness(${values.brightness}) contrast(${values.contrast}) saturate(${values.saturation})`
}

onMounted(async () => {
  const qProductId = route.query.productId
  const qProductName = route.query.productName
  if (qProductId) productId.value = Number(qProductId)
  if (qProductName) productName.value = String(qProductName)

  if (productId.value && window.electronAPI) {
    const files = await window.electronAPI.getProductImages(productId.value)
    if (files && files.length > 0) {
      const url = await window.electronAPI.loadImage(files[0])
      baseImageUrl.value = url || ''
    }
  }
})
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
      <div class="max-w-[1400px] mx-auto space-y-6">
        <div class="flex items-center justify-center gap-16">
          <button
            class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold"
            :class="innerStep === 'augment' ? 'bg-primary text-primary-foreground border-primary' : ''"
            @click="innerStep = 'augment'"
          >
            1
          </button>
          <div class="h-[2px] w-40 bg-border"></div>
          <button
            class="w-12 h-12 rounded-full border flex items-center justify-center text-lg font-bold"
            :class="innerStep === 'train' ? 'bg-primary text-primary-foreground border-primary' : ''"
            @click="innerStep = 'train'"
          >
            2
          </button>
          <div class="h-[2px] w-40 bg-border"></div>
          <button
            class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold"
            :class="innerStep === 'monitor' ? 'bg-primary text-primary-foreground border-primary' : ''"
            @click="innerStep = 'monitor'"
          >
            3
          </button>
        </div>

        <div v-if="innerStep === 'augment'" class="grid grid-cols-[360px,1fr] gap-6">
          <aside class="border rounded-xl bg-background p-4 flex flex-col gap-4">
            <div v-for="p in augmentParams" :key="p.key" class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full border"></div>
              <div class="flex-1 space-y-1">
                <Label>{{ p.label }}</Label>
                <div class="flex items-center gap-2">
                  <Input type="number" v-model="p.value" :min="p.min" :max="p.max" step="0.01" class="w-28" />
                  <span class="text-xs text-muted-foreground">范围 {{ p.min }} - {{ p.max }}</span>
                </div>
              </div>
            </div>
            <Separator />
            <div class="mt-auto">
              <UiButton class="w-full" @click="innerStep = 'train'">下一步</UiButton>
            </div>
          </aside>

          <section class="border rounded-xl bg-background p-4 relative overflow-hidden">
            <div class="grid" :style="`grid-template-columns: repeat(${xDivisions}, minmax(0,1fr)); grid-auto-rows: 120px; gap: 8px;`">
              <template v-for="(row, rIdx) in gridCells" :key="rIdx">
                <div
                  v-for="cell in row"
                  :key="`${cell.x}-${cell.y}`"
                  class="rounded-md border overflow-hidden bg-muted/30 relative"
                  :style="{ filter: getFilterStyle(cell.x, cell.y) }"
                >
                  <img v-if="baseImageUrl" :src="baseImageUrl" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full bg-muted"></div>
                  <div class="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] rounded bg-background/80 border">
                    {{ xParamKey }}={{ cell.x }} | {{ yParamKey }}={{ cell.y }}
                  </div>
                </div>
              </template>
            </div>

            <div class="absolute left-4 top-4 bottom-16 w-6 flex items-center justify-center">
              <input
                type="range"
                :min="getParam(yParamKey).min"
                :max="getParam(yParamKey).max"
                step="0.01"
                :value="getParam(yParamKey).value"
                @input="setParamValue(yParamKey, Number(($event.target as HTMLInputElement).value))"
                class="w-[180px] rotate-90 origin-center"
              />
            </div>
            <div class="absolute left-16 right-4 bottom-4 h-6 flex items-center">
              <input
                type="range"
                :min="getParam(xParamKey).min"
                :max="getParam(xParamKey).max"
                step="0.01"
                :value="getParam(xParamKey).value"
                @input="setParamValue(xParamKey, Number(($event.target as HTMLInputElement).value))"
                class="w-full"
              />
            </div>
          </section>
        </div>

        <div v-else-if="innerStep === 'train'" class="grid grid-cols-[360px,1fr] gap-6">
          <aside class="border rounded-xl bg-background p-4 space-y-4">
            <div class="space-y-1">
              <Label>训练轮数</Label>
              <Slider :default-value="[10]" :min="1" :max="100" />
            </div>
            <div class="space-y-1">
              <Label>批大小</Label>
              <Slider :default-value="[8]" :min="1" :max="64" />
            </div>
            <div class="space-y-1">
              <Label>学习率</Label>
              <Input type="number" :value="0.001" class="w-28" />
            </div>
            <Separator />
            <UiButton>开始训练</UiButton>
          </aside>
          <section class="border rounded-xl bg-background p-4">
            <div class="text-sm font-bold mb-2">训练配置摘要</div>
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-lg border p-4">
                <div class="text-xs text-muted-foreground mb-1">数据增强</div>
                <div class="text-sm">亮度、对比度、饱和度</div>
              </div>
              <div class="rounded-lg border p-4">
                <div class="text-xs text-muted-foreground mb-1">模型与优化器</div>
                <div class="text-sm">占位</div>
              </div>
            </div>
          </section>
        </div>

        <div v-else class="grid grid-cols-[360px,1fr] gap-6">
          <aside class="border rounded-xl bg-background p-4 space-y-4">
            <div class="space-y-1">
              <Label>当前任务</Label>
              <div class="text-sm">产品 {{ productName || '未选择' }}</div>
            </div>
            <Separator />
            <UiButton>返回训练参数</UiButton>
          </aside>
          <section class="border rounded-xl bg-background p-4 space-y-4">
            <div class="rounded-lg border p-6">
              <div class="text-sm font-bold mb-2">训练进度</div>
              <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div class="h-2 bg-primary w-1/3"></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-lg border p-6 h-48"></div>
              <div class="rounded-lg border p-6 h-48"></div>
            </div>
          </section>
        </div>
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
