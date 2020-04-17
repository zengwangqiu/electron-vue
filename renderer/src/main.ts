import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import axios from "axios";
// import { ipcRenderer, desktopCapturer } from "electron";
Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
// Vue.prototype.$ipcRenderer = ipcRenderer;
// Vue.prototype.$desktopCapturer = desktopCapturer;
declare global {
  interface Window { require: any; }
}
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
