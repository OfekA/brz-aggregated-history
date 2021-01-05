<template>
  <div class="p-2 h-screen" style="max-width: 700px; margin: 0 auto">
    <Header class="mb-5" />
    <div class="timeframes">
      <label style="margin-right: 10px; font-weight: 700">Time-frame</label>
      <vs-radio
        class="mr-2"
        v-for="timeframe in timeframes"
        :key="timeframe.id"
        v-model="selectedTimeframeType"
        :val="timeframe.id"
      >
        {{ timeframe.text }}
      </vs-radio>
    </div>
    <div class="mb-3 flex">
      <label style="margin-right: 10px; font-weight: 700">Time-period</label>
      <p v-if="selectedTimeframeType !== 'yearly'">
        2020, {{ currentTimePeriod }}
      </p>
      <p v-else>{{ currentTimePeriod }}</p>
    </div>
    <div
      class="slider-controls flex items-center mb-2"
      v-if="selectedTimeframeType !== 'yearly'"
    >
      <vs-button class="play-button" @click="playLayer" flat icon>
        <i
          class="bx"
          :class="{
            'bx-play': playButtonState === 'pause',
            'bx-pause': playButtonState === 'play',
          }"
        ></i>
      </vs-button>
      <vue-slider
        class="slider flex-grow ml-3 mr-1"
        v-model="selectedTimeframeValue"
        :adsorb="true"
        :data="timeframeValues"
        @drag-start="onSliderDrag"
        @change="onSliderDrag"
      />
    </div>
    <div id="map" ref="map" class="map rounded"></div>
    <div v-show="selectedTimeframeType !== 'yearly'" class="flex mt-6">
      <div class="mr-5" style="font-weight: 700">Risk Index over time</div>
      <div class="flex flex-col w-full">
        <div class="flex flex-col">
          <div class="flex justify-between items-center">
            <div class="">{{ timeframeValues[0] }}</div>
            <div class="flex-grow h-1 bg-gray-200 mx-3"></div>
            <div class="">
              {{ timeframeValues[timeframeValues.length - 1] }}
            </div>
          </div>
          <trend
            class="w-full h-full"
            :data="values"
            :gradient="['#239295', '#34D831', '#E6AE49', '#E05A0E', '#6314A1']"
            auto-draw
            smooth
          ></trend>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import mapboxgl from "mapbox-gl";
