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
        { rel: 'icon', type: 'image/png', href: '/dinner-picker/favicon.png' }
      ]
    }
  },
  nitro: {
    preset: 'github-pages'
  },
})
