export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@prisma/nuxt", "@nuxt/icon"],
  css: ["~/assets/scss/main.scss"],
});