import VueSlider from "vue-slider-component";
import clamp from "clamp";
import "vue-slider-component/theme/antd.css";
import "mapbox-gl/dist/mapbox-gl.css";
import Header from "../Header.vue";
import variation from "../share/mapbox-variation.js";
import sleep from "../share/sleep.js";
const timeframes = [
  {
    id: "yearly",
    text: "Yearly - real",
  },
  {
    id: "monthly",
    text: "Monthly - demo",
  },
  {
    id: "monthly-real",
    text: "Monthly - real",
  },
  {
    id: "weekly",
    text: "Weekly - real",
  },
];
const timeframeValues = {
  yearly: ["2020"],
  monthly: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  "monthly-real": ["Feb", "Mar", "Apr", "May"],
  weekly: Array.from(new Array(52).keys()).map(
    (weekNum) => `Week ${weekNum + 1}`
  ),
};
const breezometerTilesID = "breezometer-tiles";
export default {
  components: {
    VueSlider,
    Header,
  },
  name: "App",
  props: {
    type: {
      type: String,
      default: "monthly",
    },
  },
  data() {
    return {
      mapboxmap: null,
      timeframes,
      selectedTimeframeType: "monthly",
      selectedTimeframeValue: "A",
      playButtonState: "pause",
      timeframeValuesIndex: 0,
      values: null,
    };
  },
  mounted() {
    const lat = parseFloat(this.$route.query.lat);
    const lon = parseFloat(this.$route.query.lon);
    const mapOptions = {
      container: this.$refs.map,
      accessToken: variation.accessToken,
      style: variation.freeStyle,
      zoom: 10,
      center: [lon, lat],
    };
    this.mapboxmap = new mapboxgl.Map(mapOptions);
    this.mapboxmap.on("load", () => {
      this.selectedTimeframeType = this.type;
      this.updateBRZLayers();
    });
    this.mapboxmap.on("click", (e) => {
      addPopUpToMap(this.mapboxmap, e.lngLat.lng, e.lngLat.lat);
    });
    this.values = this.getRiskFactorRandomValues(this.timeframeValues.length);
  },
  computed: {
    timeframeValues() {
      return timeframeValues[this.selectedTimeframeType];
    },
    currentTimePeriod() {
      return this.timeframeValues[this.timeframeValuesIndex];
    },
  },
  watch: {
    selectedTimeframeType(timeframeType) {
      this.updateBRZLayers();
      this.values = this.getRiskFactorRandomValues(this.timeframeValues.length);
    },
    selectedTimeframeValue(timeframeValue) {
      this.toggleBRZLayer(timeframeValue);
      this.timeframeValuesIndex = this.timeframeValues.indexOf(timeframeValue);
    },
    async playButtonState(playButtonState) {
      for (
        let i = this.timeframeValuesIndex;
        i < this.timeframeValues.length;
        i++
      ) {
        if (this.playButtonState === "play") {
          if (i === this.timeframeValues.length - 1) i = -1;
          this.timeframeValuesIndex = i;
          const val = this.timeframeValues[this.timeframeValuesIndex];
          this.selectedTimeframeValue = this.timeframeValues[
            this.timeframeValues.indexOf(val) + 1
          ];
          await sleep(1000);
        }
      }
    },
  },
  methods: {
    async playLayer() {
      this.playButtonState = this.playButtonState === "play" ? "pause" : "play";
    },
    onSliderDrag() {
      this.playButtonState = "pause";
    },
    updateBRZLayers() {
      this.timeframeValuesIndex = 0;
      this.onSliderDrag();
      this.selectedTimeframeValue =
        timeframeValues[this.selectedTimeframeType][0];
      this.cleanBRZLayers();
      this.addBRZLayers();
    },
    cleanBRZLayers() {
      if (!this.mapboxmap) return;
      const mapLayers = this.mapboxmap.getStyle().layers;
      mapLayers.forEach((layer) => {
        if (layer.id.includes(breezometerTilesID)) {
          removeMapboxLayer(this.mapboxmap, layer.id);
        }
      });
    },
    addBRZLayers() {
      this.timeframeValues.forEach((timeframeValue) => {
        const tilesUrl = getTileURL(this.selectedTimeframeType, timeframeValue);
        addBRZLayer({
          mapboxmap: this.mapboxmap,
          tilesUrl,
          layerID: `${breezometerTilesID}_${timeframeValue}`,
        });
      });
    },
    toggleBRZLayer(timeframeValue) {
      if (!this.mapboxmap) return;

      this.mapboxmap.setPaintProperty(
        `${breezometerTilesID}_${timeframeValue}`,
        "raster-opacity",
        0.9
      );

      setTimeout(() => {
        this.timeframeValues.forEach((timeframeValueFromList) => {
          if (timeframeValue !== timeframeValueFromList) {
            this.mapboxmap.setPaintProperty(
              `${breezometerTilesID}_${timeframeValueFromList}`,
              "raster-opacity",
              0
            );
          }
        });
      }, 70);
    },
    getRiskFactorRandomValues(numberOfValues) {
      var valuesArray = new Array(0);
      for (var i = 0; i < numberOfValues; i++) {
        valuesArray.push(Math.random() * 100);
      }
      return valuesArray;
    },
  },
};
function getTileURL(selectedTimeframeType, selectedTimeframeValue) {
  if (selectedTimeframeType === "yearly") {
    return yearlyTileURLBuilder();
  } else if (selectedTimeframeType === "monthly") {
    return monthlyTileURLBuilder(selectedTimeframeValue);
  } else if (selectedTimeframeType === "monthly-real") {
    return monthlyRealTileURLBuilder(selectedTimeframeValue);
  } else {
    return weeklyTileURLBuilder(selectedTimeframeValue);
  }
}
function yearlyTileURLBuilder() {
  return `https://storage.googleapis.com/brz-tile-server/yearly/2020/{z}/{x}/{y}.png`;
  // return `https://tiles.breezometer.com/v1/air-quality/breezometer-aqi/historical/hourly/{z}/{x}/{y}.png?key=${variation.breezoMeterApiKey}&breezometer_aqi_color=indiper&datetime=2021-01-01T11:00:00`;
}
function monthlyTileURLBuilder(month = "Jan") {
  let day = `${timeframeValues.monthly.indexOf(month) + 10}`;
  if (day < 10) day = `0${day}`;
  return `https://tiles.breezometer.com/v1/air-quality/breezometer-aqi/historical/hourly/{z}/{x}/{y}.png?key=${variation.breezoMeterApiKey}&breezometer_aqi_color=indiper&datetime=2020-12-${day}T11:00:00`;
}
function monthlyRealTileURLBuilder(month = "Jan") {
  let monthly = `${timeframeValues["monthly-real"].indexOf(month) + 2}`;

  console.log(
    `https://storage.googleapis.com/brz-tile-server/monthly/2020/${monthly}/{z}/{x}/{y}.png`
  );
  return `https://storage.googleapis.com/brz-tile-server/monthly/2020/${monthly}/{z}/{x}/{y}.png`;
}
function weeklyTileURLBuilder(week = "Week 1") {
  let weekly = `${timeframeValues.weekly.indexOf(week) + 1}`;

  return `https://storage.googleapis.com/brz-tile-server/weekly/2020/${weekly}/{z}/{x}/{y}.png`;
  // return `https://tiles.breezometer.com/v1/air-quality/breezometer-aqi/historical/hourly/{z}/{x}/{y}.png?key=${variation.breezoMeterApiKey}&breezometer_aqi_color=indiper&datetime=2020-12-${day}T19:00:00`;
}
function removeMapboxLayer(mapboxmap, id) {
  if (mapboxmap.getSource(id)) {
    mapboxmap.removeLayer(id);
    mapboxmap.removeSource(id);
  }
}
function addBRZLayer({ mapboxmap, tilesUrl, layerID }) {
  removeMapboxLayer(mapboxmap, layerID);
  mapboxmap.addSource(layerID, {
    type: "raster",
    tiles: [tilesUrl],
    tileSize: 256,
    maxzoom: 8,
  });
  mapboxmap.addLayer({
    id: layerID,
    type: "raster",
    source: layerID,
    minzoom: 0,
    maxzoom: 22,
    paint: {
      "raster-opacity": 0,
    },
  });
}
function addPopUpToMap(mapboxmap, clickPointLon, clickPointLat, html) {
  var randRiskIndex = clamp(parseInt(Math.random() * 100, 10), 55, 90);
  var riskIndexColor =
    randRiskIndex <= 20
      ? "#6314A1"
      : randRiskIndex <= 40
      ? "#E05A0E"
      : randRiskIndex <= 60
      ? "#E6AE49"
      : randRiskIndex <= 80
      ? "#34D831"
      : "#239295";
  new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat([clickPointLon, clickPointLat])
    .setHTML(
      `<div class="flex flex-col items-center">
        <div class="justify-center" style="font-weight: 700">Risk Index</div>
        <div class="justify-center" style="color: ${riskIndexColor}">
        ${randRiskIndex}
        </div></div>`
    )
    .addTo(mapboxmap);
}
</script>
<style>
.map {
  overflow: hidden;
  height: 500px;
  width: 100%;
}
.timeframes {
  display: flex;
  padding: 15px 0;
}
.mapboxgl-ctrl-attrib {
  display: none;
}
</style>52weekly + 1${weekly}/{z}/{