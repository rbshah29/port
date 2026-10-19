<template>
    <ol ref="timeline" class="timeline" :style="{ '--progress': progress }">
        <li
            v-for="(tab, index) in tabs"
            :key="tab.id"
            :id="tab.id"
            class="timeline-item reveal"
        >
            <span class="timeline-dot" :class="{ current: index === 0 }" aria-hidden="true"></span>

            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 class="font-display text-lg font-semibold sm:text-xl">
                    <a class="group inline-flex items-center gap-1.5" :href="tab.link" target="_blank" rel="noopener noreferrer">
                        <span class="company">{{ tab.name }}</span>
                        <svg class="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style="color: var(--faint)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
                    </a>
                </h3>
                <p class="font-mono text-xs" style="color: var(--faint)">{{ tab.duration }}</p>
            </div>

            <ul class="mt-4 space-y-2">
                <li v-for="(line, i) in sentences(tab.summary)" :key="i" class="bullet prose-muted text-[0.95rem]">{{ line }}</li>
            </ul>

            <div class="mt-5 flex flex-wrap gap-2">
                <span v-for="tech in techs(tab.technology)" :key="tech" class="pill">{{ tech }}</span>
            </div>
        </li>
    </ol>
</template>

<script>
import tabsData from 'assets/work.json';

export default {
    data() {
        return {
            tabs: tabsData,
            progress: 0,
        };
    },
    mounted() {
        window.addEventListener('scroll', this.updateProgress, { passive: true });
        this.updateProgress();
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.updateProgress);
    },
    methods: {
      // How far the timeline has been read, measured against a line 60% down the viewport
      updateProgress() {
        const rect = this.$refs.timeline.getBoundingClientRect();
        const read = (window.innerHeight * 0.6 - rect.top) / rect.height;
        this.progress = Math.min(Math.max(read, 0), 1);
      },
      // Split on sentence ends (period followed by a capital), so "Nuxt.js" and "3.11" stay intact
      sentences(summary) {
        return summary
          .split(/\.\s*(?=[A-Z])/)
          .map((line) => line.trim().replace(/\.$/, ''))
          .filter(Boolean);
      },
      techs(technology) {
        return technology.split(',').map((tech) => tech.trim()).filter(Boolean);
      },
    },
};
</script>

<style scoped>
.timeline {
    position: relative;
    padding-left: 1.75rem;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 3px;
    top: 0.6rem;
    bottom: 0.5rem;
    width: 1px;
    background: var(--line);
}

/* Fills down the track as the section is scrolled */
.timeline::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0.6rem;
    bottom: 0.5rem;
    width: 1px;
    background: linear-gradient(var(--mint), var(--imperial));
    transform-origin: top;
    transform: scaleY(var(--progress, 0));
    transition: transform 0.15s linear;
}

.timeline-item {
    position: relative;
}

.timeline-item + .timeline-item {
    margin-top: 3rem;
}

.timeline-dot {
    position: absolute;
    left: -1.75rem;
    top: 0.5rem;
    width: 7px;
    height: 7px;
    border-radius: 9999px;
    z-index: 1;
    background: var(--bg);
    border: 1px solid var(--slate);
}

.timeline-dot.current {
    background: var(--mint);
    border-color: var(--mint);
    animation: pulse-ring 1.8s ease-out infinite;
}

.company {
    transition: color 0.2s ease;
}

.group:hover .company {
    color: var(--accent);
}

.bullet {
    position: relative;
    padding-left: 1.1rem;
}

.bullet::before {
    content: '–';
    position: absolute;
    left: 0;
    color: var(--imperial-light);
}
</style>
