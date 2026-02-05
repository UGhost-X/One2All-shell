<script setup lang="ts">
const { t, locale, setLocale } = useI18n()

const toggleLocale = () => {
  const nextLocale = locale.value === 'zh' ? 'en' : 'zh'
  setLocale(nextLocale)
}
</script>

<template>
  <div class="flex h-screen bg-background text-foreground">
    <!-- Sidebar -->
    <aside class="w-64 border-r bg-muted/40 hidden md:block">
      <div class="flex h-14 items-center border-b px-4 font-semibold">
        {{ t('common.appName') }}
      </div>
      <div class="p-4 space-y-2">
        <NuxtLink to="/">
          <UiButton variant="ghost" class="w-full justify-start">
            {{ t('common.dashboard') }}
          </UiButton>
        </NuxtLink>
        <NuxtLink to="/annotation">
          <UiButton variant="ghost" class="w-full justify-start">
            {{ t('common.dataAnnotation') }}
          </UiButton>
        </NuxtLink>
        <UiButton variant="ghost" class="w-full justify-start">
          {{ t('common.settings') }}
        </UiButton>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-14 border-b flex items-center px-6 bg-background">
        <h1 class="text-lg font-medium">{{ t('common.dashboard') }}</h1>
        <div class="ml-auto flex items-center gap-2">
          <UiButton variant="ghost" size="sm" @click="toggleLocale">
            {{ locale === 'zh' ? '中文' : 'English' }}
          </UiButton>
          <UiButton variant="outline" size="sm">{{ t('common.logout') }}</UiButton>
        </div>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-auto p-6">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <!-- Card 1 -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 class="text-2xl font-semibold leading-none tracking-tight">{{ t('dashboard.totalUsers') }}</h3>
            <p class="text-sm text-muted-foreground mt-2">{{ t('dashboard.activeUsersDesc') }}</p>
            <div class="mt-4 text-3xl font-bold">1,234</div>
          </div>
          
          <!-- Card 2 -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 class="text-2xl font-semibold leading-none tracking-tight">{{ t('dashboard.revenue') }}</h3>
            <p class="text-sm text-muted-foreground mt-2">{{ t('dashboard.revenueDesc') }}</p>
            <div class="mt-4 text-3xl font-bold">$12,345</div>
          </div>

          <!-- Card 3 -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 class="text-2xl font-semibold leading-none tracking-tight">{{ t('dashboard.activeSessions') }}</h3>
            <p class="text-sm text-muted-foreground mt-2">{{ t('dashboard.activeSessionsDesc') }}</p>
            <div class="mt-4 text-3xl font-bold">42</div>
          </div>
        </div>
        
        <div class="mt-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
           <h3 class="text-lg font-medium mb-4">{{ t('dashboard.recentActivity') }}</h3>
           <div class="space-y-4">
             <div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
               <div>
                 <p class="font-medium">{{ t('dashboard.newUserRegistered') }}</p>
                 <p class="text-sm text-muted-foreground">{{ t('dashboard.minutesAgo') }}</p>
               </div>
               <UiButton variant="ghost" size="sm">{{ t('common.view') }}</UiButton>
             </div>
             <div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
               <div>
                 <p class="font-medium">{{ t('dashboard.serverRestartScheduled') }}</p>
                 <p class="text-sm text-muted-foreground">{{ t('dashboard.hourAgo') }}</p>
               </div>
               <UiButton variant="ghost" size="sm">{{ t('common.view') }}</UiButton>
             </div>
           </div>
        </div>
      </div>
    </main>
  </div>
</template>
