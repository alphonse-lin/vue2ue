import { createRouter, createWebHashHistory } from 'vue-router'
import PlayerView from '../views/PlayerView.vue'
// import HomeView from '../views/HomeView.vue'

const routes = [{
        path: '/',
        name: 'player',
        component: PlayerView
    },
    {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/AboutView.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router