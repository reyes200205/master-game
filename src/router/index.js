// router/index.js
import { createRouter, createWebHistory } from "vue-router"
import Home from "../views/Home.vue"
import Game from "../views/Game.vue"
import Host from "../views/Host.vue"

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/",     component: Home },
    { path: "/game", component: Game },
    { path: "/host", component: Host },

    { path: "/:catchAll(.*)", redirect: "/" },
  ],
})