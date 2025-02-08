<template>
    <footer class="rounded-lg shadow m-4 dark:bg-gray-900">
        <div class="flex items-center justify-between p-4">
            <span class="text-sm text-center text-gray-500 dark:text-gray-400">@2025 Rutvik Shah</span>
            <div class="heartbeat-container">
                <svg version="1.2" height="30" width="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 100">
                    <path 
                        id="pulsar" 
                        stroke="rgba(255,0,0,1)" 
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

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    #pulsar {
        
        stroke: rgb(146, 226, 163);
        filter: drop-shadow(0 0 2px rgba(255, 0, 0, 0.5));
    }
}
</style>