import Vue from "vue";
import VueRouter from "vue-router";
import Vuesax from "vuesax";

import App from "./App.vue";
import IndexPage from "./IndexPage.vue";
import MapPage from "./MapPage.vue";

import "vuesax/dist/vuesax.css"; //Vuesax styles

Vue.config.productionTip = false;

Vue.use(Vuesax, {
  // options here
});

Vue.use(VueRouter);

const routes = [
  { path: "/", component: IndexPage },
  { path: "/map", component: MapPage }
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
