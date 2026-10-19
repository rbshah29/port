<template>
    <section id="projects">
        <SectionHeading number="03" label="Projects">Notable projects</SectionHeading>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <article
                v-for="(tab, index) in projects"
                :key="index"
                class="card card-hover project reveal flex h-full flex-col p-6"
                :style="{ '--delay': `${(index % 2) * 80}ms` }"
            >
                <span class="project-bar" aria-hidden="true"></span>
                <div class="flex items-center justify-between">
                <span class="project-icon" aria-hidden="true">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>
                    </span>
                    <div class="-mr-2 -mt-2 flex items-center">
                    <a v-if="tab.live_url" :href="tab.live_url" target="_blank" rel="noopener noreferrer" class="icon-btn" :aria-label="`Open ${tab.title} live`" title="Live demo">
                        <svg class="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>
                    </a>
                    <a v-if="tab.git_url" :href="tab.git_url" target="_blank" rel="noopener noreferrer" class="icon-btn" :aria-label="`${tab.title} on GitHub`" title="Source on GitHub">
                        <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                    </div>
                </div>

                <h3 class="project-title mt-4 font-display text-lg font-semibold">
                    <a v-if="tab.live_url" :href="tab.live_url" target="_blank" rel="noopener noreferrer">{{ tab.title }}</a>
                    <template v-else>{{ tab.title }}</template>
                </h3>
                <p v-if="tab.status" class="status mt-2">
                    <span class="status-dot" aria-hidden="true"></span>{{ tab.status }}
                </p>
                <p class="prose-muted mt-2 flex-grow text-[0.925rem]">{{ tab.description }}</p>

                <div class="mt-5 flex flex-wrap gap-2">
                    <span v-for="(tech, i) in tab.techs" :key="i" class="pill">{{ tech }}</span>
                </div>
            </article>
        </div>
    </section>
</template>

<script setup>
import projects from 'assets/projects.json';
</script>

<style scoped>
/* Accent line that sweeps across the top edge on hover */
.project-bar {
    position: absolute;
    inset: 0 0 auto 0;
    height: 2px;
    background: linear-gradient(90deg, var(--imperial), var(--mint));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.project:hover .project-bar {
    transform: scaleX(1);
}

.project-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.6rem;
    color: var(--mint);
    background: rgba(0, 35, 149, 0.35);
    border: 1px solid rgba(61, 95, 209, 0.55);
    transition: transform 0.3s ease;
}

.project:hover .project-icon {
    transform: rotate(-8deg) scale(1.06);
}

.status {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    align-self: flex-start;
    font-family: theme('fontFamily.mono');
    font-size: 11px;
    color: var(--mint);
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: var(--mint);
    animation: pulse-ring 1.8s ease-out infinite;
}

.project-title {
    transition: color 0.25s ease;
}

.project:hover .project-title {
    color: var(--mint);
}
</style>
