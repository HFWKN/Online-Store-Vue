<template>
  <div class="site-nav">
    <div class="site-nav-inner">
      <div class="nav-left">
        <router-link to="/my/order" class="nav-link" :class="{ 'active': route.path === '/my/order' }">我的订单</router-link>
        <span class="nav-divider">|</span>
        <router-link to="/cart" class="nav-link" :class="{ 'active': route.path === '/cart' }">购物车</router-link>
        <span class="nav-divider">|</span>
        <router-link to="/userLike" class="nav-link" :class="{ 'active': route.path === '/userLike' }">收藏夹</router-link>
      </div>
      <div class="nav-right">
        <router-link to="/home" class="nav-link" :class="{ 'active': route.path === '/home' }" style="margin-right: 15px;">主页</router-link>
        <router-link to="/my" class="nav-link" :class="{ 'active': route.path.startsWith('/my') }" style="margin-right: 15px;">我的</router-link>
        <template v-if="currentUsername">
          <span class="welcome-text">欢迎您，{{ currentUsername }}</span>
          <a href="javascript:void(0)" class="nav-link logout-link" @click="handleLogout">退出登录 / 切换账号</a>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">请登录</router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const currentUsername = ref('')

const fetchUser = () => {
  const loginUserStr = localStorage.getItem('loginUser')
  if (loginUserStr) {
    try {
      const user = JSON.parse(loginUserStr)
      currentUsername.value = user.username || user.name || '用户'
    } catch (e) {
      console.error('解析用户信息失败')
    }
  } else {
    currentUsername.value = ''
  }
}

const handleLogout = () => {
  localStorage.removeItem('loginUser')
  router.push('/login')
}

onMounted(() => {
  fetchUser()
})

// 监听路由变化，以防由于某种原因没重新挂载时也能更新用户信息
watch(() => route.path, () => {
  fetchUser()
})
</script>

<style scoped>
/* --- 顶部导航条 --- */
.site-nav {
  height: 36px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6c6c6c;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

.site-nav-inner {
  width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-right {
  display: flex;
  align-items: center;
}

.welcome-text {
  margin-right: 15px;
}

.nav-divider {
  margin: 0 10px;
  color: #ddd;
}

.nav-link {
  color: #6c6c6c;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

.nav-link:hover,
.nav-link.active {
  color: #f22e00;
  background-color: transparent;
}

.logout-link {
  margin-left: 10px;
}
</style>
