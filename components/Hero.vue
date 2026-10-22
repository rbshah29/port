<template>
    <div class="flex h-full flex-col justify-between gap-10">
        <div>
            <div class="flex items-center gap-4">
                <img :src="profile" alt="Rutvik Shah" class="h-[7rem] w-[7rem] object-cover">
                <div>
                    <p class="text-sm font-medium">Software Developer</p>
                    <p class="mt-0.5 inline-flex items-center gap-1 text-xs" style="color: var(--muted);">
                    <svg class="h-3.5 w-3.5" style="color: var(--mint)" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5.64 16.36a9 9 0 1 1 12.72 0l-5.65 5.66a1 1 0 0 1-1.42 0l-5.65-5.66zm11.31-1.41a7 7 0 1 0-9.9 0L12 19.9l4.95-4.95zM12 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    </svg>
                    Montreal, QC
                    </p>
                </div>
            </div>

            <p class="eyebrow mt-10">Hi, i am</p>
            <h1 class="mt-3 font-display text-5xl font-semibold leading-none tracking-tight xl:text-6xl" aria-label="Rutvik Shah">
                <span
                    v-for="(char, i) in 'Rutvik Shah'"
                    :key="i"
                    class="letter"
                    :style="{ animationDelay: `${120 + i * 45}ms` }"
                    aria-hidden="true"
                >{{ char === ' ' ? '\u00a0' : char }}</span>
            </h1>
            <p class="mt-4 whitespace-nowrap text-lg" style="color: var(--muted)">
                I build
                <span class="rotator">
                    <Transition name="word" mode="out-in">
                        <span :key="wordIndex" class="word">{{ words[wordIndex] }}</span>
                    </Transition>
                </span>
            </p>
            <p class="prose-muted mt-4 max-w-md">
                I’m a developer who speaks both backend and frontend fluently (been at it for almost 4 years now).
                Whether it’s building APIs, designing smooth UIs, or just figuring out why something refuses to work, I’m all in.
            </p>
        </div>

        <div>
            <div class="flex flex-wrap items-center gap-3">
                <a href="/Rutvik-Resume.pdf" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    Resume
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
                </a>
                <button type="button" class="btn btn-ghost" @click="copyEmail">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                    Email
                </button>
            </div>

            <div class="-ml-2 mt-5 flex gap-1">
                <a href="https://github.com/rbshah29" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="GitHub">
                    <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clip-rule="evenodd"/>
                    </svg>
                </a>
                <a href="https://www.instagram.com/rbsshah/" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="Instagram">
                    <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-rule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" clip-rule="evenodd"/>
                    </svg>
                </a>
                <a href="https://www.linkedin.com/in/rutvik-shah-343945178/" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="LinkedIn">
                    <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M12.51 8.796v1.697a3.738 3.738 0 0 1 3.288-1.684c3.455 0 4.202 2.16 4.202 4.97V19.5h-3.2v-5.072c0-1.21-.244-2.766-2.128-2.766-1.827 0-2.139 1.317-2.139 2.676V19.5h-3.19V8.796h3.168ZM7.2 6.106a1.61 1.61 0 0 1-.988 1.483 1.595 1.595 0 0 1-1.743-.348A1.607 1.607 0 0 1 5.6 4.5a1.601 1.601 0 0 1 1.6 1.606Z" clip-rule="evenodd"/>
                        <path d="M7.2 8.809H4V19.5h3.2V8.809Z"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import profile from '~/assets/profile.png'

const { copyEmail } = useCopyEmail()

const words = [
    'Web Apps',
    'Mobile Apps',
    'REST APIs',
    'Backend Systems',
    'Cloud Solutions',
    'POS Systems',
    'Monitoring Tools',
    'Database Solutions',
    'Payment Integrations',
    'Full-Stack Applications',
]
const wordIndex = ref(0)

let wordTimer

onMounted(() => {
    wordTimer = setInterval(() => {
        wordIndex.value = (wordIndex.value + 1) % words.length
    }, 2400)
})

onBeforeUnmount(() => clearInterval(wordTimer))
</script>

<style scoped>
.letter {
    display: inline-block;
    opacity: 0;
    animation: rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}

.rotator {
    display: inline-block;
}

.word {
    display: inline-block;
    color: var(--mint);
}

.word-enter-active,
.word-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.word-enter-from {
    opacity: 0;
    transform: translateY(0.5em);
}

.word-leave-to {
    opacity: 0;
    transform: translateY(-0.5em);
}
</style>
