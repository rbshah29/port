<template>
  <div class="flex flex-col min-h-screen back-color font-name">
    <div class="flex-grow">
      <div class="flex flex-col lg:flex-row">
        <div class="lg:sticky lg:top-0 lg:h-screen w-full lg:w-1/3 p-4">
          <Hero />
        </div>
        
        <div class="w-full lg:w-2/3 p-4">
          <About />
          <Experience />
          <Projects />
          <div class="flex justify-center items-center m-7">
            <hr/>
            <Contact />
          </div>
          <div>
              <Footer/>        
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.back-color {
  background-color: #010e20;
}

.font-name {
  font-family: 'DejaVu Sans Mono', monospace;
}
</style>