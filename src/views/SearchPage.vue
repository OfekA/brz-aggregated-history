<template>
  <div>
    <div class="p-3">
      <router-link to="/"><i class="bx bx-x text-3xl"></i></router-link>
    </div>
    <div class="p-4 md:p-4 flex justify-center">
      <div>
        <div
          class="title flex items-center mt-1 md:mt-1"
          :class="{ 'opacity-0': chosenCity }"
        >
          <i class="bx bx-map text-2xl md:text-3xl"></i>
          <h1 class="text-2xl font-medium ml-2">Search for a City</h1>
        </div>

        <div class="search">
          <input
            class="h-12 md:h-20 text-2xl md:text-5xl mt-3 md:mt-0"
            ref="cityNameInput"
            type="text"
            name="city-name"
            placeholder="Search for a city"
            v-model="cityName"
            :disabled="chosenCity"
          />
          <div class="h-1 bg-gray-200"></div>
        </div>

        <div class="search-results mt-8 md:mt-16" v-if="!chosenCity">
          <h2 class="country-headline font-medium text-xl mb-2">
            United States
          </h2>
          <ul class="cities-list">
            <li
              @click="chooseCity(city)"
              class="py-1 text-gray-500 cursor-pointer"
              v-for="city in searchResults"
              :key="city.rank"
            >
              {{ city.name }}
            </li>
          </ul>
        </div>

        <div class="timeframe-select flex mt-10 gap-4" v-if="chosenCity">
          <div
            class="card shadow p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all"
          >
            <i class="bx bx-map-alt text-2xl md:text-3xl ml-1"></i>
            <h2 class="text-xl font-medium ml-2">
              Check your Area Risk Index Score
            </h2>
            <h3 class="text-md ml-2 mt-1 text-gray-500">
              See how air pollution affected your area last year
            </h3>
          </div>

          <div
            class="card shadow p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all"
          >
            <i class="bx bx-movie-play text-2xl md:text-3xl ml-1"></i>
            <h2 class="text-xl font-medium ml-2">
              Spot historical changes in air-quality
            </h2>
            <h3 class="text-md ml-2 mt-1 text-gray-500">
              Move between time-periods and play-back time
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FuzzySearch from "fuzzy-search";
import usCities from "../assets/data/us-cities.json";

const searcher = new FuzzySearch(usCities, ["name"], {
  caseSensitive: false,
});

export default {
  data() {
    return {
      cityName: "",
      chosenCity: null,
    };
  },

  mounted() {
    this.$refs.cityNameInput.focus();
  },

  computed: {
    searchResults() {
      const searchResults = searcher.search(this.cityName);

      return searchResults
        .sort((a, b) => {
          return b.population - a.population;
        })
        .slice(0, 31);
    },
  },

  methods: {
    chooseCity(city) {
      this.chosenCity = city;
      this.cityName = city.name;
    },
  },
};
</script>

<style>
.cities-list {
  column-count: 3;
}

@media (max-width: 768px) {
  .cities-list {
    column-count: 1;
  }
}
</style>