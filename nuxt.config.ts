// https://nuxt.com/docs/api/configuration/nuxt-config
const SITE_URL = 'https://rshah.dev'
const SITE_TITLE = 'Rutvik Shah | Software Developer'
const SITE_DESCRIPTION =
  'Rutvik Shah is a full-stack software developer in Montreal, QC, building web apps, mobile apps, REST APIs and backend systems with Vue, Nuxt, Node.js, Python and AWS.'

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
      title: SITE_TITLE,
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: SITE_DESCRIPTION },
        { name: 'author', content: 'Rutvik Shah' },
        { name: 'theme-color', content: '#0c0c0d' },

        // Social previews (LinkedIn, Slack, iMessage, X, ...)
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Rutvik Shah' },
        { property: 'og:title', content: SITE_TITLE },
        { property: 'og:description', content: SITE_DESCRIPTION },
        { property: 'og:url', content: `${SITE_URL}/` },
        { property: 'og:image', content: `${SITE_URL}/og-image.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Rutvik Shah, Full-Stack Software Developer' },
        { property: 'og:locale', content: 'en_CA' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: SITE_TITLE },
        { name: 'twitter:description', content: SITE_DESCRIPTION },
        { name: 'twitter:image', content: `${SITE_URL}/og-image.png` },
      ],
      script: [
        // Structured data so Google knows who this site is about
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Rutvik Shah',
            url: `${SITE_URL}/`,
            image: `${SITE_URL}/og-image.png`,
            jobTitle: 'Full-Stack Software Developer',
            description: SITE_DESCRIPTION,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Montreal',
              addressRegion: 'QC',
              addressCountry: 'CA',
            },
            sameAs: [
              'https://github.com/rbshah29',
              'https://www.linkedin.com/in/rutvik-shah-343945178/',
              'https://www.instagram.com/rbsshah/',
            ],
          }),
        },
      ],
      link: [
        { rel: 'canonical', href: `${SITE_URL}/` },
        { rel: 'icon', type: 'image/png', href: '/icon.png' },
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/icon.png' },
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
