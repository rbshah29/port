<template>
  <section id="contact" class="contact reveal px-6 py-14 sm:px-12">
    <p class="eyebrow flex items-center gap-3">
      <span>04</span>
      <span class="h-px w-10" style="background: linear-gradient(90deg, var(--imperial), var(--mint))"></span>
      <span style="color: var(--muted)">Contact</span>
    </p>
    <h2 class="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Get In <span style="color: var(--mint)">Touch!</span></h2>
    <p class="prose-muted mt-5 max-w-xl text-lg">
        Want to grab a virtual coffee and talk about life, work, or the latest trends? Hit me up! My <a :href="`mailto:${email}`" class="link">inbox</a> is always open.
    </p>
    <div class="mt-8 flex flex-wrap items-center gap-3">
      <a :href="`mailto:${email}`" class="btn btn-primary">Say hello</a>
      <button type="button" class="btn btn-ghost font-mono text-xs" @click="copyEmail">{{ email }}</button>
    </div>
  </section>
</template>

<script setup>
const { email, copyEmail } = useCopyEmail()
</script>

<style scoped>
.contact {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid var(--line);
  background:
    radial-gradient(70% 90% at 0% 0%, rgba(0, 35, 149, 0.55), transparent 70%),
    radial-gradient(60% 80% at 100% 100%, rgba(88, 111, 124, 0.3), transparent 70%),
    #05080a;
}
</style>
