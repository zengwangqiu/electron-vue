import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Main from "../views/Main.vue";
// import Recorder from "../views/Recorder.vue";
// import Control from "../views/Control.vue";
// import Uploader from "../views/Uploader.vue";



Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: "/",
    name: "Main",
    component: Main,
  },
  {
    path: "/recorder",
    name: "Recorder",
    component: () => import(/* webpackChunkName: "recorder" */ "../views/Recorder.vue"),
    // component: Recorder,
  },
  {
    path: "/control",
    name: "Control",
    component: () => import(/* webpackChunkName: "control" */ "../views/Control.vue"),
    // component: Control,
  },
  {
    path: "/uploading",
    name: "Uploader",
    component: () => import(/* webpackChunkName: "transparent" */ "../views/Uploader.vue"),
    // component: Uploader,
  },
  {
    path: "/move",
    name: "Move",
    component: () => import(/* webpackChunkName: "move" */ "../views/Move.vue"),
    // component: Move,
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;
