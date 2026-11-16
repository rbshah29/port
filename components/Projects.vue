<template>
    <section id="projects">
        <SectionHeading number="03" label="Projects">Notable projects</SectionHeading>

        <!-- Featured: big cards with a live preview, longer pitch and clear actions -->
        <div class="space-y-5">
            <article
                v-for="(tab, index) in featured"
                :key="tab.title"
                class="card card-hover featured reveal"
                :style="{ '--delay': `${index * 80}ms` }"
            >
                <span class="project-bar" aria-hidden="true"></span>

                <component
                    :is="tab.live_url ? 'a' : 'div'"
                    :href="tab.live_url"
                    :target="tab.live_url ? '_blank' : undefined"
                    :rel="tab.live_url ? 'noopener noreferrer' : undefined"
                    :tabindex="tab.live_url ? -1 : undefined"
                    :aria-hidden="tab.live_url ? 'true' : undefined"
                    class="preview"
                >
                    <div class="preview-bar" aria-hidden="true">
                        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                        <span class="preview-label">{{ tab.image_label || hostname(tab.live_url) || tab.title }}</span>
                    </div>
                    <div class="preview-shot">
                        <img :src="tab.image" :alt="tab.image_alt || `${tab.title} screenshot`" width="960" height="540" loading="lazy" decoding="async">
                    </div>
                </component>

                <div class="p-6">
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span class="featured-tag">
                            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5Z"/></svg>
                            Featured
                        </span>
                        <span v-if="tab.status" class="status">
                            <span class="status-dot" aria-hidden="true"></span>{{ tab.status }}
                        </span>
                    </div>

                    <h3 class="project-title mt-3 font-display text-2xl font-semibold tracking-tight">{{ tab.title }}</h3>
                    <p class="prose-muted mt-3 text-[0.95rem] leading-relaxed">{{ tab.description }}</p>

                    <div class="mt-5 flex flex-wrap gap-2">
                        <span v-for="tech in tab.techs" :key="tech" class="pill">{{ tech }}</span>
                    </div>

                    <div class="mt-6 flex flex-wrap gap-3">
                        <a v-if="tab.live_url" :href="tab.live_url" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                            Live demo
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
                        </a>
                        <a v-if="tab.git_url" :href="tab.git_url" target="_blank" rel="noopener noreferrer" :class="['btn', tab.live_url ? 'btn-ghost' : 'btn-primary']">
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="GITHUB_PATH" fill-rule="evenodd" clip-rule="evenodd"/></svg>
                            View code
                        </a>
                    </div>
                </div>
            </article>
        </div>

        <!-- Everything else: compact cards -->
        <h3 v-if="others.length" class="eyebrow mb-4 mt-12">More projects</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <article
                v-for="(tab, index) in others"
                :key="tab.title"
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
                            <svg class="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path :d="GITHUB_PATH" fill-rule="evenodd" clip-rule="evenodd"/></svg>
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
                    <span v-for="tech in tab.techs" :key="tech" class="pill">{{ tech }}</span>
                </div>
            </article>
        </div>
    </section>
</template>

<script setup>
import projects from 'assets/projects.json';

// "hidden": true keeps a project in the JSON without showing it.
// Projects with "featured": true and an "image" get the big card; the rest stay compact.
const visible = projects.filter((p) => !p.hidden);
const featured = visible.filter((p) => p.featured && p.image);
const others = visible.filter((p) => !(p.featured && p.image));

const hostname = (url) => {
    try { return url ? new URL(url).hostname : ''; } catch { return ''; }
};

const GITHUB_PATH = 'M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z';
</script>

<style scoped>
/* Accent line that sweeps across the top edge on hover */
.project-bar {
    position: absolute;
    inset: 0 0 auto 0;
    z-index: 2;
    height: 2px;
    background: linear-gradient(90deg, var(--imperial), var(--mint));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.project:hover .project-bar,
.featured:hover .project-bar {
    transform: scaleX(1);
}

/* ---------- Featured card ---------- */
.preview {
    display: block;
    margin: 1rem 1rem 0;
    overflow: hidden;
    border-radius: 0.75rem;
    border: 1px solid var(--line);
    background: var(--panel);
    box-shadow: 0 20px 40px -28px rgba(0, 0, 0, 0.9);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.featured:hover .preview {
    border-color: var(--line-strong);
    box-shadow: 0 24px 50px -26px rgba(var(--imperial-rgb), 0.9);
}

/* Little browser-window chrome above the screenshot */
.preview-bar {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.75rem;
    border-bottom: 1px solid var(--line);
    background: rgba(var(--slate-rgb), 0.08);
}

.preview-bar .dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 9999px;
    background: rgba(var(--muted-rgb), 0.35);
}

.preview-bar .dot:first-child { background: rgba(255, 95, 87, 0.7); }
.preview-bar .dot:nth-child(2) { background: rgba(254, 188, 46, 0.7); }
.preview-bar .dot:nth-child(3) { background: rgba(40, 200, 64, 0.7); }

.preview-label {
    margin-left: 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: theme('fontFamily.mono');
    font-size: 11px;
    color: var(--faint);
}

.preview-shot {
    aspect-ratio: 16 / 9;
    overflow: hidden;
}

.preview-shot img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    transform-origin: top center;
    transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.featured:hover .preview-shot img {
    transform: scale(1.035);
}

.featured-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.15rem 0.55rem;
    border-radius: 9999px;
    font-family: theme('fontFamily.mono');
    font-size: 11px;
    color: var(--mint);
    background: rgba(var(--imperial-rgb), 0.35);
    border: 1px solid rgba(var(--imperial-light-rgb), 0.55);
}

/* ---------- Compact cards ---------- */
.project-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.6rem;
    color: var(--mint);
    background: rgba(var(--imperial-rgb), 0.35);
    border: 1px solid rgba(var(--imperial-light-rgb), 0.55);
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

.project:hover .project-title,
.featured:hover .project-title {
    color: var(--mint);
}

@media (prefers-reduced-motion: reduce) {
    .preview-shot img { transition: none; }
    .featured:hover .preview-shot img { transform: none; }
}
</style>
