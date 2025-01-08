// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    head: {
      title: 'Rutvik Shah',
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon.png' }  // if using .png
      ]
    }
  },

  compatibilityDate: '2025-01-06',
})