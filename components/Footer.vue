<template>
    <footer class="border-t pb-10 pt-6" style="border-color: var(--line)">
        <div class="flex items-center justify-between gap-4">
            <span class="text-sm" style="color: var(--faint)">
                <small>© {{ year }} Rbshah | All Rights Reserved</small>
            </span>
            <div class="heartbeat-container" style="width:9%; color: var(--mint)">
                <svg viewBox="0 0 150 73" aria-hidden="true">
                    <polyline
                        class="pulse"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        points="0,45.486 38.514,45.486 44.595,33.324 50.676,45.486 57.771,45.486 62.838,55.622 71.959,9 80.067,63.729 84.122,45.486 97.297,45.486 103.379,40.419 110.473,45.486 150,45.486"
                    />
                </svg>
            </div>
        </div>
    </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.heartbeat-container {
    width: 110px;
    display: flex;
    align-items: center;
}

/* The line draws in left to right, then a soft-edged wipe erases it from the left.
   Done with an animated mask (not cover boxes) so it works over the page glow. */
@property --reveal {
    syntax: '<percentage>';
    inherits: false;
    initial-value: 0%;
}

@property --erase {
    syntax: '<percentage>';
    inherits: false;
    initial-value: 0%;
}

.heartbeat-container svg {
    width: 100%;
    height: auto;
    --mask: linear-gradient(to right, transparent calc(var(--erase) - 24%), #000 var(--erase), #000 var(--reveal), transparent var(--reveal));
    -webkit-mask-image: var(--mask);
    mask-image: var(--mask);
    animation: heart-rate-in 2.5s linear infinite, heart-rate-out 2.5s linear infinite;
}

@keyframes heart-rate-in {
    0% { --reveal: 0%; }
    50%, 100% { --reveal: 100%; }
}

@keyframes heart-rate-out {
    0%, 30% { --erase: 0%; }
    100% { --erase: 120%; }
}

@media (prefers-reduced-motion: reduce) {
    .heartbeat-container svg {
        animation: none;
        -webkit-mask-image: none;
        mask-image: none;
    }
}
</style>
