// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  devServer: {
    port: 3001
  },
  i18n: {
    locales: [
      { code: 'zh', name: '中文', file: 'zh.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'zh',
  strategy: 'no_prefix'
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.PYTHON_PUBLIC_API_BASE || 'http://localhost:8000'
    }
  }
})
