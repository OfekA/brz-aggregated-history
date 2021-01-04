<template>
  <div class="p-2 h-screen">
    <Header />

    <div class="timeframes">
      <label style="margin-right: 10px; font-weight: 700">Timeframe: </label>
      <vs-radio
        v-for="timeframe in timeframes"
        :key="timeframe.id"
        v-model="selectedTimeframeType"
        :val="timeframe.id"
      >
        {{ timeframe.text }}
      </vs-radio>
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

    <div id="map" ref="map" class="map"></div>
  </div>
</template>

<script>
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/antd.css";
import "mapbox-gl/dist/mapbox-gl.css";

import Header from "../Header.vue";

import variation from "../share/mapbox-variation.js";
import sleep from "../share/sleep.js";

const timeframes = [
  {
    id: "yearly",
    text: "Yearly",
  },
  {
    id: "monthly",
    text: "Monthly",
  },
  {
    id: "weekly",
    text: "Weekly",
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
  data() {
    return {
      mapboxmap: null,
      timeframes,
      selectedTimeframeType: "monthly",
      selectedTimeframeValue: "A",
      playButtonState: "pause",
      timeframeValuesIndex: 0,
    };
  },
  async mounted() {
    const mapboxgl = await import(/* webpackChunkName: "map" */ "mapbox-gl");

    const mapOptions = {
      container: this.$refs.map,
      accessToken: variation.accessToken,
      style: variation.freeStyle,
      zoom: 10,
      center: [-74, 40.75],
    };

    this.mapboxmap = new mapboxgl.Map(mapOptions);

    this.mapboxmap.on("load", () => {
      this.updateBRZLayers();
    });
  },

  computed: {
    timeframeValues() {
      return timeframeValues[this.selectedTimeframeType];
    },
  },

  watch: {
    selectedTimeframeType(timeframeType) {
      this.updateBRZLayers();
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

      this.timeframeValues.forEach((timeframeValueFromList) => {
        if (timeframeValue !== timeframeValueFromList) {
          this.mapboxmap.setPaintProperty(
            `${breezometerTilesID}_${timeframeValueFromList}`,
            "raster-opacity",
            0
          );
        }
      });
    },
  },
};

function getTileURL(selectedTimeframeType, selectedTimeframeValue) {
  if (selectedTimeframeType === "yearly") {
    return yearlyTileURLBuilder();
  } else if (selectedTimeframeType === "monthly") {
    return monthlyTileURLBuilder(selectedTimeframeValue);
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

function weeklyTileURLBuilder(week = "1") {
  return `https://tiles.breezometer.com/v1/air-quality/breezometer-aqi/historical/hourly/{z}/{x}/{y}.png?key=${variation.breezoMeterApiKey}&breezometer_aqi_color=indiper&datetime=2021-01-03T11:00:00`;
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
</style>
