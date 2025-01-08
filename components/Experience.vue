<template>
    <div class="m-3">
      <h1 class="text-3xl text-1">Experience</h1>
      <div class="tabs">
        <div class="m-4">
          <WorkTab />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      switchTab(tabId) {
        this.activeTab = tabId;
      },
    },
  };
  </script>
  
<style scoped>

</style>
  