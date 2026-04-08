<template>
  <div class="seckill-container">
    <!-- 顶部导航栏 -->
    <div class="seckill-header">
      <h2 class="page-title">秒杀活动专场</h2>
      <div class="activity-nav">
        <div 
          class="nav-item" 
          v-for="activity in activityList" 
          :key="activity.id"
          :class="[
            { 'active': currentSelectedId === activity.id },
            { 'is-current': currentActivity?.id === activity.id },
            { 'is-next': nextActivity?.id === activity.id }
          ]"
          @click="selectActivity(activity.id)"
        >
          <div class="time-box">
            <span class="time">{{ formatTime(activity.beginTime, activity.endTime, currentActivity?.id === activity.id) }}</span>
          </div>
          <div class="status-box">
            <span v-if="currentActivity?.id === activity.id">抢购中</span>
            <span v-else-if="nextActivity?.id === activity.id">即将开始</span>
            <span v-else-if="isEnded(activity.endTime)">已结束</span>
            <span v-else>预热中</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 商品列表 -->
    <div class="seckill-content" v-loading="loading">
      <template v-if="productList.length > 0">
        <div class="product-grid">
          <div class="product-card" v-for="product in productList" :key="product.productId">
            <div class="product-image">
              <img :src="formatImageUrl(product.imageUrl)" :alt="product.productName">
            </div>
            <div class="product-info">
              <h3 class="product-name" :title="product.productName">{{ product.productName }}</h3>
              <div class="product-price">
                <span class="price-label">原价:</span>
                <span class="origin-price">¥{{ product.originPrice?.toFixed(2) || '0.00' }}</span>
                <span class="price-hint">点击查看具体价格</span>
              </div>
              <div class="product-actions">
                <el-button type="danger" class="buy-btn">立即抢购</el-button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <el-empty v-else description="该活动下暂无商品..." />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSeckillActivityList, getSeckillProductList } from '@/api/seckill.js'
import { ElMessage } from 'element-plus'

// 数据状态
const activityList = ref([])
const currentActivity = ref(null)
const nextActivity = ref(null)
const currentSelectedId = ref(null)
const productList = ref([])
const loading = ref(false)

// 获取商品数据
const fetchProductList = async (activityId) => {
  if (!activityId) return
  loading.value = true
  try {
    const res = await getSeckillProductList(activityId)
    if (res.success) {
      productList.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取商品列表失败')
      productList.value = []
    }
  } catch (error) {
    console.error('获取商品列表出错:', error)
    ElMessage.error('网络或服务器异常')
    productList.value = []
  } finally {
    loading.value = false
  }
}

// 获取活动数据
const fetchActivities = async () => {
  try {
    const res = await getSeckillActivityList()
    if (res.success && res.data) {
      activityList.value = res.data.activityList || []
      currentActivity.value = res.data.currentActivity || null
      nextActivity.value = res.data.nextActivity || null
      
      // 默认选中当前活动，如果没有当前活动则选中下一个，如果都没有则选中第一个
      if (currentActivity.value?.id) {
        currentSelectedId.value = currentActivity.value.id
      } else if (nextActivity.value?.id) {
        currentSelectedId.value = nextActivity.value.id
      } else if (activityList.value.length > 0) {
        currentSelectedId.value = activityList.value[0].id
      }

      if (currentSelectedId.value) {
        fetchProductList(currentSelectedId.value)
      }
    } else {
      ElMessage.error(res.message || '获取秒杀活动失败')
    }
  } catch (error) {
    console.error('获取活动列表出错:', error)
    ElMessage.error('网络或服务器异常')
  }
}

// 格式化图片URL，去除多余的引号和空格
const formatImageUrl = (url) => {
  if (!url) return ''
  return url.replace(/[`'"]/g, '').trim()
}

// 格式化时间：当前活动显示 HH:mm - HH:mm，其他活动显示 MM月DD日
const formatTime = (beginTimeStr, endTimeStr, isCurrent) => {
  if (!beginTimeStr) return ''
  const beginDate = new Date(beginTimeStr)
  
  if (isCurrent && endTimeStr) {
    const endDate = new Date(endTimeStr)
    const beginHours = String(beginDate.getHours()).padStart(2, '0')
    const beginMinutes = String(beginDate.getMinutes()).padStart(2, '0')
    const endHours = String(endDate.getHours()).padStart(2, '0')
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0')
    return `${beginHours}:${beginMinutes} - ${endHours}:${endMinutes}`
  } else {
    const month = beginDate.getMonth() + 1
    const day = beginDate.getDate()
    return `${month}月${day}日`
  }
}

// 判断是否已结束
const isEnded = (endTimeStr) => {
  if (!endTimeStr) return false
  return new Date() > new Date(endTimeStr)
}

// 切换选中的活动
const selectActivity = (id) => {
  if (currentSelectedId.value === id) return
  currentSelectedId.value = id
  fetchProductList(id)
}

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
.seckill-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 40px;
}

.seckill-header {
  background-color: #fff;
  padding: 20px 0 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-title {
  text-align: center;
  color: #ff5000;
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 20px 0;
  letter-spacing: 2px;
}

.activity-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
  color: #fff;
  height: 60px;
  overflow-x: auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 30px;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
  position: relative;
}

.nav-item:hover {
  background-color: #444;
}

.nav-item.active {
  background-color: #ff5000;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #ff5000 transparent transparent transparent;
}

.time-box {
  font-size: 18px; /* 稍微改小一点字号，适应较长的区间时间 */
  font-weight: bold;
  margin-bottom: 4px;
}

.status-box {
  font-size: 14px;
}

/* 当前活动特殊标识 */
.nav-item.is-current .status-box {
  color: #ffccb3;
}
.nav-item.active.is-current .status-box {
  color: #fff;
  font-weight: bold;
}

/* 下一次活动特殊标识 */
.nav-item.is-next .status-box {
  color: #aae0ff;
}
.nav-item.active.is-next .status-box {
  color: #fff;
}

.seckill-content {
  width: 1200px;
  margin: 40px auto 0;
  background-color: #fff;
  border-radius: 12px;
  padding: 40px;
  min-height: 400px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  background-color: #fff;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  color: #333;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin-bottom: 15px;
  font-size: 14px;
}

.price-label {
  color: #999;
  margin-right: 4px;
}

.origin-price {
  color: #999;
  text-decoration: line-through;
  margin-right: 8px;
}

.price-hint {
  color: #ff5000;
  font-size: 12px;
  cursor: pointer;
}

.product-actions {
  display: flex;
  justify-content: flex-end;
}

.buy-btn {
  width: 100%;
  border-radius: 20px;
}
</style>
