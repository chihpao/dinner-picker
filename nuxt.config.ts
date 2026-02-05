// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

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
        { rel: 'manifest', href: '/dinner-picker/manifest.webmanifest' }, // Explicitly add manifest link
        { rel: 'apple-touch-icon', href: '/dinner-picker/pwa-192x192.png' }, // For iOS PWA
        { rel: 'mask-icon', href: '/dinner-picker/safari-pinned-tab.svg', color: '#FFFFFF' } // For Safari pinned tabs
      ],
      meta: [
        { name: 'theme-color', content: '#FFFFFF' } // Theme color for browsers/PWA
      ]
    }
  },
  nitro: {
    preset: 'github-pages'
  },

  modules: [
    '@vite-pwa/nuxt'
  ],

  pwa: {
    strategies: 'generateSW', // Or 'injectManifest'
    registerType: 'autoUpdate',
    manifest: {
      name: '孜保吃晚餐',
      short_name: '晚餐',
      description: '一個幫助你決定晚餐的應用',
      theme_color: '#FFFFFF',
      background_color: '#FFFFFF',
      display: 'standalone',
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
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: '/dinner-picker/',
      // Other workbox options
    },
    client: {
      installPrompt: true, // Enable the install prompt
      // Other client options
    },
    devOptions: {
      enabled: true, // Enable PWA in development for testing
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
      // Other devOptions
    }
  }
})
