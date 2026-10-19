<template>
    <section id="about">
        <SectionHeading number="01" label="About">A bit about me</SectionHeading>

        <div class="prose-muted reveal space-y-5 text-[1.05rem]">
            <p>
                These days, I’m part of the team at
                <a href="https://www.evodev.ca/" target="_blank" rel="noopener noreferrer" class="link">Évodév Technologies Inc.</a>,
                where I get to bring cool ideas to life across different projects. I like turning a tricky problem into something people actually enjoy using.
            </p>

            <p>
                Along the way, I’ve worked with companies in supply chain management, open-source ERP systems, and full-stack development. Over the years, I’ve worked in all kinds of projects web apps, mobile apps, APIs you name it. I love collaborating, picking up new tech, and always looking for smarter ways to build.
            </p>

            <p>
                When I’m not coding, you’ll usually catch me watching movies, binging a good series, or reading a good book. At the end of the day, I’m all about creating software
            </p>

            <p>
               My goal? Keep the code clean, efficient, and the interfaces easy enough that anyone can dive right in.
            </p>
        </div>

        <dl ref="statsEl" class="reveal mt-12 grid grid-cols-3 border-y" style="border-color: var(--line)">
            <div
                v-for="(stat, index) in stats"
                :key="stat.label"
                class="flex flex-col-reverse py-6"
                :class="{ 'border-l pl-5 sm:pl-6': index > 0 }"
                style="border-color: var(--line)"
            >
                <dt class="mt-1 text-xs sm:text-sm" style="color: var(--faint)">{{ stat.label }}</dt>
                <dd class="font-display text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
                    <span style="color: var(--mint)">{{ stat.prefix }}</span>{{ counts[index] }}
                </dd>
            </div>
        </dl>

        <div class="reveal mt-12">
            <p class="eyebrow mb-5">Tools I’ve shipped with</p>
            <dl class="space-y-4">
                <div v-for="group in toolbox" :key="group.label" class="sm:grid sm:grid-cols-[9rem_1fr] sm:gap-4">
                    <dt class="mb-2 pt-1 font-mono text-[11px] uppercase tracking-[0.14em] sm:mb-0" style="color: var(--faint)">{{ group.label }}</dt>
                    <dd class="flex flex-wrap gap-2">
                        <span v-for="tech in group.items" :key="tech" class="pill">{{ tech }}</span>
                    </dd>
                </div>
            </dl>
        </div>
    </section>
</template>

<script setup>
import work from 'assets/work.json';
import projects from 'assets/projects.json';

const stats = [
    { prefix: '~', value: 4, label: 'years building software' },
    { value: work.length, label: 'companies worked with' },
    { value: projects.length, label: 'featured side projects' },
];

// Numbers count up from 0 the first time the stats row scrolls into view
const counts = ref(stats.map((stat) => stat.value));
const statsEl = ref(null);
let statsObserver;

onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    counts.value = stats.map(() => 0);
    statsObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        statsObserver.disconnect();
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / 1200, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            counts.value = stats.map((stat) => Math.round(stat.value * eased));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    statsObserver.observe(statsEl.value);
});

onBeforeUnmount(() => statsObserver?.disconnect());

const toolbox = [
    { label: 'Languages', items: ['Python', 'JavaScript', 'Java'] },
    { label: 'Frontend & Mobile', items: ['Nuxt.js', 'Next.js', 'Flutter'] },
    { label: 'Backend', items: ['Node.js', 'FastAPI', 'Django', 'Flask', 'SQLAlchemy', 'Prisma'] },
    { label: 'Databases', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Supabase', 'Firebase'] },
    { label: 'Cloud & DevOps', items: ['AWS', 'GCP', 'Docker'] },
    { label: 'APIs', items: ['Microsoft Graph API', 'Google Maps & Places API', 'Twilio API', 'SendGrid API', 'OAuth 2.0', 'Open-Meteo API'] },
];
</script>
