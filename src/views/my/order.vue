<template>
  <div class="order-container">
    <!-- 顶部筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="queryParams" class="filter-form" @submit.prevent>
        <el-form-item label="商品名称">
          <el-input 
            v-model="queryParams.productName" 
            placeholder="输入商品名称" 
            clearable 
            @keyup.enter="handleSearch" 
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select 
            v-model="queryParams.status" 
            placeholder="全部状态" 
            clearable 
            @change="handleSearch" 
            style="width: 150px;"
          >
            <el-option label="待支付" :value="0" />
            <el-option label="已支付/待发货" :value="1" />
            <el-option label="已发货/待收货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 订单列表区域 -->
    <div class="list-section" v-loading="loading">
      <template v-if="orderList && orderList.length > 0">
        <div class="order-item-card" v-for="order in orderList" :key="order.id">
          <div class="order-header">
            <span class="order-no">订单号：{{ order.orderItemNo }}</span>
            <span class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div class="order-body">
            <div class="product-info" @click="goToDetail(order.productId)">
              <el-image :src="cleanImageUrl(order.mainImage)" class="product-img" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="product-detail">
                <div class="product-name">{{ order.productName }}</div>
                <div class="product-spec">
                  <span v-if="order.color">颜色：{{ order.color }}</span>
                  <span v-if="order.productSpec" style="margin-left: 10px;">规格：{{ order.productSpec }}</span>
                </div>
              </div>
            </div>
            <div class="product-price">
              单价：¥{{ Number(order.productPrice).toFixed(2) }}
            </div>
            <div class="product-quantity">
              数量：{{ order.quantity }}
            </div>
            <div class="order-total">
              实付款：<span class="price-amount">¥{{ Number(order.totalPrice).toFixed(2) }}</span>
            </div>
            <div class="order-actions">
              <el-button type="primary" size="small" v-if="order.status === 0">去支付</el-button>
              <el-button size="small" @click="goToDetail(order.productId)">再次购买</el-button>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">
        <el-empty description="暂无相关订单" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllOrderItems } from '@/api/order/order.js'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const orderList = ref([])

const queryParams = ref({
  productName: '',
  status: null
})

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '已发货',
    3: '已完成',
    4: '已取消'
  }
  return statusMap[status] || `状态(${status})`
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    0: 'status-warning',
    1: 'status-success',
    2: 'status-primary',
    3: 'status-info',
    4: 'status-danger'
  }
  return classMap[status] || 'status-default'
}

// 处理图片URL，防止包含反引号等不合法字符
const cleanImageUrl = (url) => {
  if (!url) return ''
  return url.replace(/`/g, '').trim()
}

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {}
    if (queryParams.value.productName) {
      params.productName = queryParams.value.productName
    }
    if (queryParams.value.status !== null && queryParams.value.status !== '') {
      params.status = queryParams.value.status
    }
    
    const res = await getAllOrderItems(params)
    if (res.success) {
      orderList.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表异常:', error)
    // 根据拦截器配置，通常错误会由 request.js 提示，这里可以不再重复提示
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  loadOrders()
}

// 重置
const resetSearch = () => {
  queryParams.value = {
    productName: '',
    status: null
  }
  loadOrders()
}

// 跳转到详情
const goToDetail = (productId) => {
  if (productId) {
    router.push({ name: 'shopDetailed', params: { id: productId } })
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 600px;
}

.filter-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.order-item-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s;
}

.order-item-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.order-header {
  background-color: #f5f7fa;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.order-no {
  font-weight: bold;
}

.order-status {
  font-weight: bold;
}

.status-warning { color: #e6a23c; }
.status-success { color: #67c23a; }
.status-primary { color: #409eff; }
.status-info { color: #909399; }
.status-danger { color: #f56c6c; }
.status-default { color: #606266; }

.order-body {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-info {
  display: flex;
  flex: 3;
  cursor: pointer;
}

.product-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  margin-right: 15px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}

.product-detail {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 500;
  transition: color 0.2s;
}

.product-name:hover {
  color: #409eff;
}

.product-spec {
  font-size: 12px;
  color: #909399;
}

.product-price, .product-quantity {
  flex: 1;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

.order-total {
  flex: 1.5;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.price-amount {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.order-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.empty-state {
  padding: 40px 0;
}
</style>
