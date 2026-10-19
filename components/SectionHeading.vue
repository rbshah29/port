<template>
  <header class="reveal mb-10">
    <p class="eyebrow flex items-center gap-3">
      <span>{{ number }}</span>
      <span class="heading-rule" aria-hidden="true"></span>
      <span style="color: var(--muted)">{{ label }}</span>
    </p>
    <h2 class="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
      <slot />
    </h2>
  </header>
</template>

<script setup>
defineProps({
  number: { type: String, required: true },
  label: { type: String, required: true },
})
</script>

<style>
/* Grows in once the heading scrolls into view */
.heading-rule {
  width: 2.5rem;
  height: 1px;
  background: linear-gradient(90deg, var(--imperial), var(--mint));
  transform-origin: left;
  transition: transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.2s;
}

.reveal-ready .reveal:not(.is-visible) .heading-rule {
  transform: scaleX(0);
}
</style>
