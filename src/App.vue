<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElConfigProvider, ElNotification } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import TopNav from '@/components/TopNav.vue'
import { useRoute } from 'vue-router'
import { getOrderMessages } from '@/api/order/order.js'

const route = useRoute()

// 消息轮询状态
let messageTimer: ReturnType<typeof setInterval> | null = null
const lastTime = ref(new Date().toISOString())
const lastId = ref(0)

// 轮询方法
const fetchMessages = async () => {
  // 根据项目中判断登录状态的方式来决定是否发送请求
  const loginUser = localStorage.getItem('loginUser')
  if (!loginUser) return

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
      lastTime.value = lastMsg.createTime
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
