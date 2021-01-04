<template>
  <div class="bg h-screen w-full px-4">
    <div class="w-60 pt-4 bg-gray-400 bg-opacity-10">
      <img src="../assets/images/brz-logo-black.png" />
    </div>
    <div class="flex justify-center items-center flex-col h-full w-full">
      <div class="text-4xl w-3/6 text-white bg-gray-400 bg-opacity-10">
        Breezometer we will decide what to write
      </div>
      <div class="w-3/6 pt-6">
        <router-link to="/search">
          <div class="items-left text-gray-400 bg-white shadow-lg pl-4 py-4">
            <i class="bx bx bx-search text-xl"></i>
            <span class="ml-1 text-xl">Search for a City</span>
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