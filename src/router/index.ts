import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/home.vue'
import LoginView from '@/views/user/Login.vue'
import { ElMessageBox } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
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
      path: '/buy',
      name: 'buy',
      component: () => import('@/views/seckill/buy.vue')
    },
    {
      path: '/historical-information',
      name: 'historical-information',
      component: () => import('@/views/message/HistoricalInformation.vue')
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

// 路由守卫：实现身份验证拦截
router.beforeEach(async (to, from) => {
  // 定义不需要登录就能访问的白名单路由
  const whiteList = ['/home', '/login', '/register']
  // 现在不再将商品详情页放入白名单
  const isWhiteListed = whiteList.includes(to.path)

  const loginUser = localStorage.getItem('loginUser')

  if (loginUser) {
    // 已登录，直接放行
    return true
  } else {
    // 未登录
    if (isWhiteListed) {
      // 访问白名单页面，直接放行
      return true
    } else {
      // 访问需要身份验证的页面，拦截并提示
      try {
        await ElMessageBox.alert(
          `
          <div style="text-align: center;">
            <p style="margin-bottom: 15px; font-size: 16px; color: #303133;">该页面需要身份验证，请先登录！</p>
            <a href="/login" style="color: #409EFF; text-decoration: none; font-size: 14px; cursor: pointer;">
              👉 点击此处前往 登录 / 注册 界面
            </a>
          </div>
          `,
          '提示',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            showClose: true,
            closeOnClickModal: true,
            type: 'warning',
            center: true
          }
        )
        // 如果是从其他页面跳过来的，就留在原页面（中断导航）
        // 如果是直接在地址栏输入的需要登录的URL，那就退回到首页
        if (from.path === '/' || from.path === '/login') {
          return '/home'
        } else {
          return false
        }
      } catch {
        return false
      }
    }
  }
})

export default router
