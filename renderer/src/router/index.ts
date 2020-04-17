import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Landing from "../views/Landing.vue";
import Recorder from "../views/Recorder.vue";
import Transparent from "../views/Transparent.vue";
import Uploader from "../views/Uploader.vue";



Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: "/",
    name: "Landing",
    component: Landing,
  },
  {
    path: "/transparent",
    name: "Transparent",
    component: () => import(/* webpackChunkName: "transparent" */ "../views/Transparent.vue"),
  },
  {
    path: "/recording",
    name: "Recorder",
    component: () => import(/* webpackChunkName: "transparent" */ "../views/Recorder.vue"),
  },
  {
    path: "/uploading",
    name: "Uploader",
    component: () => import(/* webpackChunkName: "transparent" */ "../views/Uploader.vue"),
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;
