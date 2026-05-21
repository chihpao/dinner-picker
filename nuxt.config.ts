export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  experimental: {
    payloadExtraction: false,
    appManifest: false,
  },

  devServer: {
    port: 4211,
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    baseURL: '/dinner-picker/',
    buildAssetsDir: 'assets',
    head: {
      title: '孜保吃晚餐',
      link: [
        { rel: 'icon', type: 'image/png', href: '/dinner-picker/favicon.png' },
        { rel: 'manifest', href: '/dinner-picker/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/dinner-picker/pwa-512x512.png' },
        { rel: 'mask-icon', href: '/dinner-picker/safari-pinned-tab.svg', color: '#FFFFFF' }
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#4f46e5' }
      ]
    },
    pageTransition: { name: 'fade', mode: 'out-in' }
  },
  nitro: {
    preset: 'github-pages'
  },

  modules: [
    '@vite-pwa/nuxt',
    '@pinia/nuxt'
  ],

  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    manifest: {
      name: '孜保吃晚餐',
      short_name: '晚餐',
      description: '一個幫助你決定晚餐的應用',
      theme_color: '#030305',
      background_color: '#030305',
      display: 'standalone',
      id: '/dinner-picker/',
      start_url: '/dinner-picker/',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      shortcuts: [
        {
          name: '新增支出',
          short_name: '記帳',
          description: '立即新增一筆消費紀錄',
          url: '/dinner-picker/total/entry',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
        },
        {
          name: '全消費總覽',
          short_name: '總覽',
          description: '查看所有消費統計與列表',
          url: '/dinner-picker/total',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: '/dinner-picker/'
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  }
})
