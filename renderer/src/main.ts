import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import axios from "axios";
const { ipcRenderer } = window.require("electron");
ipcRenderer.on("appPath", (e: any, appPath: string) => {
  Vue.prototype.$appPath = appPath;
});
Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
declare global {
  interface Window { require: any; }
}
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
