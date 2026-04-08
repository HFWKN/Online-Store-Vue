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
      path: '/register',
      name: 'register',
      component: () => import('@/views/user/Register.vue'),
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
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/checkout/checkout.vue')
    },
    {
      path: '/seckill',
      name: 'seckill',
      component: () => import('@/views/seckill/seckill.vue')
    },
    {
      path: '/my',
      name: 'my',
      component: () => import('@/views/my/my.vue'),
      redirect: '/my/info',
      children: [
        {
          path: 'info',
          name: 'my-info',
          component: () => import('@/views/my/info.vue')
        },
        {
          path: 'address',
          name: 'my-address',
          component: () => import('@/views/my/address.vue')
        },
        {
          path: 'favorite',
          name: 'my-favorite',
          component: () => import('@/views/userLike/userLike.vue')
        },
        {
          path: 'cart',
          name: 'my-cart',
          component: () => import('@/views/cart/cart.vue')
        },
        {
          path: 'order',
          name: 'my-order',
          component: () => import('@/views/my/order.vue')
        },
        {
          path: 'seckill',
          name: 'my-seckill',
          component: () => import('@/views/my/seckill.vue')
        }
      ]
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
