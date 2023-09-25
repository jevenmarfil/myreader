import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Level1View from '../views/Level1View.vue'
import Level2View from '../views/Level2View.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/level1',
      name: 'level1',
      component: Level1View
    },
    {
      path: '/level2',
      name: 'level2',
      component: Level2View
    }
  ]
})

export default router
