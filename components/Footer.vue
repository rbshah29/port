<template>
    <footer class="border-t pb-10 pt-6" style="border-color: var(--line)">
        <div class="flex items-center justify-between gap-4">
            <span class="text-sm" style="color: var(--faint)">
                <small>© {{ year }} Rbshah | All Rights Reserved</small>
            </span>
            <div class="heartbeat-container" style="color: var(--mint)">
                <svg version="1.2" height="30" width="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 100" aria-hidden="true">
                    <path
                        id="pulsar"
                        stroke="currentColor"
                        fill="none"
                        stroke-width="2"
                        stroke-linejoin="round"
                        d="M0,50
                           L100,50
                           L110,50
                           L120,20
                           L130,80
                           L140,20
                           L150,80
                           L160,50
                           L170,50
                           L180,50
                           L190,50"
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
    width: 100px;
    position: relative;
    display: flex;
    align-items: center;
}

.heartbeat-container svg {
    width: 100%;
    height: 100%;
    overflow: visible;
}

#pulsar {
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: dash 2s linear infinite;
}

@keyframes dash {
    from {
        stroke-dashoffset: 400;
    }
    to {
        stroke-dashoffset: -400;
    }
}
</style>
