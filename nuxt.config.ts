// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  nitro: {
    preset: 'aws-lambda',
    serveStatic: true
  },
  routeRules: {
    '/api/**': {
      proxy: { to: 'https://j5zrnslyef.execute-api.ap-northeast-1.amazonaws.com/api/**' },
      cors: true
    },
    // '/images/**': {
    //   proxy: { to: 'https://hydrangea-photo.s3.ap-northeast-1.amazonaws.com/**' },
    //   cors: true
    // }
  },
})
