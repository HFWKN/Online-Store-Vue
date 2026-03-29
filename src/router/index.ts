import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/home.vue'
import LoginView from '@/views/user/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/shopDetailed/:id',
      name: 'shopDetailed',
      component: () => import('@/views/shopDetailed/shopDetailed.vue')
    },
    {
      path: '/userLike',
      name: 'userLike',
      component: () => import('@/views/userLike/userLike.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/cart/cart.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
