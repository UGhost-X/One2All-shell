<script setup lang="ts">
</script>

<template>
  <div class="flex h-screen bg-background text-foreground">
    <!-- Sidebar -->
    <aside class="w-64 border-r bg-muted/40 hidden md:block">
      <div class="flex h-14 items-center border-b px-4 font-semibold">
        One2All Console
      </div>
      <div class="p-4 space-y-2">
        <UiButton variant="ghost" class="w-full justify-start">
          Dashboard
        </UiButton>
        <UiButton variant="ghost" class="w-full justify-start">
          Settings
        </UiButton>
        <UiButton variant="ghost" class="w-full justify-start">
          Users
        </UiButton>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-14 border-b flex items-center px-6 bg-background">
        <h1 class="text-lg font-medium">Dashboard</h1>
        <div class="ml-auto">
          <UiButton variant="outline" size="sm">Logout</UiButton>
        </div>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-auto p-6">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <!-- Card 1 -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 class="text-2xl font-semibold leading-none tracking-tight">Total Users</h3>
            <p class="text-sm text-muted-foreground mt-2">Active users in the system</p>
            <div class="mt-4 text-3xl font-bold">1,234</div>
          </div>
          
          <!-- Card 2 -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 class="text-2xl font-semibold leading-none tracking-tight">Revenue</h3>
            <p class="text-sm text-muted-foreground mt-2">Total revenue this month</p>
            <div class="mt-4 text-3xl font-bold">$12,345</div>
          </div>

          <!-- Card 3 -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 class="text-2xl font-semibold leading-none tracking-tight">Active Sessions</h3>
            <p class="text-sm text-muted-foreground mt-2">Currently active sessions</p>
            <div class="mt-4 text-3xl font-bold">42</div>
          </div>
        </div>
        
        <div class="mt-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
           <h3 class="text-lg font-medium mb-4">Recent Activity</h3>
           <div class="space-y-4">
             <div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
               <div>
                 <p class="font-medium">New user registered</p>
                 <p class="text-sm text-muted-foreground">2 minutes ago</p>
               </div>
               <UiButton variant="ghost" size="sm">View</UiButton>
             </div>
             <div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
               <div>
                 <p class="font-medium">Server restart scheduled</p>
                 <p class="text-sm text-muted-foreground">1 hour ago</p>
               </div>
               <UiButton variant="ghost" size="sm">View</UiButton>
             </div>
           </div>
        </div>
      </div>
    </main>
  </div>
</template>
