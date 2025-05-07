// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [],
  css: [
    '~/assets/css/main.css',
  ],
  app: {
    head: {
      title: 'Transcription Practice',
      meta: [
        { name: 'description', content: 'Practice and improve your transcription skills' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ]
    }
  },
  runtimeConfig: {
    // Private keys that are only available on the server
    youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
    // Public keys that are also available on the client
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  }
})
