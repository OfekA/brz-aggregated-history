import Vue from "vue";
import VueRouter from "vue-router";
import Vuesax from "vuesax";

import App from "./App.vue";
import IndexPage from "./views/IndexPage.vue";
import SearchPage from "./views/SearchPage.vue";
import MapPage from "./views/MapPage.vue";

import "vuesax/dist/vuesax.css"; //Vuesax styles
import Trend from "vuetrend";

Vue.config.productionTip = false;

Vue.use(Vuesax, {
  // options here
});

Vue.use(VueRouter);
Vue.use(Trend);

const routes = [
  { path: "/", component: IndexPage },
  { path: "/search", component: SearchPage },
  { path: "/map/:type", component: MapPage, props: true }
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  mode: "history",
  routes // short for `routes: routes`
});

new Vue({
  router,
  render: (h) => h(App)
}).$mount("#app");
