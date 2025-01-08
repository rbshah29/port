<template>
    <div class="m-3">     
        <!-- <button @click="toggleModal" class="block text-white" type="button">
            Let's Connect!
        </button> -->
        <div class="text-white font-serif">Let's Connect!</div>
        <transition name="modal">
            <div v-if="isModalOpen" id="authentication-modal" tabindex="-1" aria-hidden="true" class="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full ">
                <div class="relative p-4 w-full max-w-md max-h-full" @click.stop>
                    <div class="relative rounded-lg shadow-2xl popup-bg border-r-2 border-b-2">
                        <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h1 class="text-white text-lg font-semibold">
                                Work in progress
                            </h1>
                            
                            <button @click="toggleModal" type="button" class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span class="sr-only">Close modal</span>
                            </button>
                        </div>
                        <p class="text-white">Meanwhile Please reach out to me via email!!</p>
                        <ContactPopup />
                    </div>
                </div>
            </div> 
        </transition>
    </div>
</template>

<script>
export default {
  data() {
    return {
      isModalOpen: false
    };
  },
  methods: {
    toggleModal() {
      this.isModalOpen = !this.isModalOpen;
    }
  }
};
</script>

<style>
.popup-bg{
    background-color: #0c1e39;
    border-color: #260f63;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.5s;
}
.modal-enter, .modal-leave-to /* .modal-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>