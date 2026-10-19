<template>
  <div class="relative min-h-screen">
    <div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <span class="glow glow-imperial"></span>
      <span class="glow glow-slate"></span>
      <span class="glow glow-mint"></span>
    </div>
    <div class="progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true"></div>

    <div class="relative mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
      <div class="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <aside class="no-scrollbar pt-14 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:py-20">
          <Hero />
        </aside>

        <main class="space-y-28 pt-20 lg:space-y-36 lg:pt-20" id="scroll">
          <About />
          <Experience />
          <Projects />
          <Contact />
          <Footer />
        </main>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </Transition>
  </div>
</template>

<script setup>
const { toast } = useCopyEmail()

const progress = ref(0)
let observer
let frame

const onScroll = () => {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    progress.value = max > 0 ? Math.min(window.scrollY / max, 1) : 0
  })
}

// Feeds the cursor position to whichever card is under the pointer (see .card::before)
const onPointerMove = (e) => {
  const card = e.target.closest?.('.card')
  if (!card) return
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--x', `${e.clientX - rect.left}px`)
  card.style.setProperty('--y', `${e.clientY - rect.top}px`)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  onScroll()

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

  document.documentElement.classList.add('reveal-ready')
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointerMove)
  cancelAnimationFrame(frame)
  observer?.disconnect()
})
</script>

<style scoped>
.progress {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 40;
  height: 2px;
  transform-origin: 0 50%;
  background: linear-gradient(90deg, var(--imperial), var(--mint));
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  z-index: 50;
  transform: translateX(-50%);
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--text);
  background: #0a1114;
  border: 1px solid var(--imperial-light);
  box-shadow: 0 12px 30px -14px var(--imperial);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
