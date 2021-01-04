<template>
  <div class="bg h-screen w-full px-4">
    <div class="flex justify-center items-center flex-col h-full w-full">
      <div class="text-3xl text-white">
        Breezometer we will decide what to write
      </div>
      <div>
        <router-link to="/search">
          <div class="items-left text-gray-400 bg-white shadow-lg pr-20 pl- py-4">
            <i class="bx bx bx-search"></i>
            <span class="ml-1">Search for a City</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style>
.bg {
  background: url(index-bg.jpg) no-repeat center center fixed;
  background-size: cover;
}
</style>