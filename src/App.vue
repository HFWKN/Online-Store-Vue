<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElConfigProvider, ElNotification } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import TopNav from '@/components/TopNav.vue'
import { useRoute } from 'vue-router'
import { getOrderMessages } from '@/api/order/order.js'

const route = useRoute()

// 获取本地时间格式 YYYY-MM-DD HH:mm:ss
const getLocalTime = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}

// 格式化时间为后端期望的 ISO.DATE_TIME 格式，即 yyyy-MM-dd'T'HH:mm:ss
const formatToBackendTime = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}

// 消息轮询状态
let messageTimer: ReturnType<typeof setInterval> | null = null
// 使用当前本地时间作为起点，因为我们不希望查询历史消息，只查询新产生的消息
const lastTime = ref(formatToBackendTime(new Date()))
const lastId = ref(0)
let currentLoginUser = localStorage.getItem('loginUser')

// 轮询方法
const fetchMessages = async () => {
  // 根据项目中判断登录状态的方式来决定是否发送请求
  const loginUser = localStorage.getItem('loginUser')
  
  // 检查登录状态是否发生变化（比如刚登录），如果刚登录，重置时间和id
  if (loginUser && loginUser !== currentLoginUser) {
    lastTime.value = formatToBackendTime(new Date())
    lastId.value = 0
  }
  currentLoginUser = loginUser

  if (!loginUser) return
  
  // 在登录/注册界面，不发送请求
  if (route.path === '/login' || route.path === '/register' || route.path === '/') return

  try {
    const res = await getOrderMessages({
      lastTime: lastTime.value,
      lastId: lastId.value,
      limit: 50
    })

    if (res.success && res.data && res.data.length > 0) {
      const messages = res.data

      // 遍历展示新消息
      messages.forEach((msg: any) => {
        ElNotification({
          title: '系统通知',
          message: msg.content,
          type: 'info',
          duration: 5000,
          position: 'top-right'
        })
      })

      // 更新游标
      const lastMsg = messages[messages.length - 1]
      // 这里确保后端返回的时间格式也是可以直接用于下次查询的，如果后端返回的是带空格的字符串，我们将其转成带T的
      let createTime = lastMsg.createTime
      if (createTime && createTime.includes(' ')) {
        createTime = createTime.replace(' ', 'T')
      }
      lastTime.value = createTime
      lastId.value = lastMsg.id
    }
  } catch (error) {
    console.error('获取订单消息失败:', error)
  }
}

onMounted(() => {
  // 首次请求可以稍微延后一点或者立即执行
  // 5秒轮询
  messageTimer = setInterval(fetchMessages, 5000)
})

onUnmounted(() => {
  if (messageTimer) {
    clearInterval(messageTimer)
  }
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <TopNav v-if="route.path !== '/login' && route.path !== '/register' && route.path !== '/'" />
    <router-view></router-view>
  </el-config-provider>
</template>

<style scoped>


</style>
