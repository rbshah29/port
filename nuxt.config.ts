// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Public Web3Forms access key (safe to expose; it only delivers to my inbox)
      web3formsKey: '0b027a67-9fc7-49ea-88bb-34b31acecff9',
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    head: {
      title: 'Rutvik Shah | Software Developer',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Rutvik Shah full-stack software developer in Montreal building APIs, web apps and mobile apps.' },
        { name: 'theme-color', content: '#0c0c0d' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/test.png' },  // if using .png
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },

  compatibilityDate: '2025-01-06',
})
