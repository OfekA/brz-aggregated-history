const variation = {
  accessToken:
    "pk.eyJ1Ijoic2hhaGFyIiwiYSI6ImNqNmFzajRxODEyMTIyd3MyZnR2eWJrdmwifQ.aQg187TQb7ojgOtbroVM4g",
  style: "mapbox://styles/shahar/ck65hhzh62kog1imgi2bfp610",
  freeStyle: {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: [
          "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}@2x.png"
        ],
        tileSize: 256,
        attribution:
          'Map tiles by <a target="_top" rel="noopener" href="http://stamen.com">Stamen Design</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
      }
    },
    layers: [
      {
        id: "simple-tiles",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  firstSymbolLayerId: "admin-1-boundary-bg",
  brzLayerOpacity: 0.9,
  breezoMeterApiKey: "496bfcfb6ddd40ef831e29858c8ba7a9"
};

export default variation;
