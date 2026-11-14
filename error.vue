<template>
  <main class="flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <p class="eyebrow">Error {{ error?.statusCode || 500 }}</p>
    <h1 class="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
      {{ is404 ? 'Page not found' : 'Something went wrong' }}
    </h1>
    <p class="mt-4 max-w-md" style="color: var(--muted)">
      {{ is404 ? "The page you're looking for doesn't exist or has moved." : 'Please try again in a moment.' }}
    </p>
    <button type="button" class="btn btn-primary mt-8" @click="clearError({ redirect: '/' })">
      Back to home
    </button>
  </main>
</template>

<script setup>
const props = defineProps({ error: Object })
const is404 = computed(() => props.error?.statusCode === 404)

useHead({
  title: is404.value ? 'Page not found | Rutvik Shah' : 'Error | Rutvik Shah',
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>
