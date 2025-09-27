<template>
    <div class="tabs">
        <div class="block">
            <ul class="flex border-b border-gray-200 space-x-3 overflow-auto transition-all duration-300 -mb-px">
                <li v-for="(tab, index) in tabs" :key="index">
                    <a
                        href="javascript:void(0)"
                        @click="switchTab(tab.id)"
                        :class="{
                            'tab-active:border-b-indigo-600 tab-active:text-indigo-600 active': activeTab === tab.id,
                        }"
                        class="inline-block py-4 px-6 color-tav font-medium border-b-2 border-transparent tablink whitespace-nowrap"
                        role="tab"
                    >
                        {{ tab.alias }}
                    </a>
                </li>
            </ul>
        </div>
        <div class="m-4">
            <div v-for="(tab, index) in tabs" :key="index">
                <div
                    :id="tab.id"
                    :class="{ hidden: activeTab !== tab.id }"
                    class="m-2 tabcontent"
                    role="tabpanel"
                    :aria-labelledby="tab.id"
                >
                    <div class="">
                        <h2 class="text-xl font-bold text-cyan-500"><a class="flex items-center space-x-2" :href="tab.link" target="_blank">{{ tab.name }}
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512"><path fill="none" stroke="#fffefe" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M448 64L64 240.14h200a8 8 0 0 1 8 8V448Z"/></svg>
                            </a>
                        </h2>
                    </div>
                    <p class="text-sm  dark:text-gray-400">{{ tab.duration }}</p>
                    <div class="m-4">
                        <div class="flex flex-wrap gap-2 mt-4">
                            <span
                                v-for="(tech, index) in tab.technology.split(', ')"
                                :key="index"
                                class="whitespace-nowrap rounded-full pill-color font-semibold px-2.5 py-0.5 text-xs border border-blue-700"
                            >
                                {{ tech }}
                            </span>
                        </div>
                        <ul class="text-2 m-8 list-disc">
                            <li v-for="(line, index) in tab.summary.split('. ')" :key="index">{{ line }}</li>
                        </ul>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import tabsData from 'assets/work.json';

export default {
    data() {
        return {
            tabs: tabsData,
            activeTab: 'tabs-with-underline-1'
        };
    },
    methods: {
      switchTab(tabId) {
        this.activeTab = tabId;
      },
    },
};
</script>

<style scoped>
.hidden {
    display: none;
}
.color-tav {
    color:lightsteelblue;
}
.color-tav:hover {
    color: gray;
}
</style>