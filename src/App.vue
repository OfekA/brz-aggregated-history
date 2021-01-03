<template>
  <div id="main">
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

    <div class="slider" v-if="selectedTimeframeType !== 'yearly'">
      <vue-slider
        v-model="selectedTimeframeValue"
        :adsorb="true"
        :data="timeframeValues"
      />
      <!-- <vue-slider v-model="value" :adsorb="true" :data="['A', 'B', 'C']" /> -->
    </div>

    <div id="map" ref="map" class="map"></div>
  </div>
</template>

<script>
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/antd.css";
import "mapbox-gl/dist/mapbox-gl.css";
import variation from "./share/mapbox-variation.js";

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
  weekly: Array.from(new Array(56).keys()).map(
    (weekNum) => `Week ${weekNum + 1}`
  ),
};

const breezometerTilesID = "breezometer-tiles";

export default {
  components: {
    VueSlider,
  },
  name: "App",
  data() {
    return {
      mapboxmap: null,
      timeframes,
      selectedTimeframeType: "monthly",
      selectedTimeframeValue: "A",
    };
  },
  async mounted() {
    const mapboxgl = await import(/* webpackChunkName: "map" */ "mapbox-gl");

    const mapOptions = {
      container: this.$refs.map,
      accessToken: variation.accessToken,
      style: variation.freeStyle,
      zoom: 10,
      center: [-74.1197634, 40.6974034],
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
    },
  },

  methods: {
    updateBRZLayers() {
      this.selectedTimeframeValue =
        timeframeValues[this.selectedTimeframeType][0];
      this.cleanBRZLayers();
      this.addBRZLayers();
    },

    cleanBRZLayers() {
      if (!this.mapboxmap) return;

      const mapLayers = this.mapboxmap.getStyle().layers;

      mapLayers.forEach((layer) => {
        if (layer.id.includes(`breezometer-tiles`)) {
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
  return `https://tiles.breezometer.com/v1/air-quality/breezometer-aqi/historical/hourly/{z}/{x}/{y}.png?key=${variation.breezoMeterApiKey}&breezometer_aqi_color=indiper&datetime=2021-01-01T11:00:00`;
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
* {
  font-family: "Lato", sans-serif;
}

.map {
  overflow: hidden;
  height: 100%;
  min-height: 500px;
  display: block;
  width: 100%;
  background-color: #1b2737;
}

.timeframes {
  display: flex;
  padding: 15px 0;
}

.slider {
  margin: 0 10px 15px 10px;
}

.mapboxgl-ctrl-attrib {
  display: none;
}
</style>
