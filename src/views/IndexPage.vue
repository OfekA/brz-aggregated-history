<template>
  <div class="bg h-screen w-full px-4 relative">
    <div class="w-60 pl-8 pt-8 absolute">
      <img src="../assets/images/brz-logo-black.png" />
    </div>
    <div
      class="flex justify-center items-start flex-col w-full h-full px-8"
      style="max-width: 900px"
    >
      <div
        class="text-5xl md:text-6xl font-medium text-white tracking-tight leading-tight mb-5"
        style="
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          font-family: 'Palanquin', sans-serif;
        "
      >
        Understand air pollution behevaior.
      </div>

      <div class="mt-5 w-full">
        <router-link to="/search">
          <div
            class="flex items-left items-center bg-white shadow-lg pl-4 py-5"
          >
            <i class="bx bx bx-search text-2xl text-gray-300"></i>
            <span class="ml-2 text-2xl text-gray-300">Search for a City</span>
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