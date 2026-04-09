<template>
  <div class="buy-container">
    <!-- 头部导航 -->
    <div class="header">
      <el-button type="primary" plain @click="goBack">
        <el-icon><ArrowLeft /></el-icon> 返回上一页
      </el-button>
      <h2>秒杀商品详情</h2>
    </div>

    <!-- 骨架屏（加载状态） -->
    <el-skeleton :loading="loading" animated :rows="10">
      <template #default>
        <div v-if="product">
          <!-- 商品主要信息区 -->
          <div class="main-info">
            <!-- 左侧图片 -->
            <div class="product-image">
              <el-image :src="product.imageUrl" fit="contain" class="main-img" lazy>
                <template #error>
                  <div class="img-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>

            <!-- 右侧信息 -->
            <div class="product-info">
              <h1 class="title">{{ product.productName }}</h1>
              
              <div class="price-box">
                <div class="price-row">
                  <span class="price-label">秒杀价</span>
                  <span class="price"><span class="currency">￥</span>{{ displayPrice }}</span>
                </div>
              </div>

              <!-- 规格选择区 -->
              <div class="specs-section">
                <h3>选择规格</h3>
                <div v-if="specs && specs.length > 0" class="spec-list">
                  <div 
                    v-for="item in specs" 
                    :key="item.id" 
                    class="spec-item"
                    :class="{ active: String(selectedSpecId) === String(item.id) }"
                    @click="selectSpec(item.id)"
                  >
                    {{ item.color }} - {{ item.productSpec }}
                  </div>
                </div>
                <div v-else class="no-specs">暂无可选规格</div>
              </div>

              <!-- 数量选择区 -->
              <div class="quantity-section">
                <span class="quantity-label">数量</span>
                <el-input-number 
                  v-model="buyCount" 
                  :min="1" 
                  :max="1" 
                  size="large"
                  class="quantity-input"
                  disabled
                />
                <span class="limit-hint">秒杀商品限购1件</span>
              </div>

              <!-- 购买操作区 -->
              <div class="actions">
                <el-button type="danger" size="large" class="buy-btn" @click="handleBuy">立即抢购</el-button>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="未能找到商品信息" />
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getStockSpecList } from '@/api/buy.js'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const product = ref(null)
const specs = ref([])
const selectedSpecId = ref(null)
const buyCount = ref(1) // 购买数量，默认1，且不可修改

const selectedSpec = computed(() => {
  if (!selectedSpecId.value || specs.value.length === 0) return null
  return specs.value.find(item => String(item.id) === String(selectedSpecId.value)) ?? null
})

// 计算展示的价格
const displayPrice = computed(() => {
  if (selectedSpec.value && selectedSpec.value.specPrice != null) {
    return Number(selectedSpec.value.specPrice).toFixed(2)
  }
  return '0.00'
})

// 获取商品规格和信息
const fetchProductSpec = async () => {
  try {
    const { productId, productName, activityId, imageUrl } = route.query
    
    if (!productId || !activityId) {
      ElMessage.error('缺少必要的商品参数')
      loading.value = false
      return
    }

    const dto = {
      productId: Number(productId),
      productName: productName,
      activityId: Number(activityId),
      imageUrl: imageUrl
    }

    const res = await getStockSpecList(dto)
    if (res.success && res.data) {
      product.value = {
        productId: res.data.productId,
        productName: res.data.productName,
        imageUrl: res.data.imageUrl
      }
      
      specs.value = res.data.specList || []
      
      if (specs.value.length > 0) {
        selectedSpecId.value = specs.value[0].id
      }
    } else {
      ElMessage.error(res.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情异常:', error)
    ElMessage.error('网络异常，获取商品详情失败')
  } finally {
    loading.value = false
  }
}

const selectSpec = (id) => {
  selectedSpecId.value = id
}

const goBack = () => {
  router.back()
}

const handleBuy = () => {
  if (!selectedSpecId.value) {
    ElMessage.warning('请先选择商品规格')
    return
  }
  
  ElMessage.info('暂不支持下单操作')
}

onMounted(() => {
  window.scrollTo(0, 0)
  fetchProductSpec()
})
</script>

<style scoped>
.buy-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header h2 {
  margin: 0 0 0 20px;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.main-info {
  display: flex;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.product-image {
  flex: 0 0 400px;
  height: 400px;
  margin-right: 40px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.main-img {
  width: 100%;
  height: 100%;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #eee;
  background-color: #f9f9f9;
}

.product-info {
  flex: 1;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.price-box {
  background-color: #fdf5f5;
  padding: 15px 20px;
  margin-bottom: 25px;
  border-radius: 4px;
}

.price-row {
  display: flex;
  align-items: baseline;
}

.price-label {
  color: #ff5000;
  font-size: 14px;
  width: 60px;
}

.price {
  font-size: 28px;
  color: #ff5000;
  font-weight: bold;
}

.price .currency {
  font-size: 16px;
  margin-right: 2px;
}

.specs-section {
  margin-bottom: 30px;
}

.specs-section h3 {
  font-size: 14px;
  color: #999;
  margin: 0 0 10px 0;
  font-weight: normal;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.spec-item {
  padding: 8px 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.spec-item:hover {
  border-color: #ff5000;
  color: #ff5000;
}

.spec-item.active {
  border-color: #ff5000;
  color: #ff5000;
  background-color: #fff8f6;
  font-weight: bold;
}

.no-specs {
  color: #999;
  font-size: 14px;
}

.quantity-section {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
}

.quantity-label {
  font-size: 14px;
  color: #999;
  margin-right: 20px;
}

.quantity-input {
  width: 150px;
}

.limit-hint {
  margin-left: 15px;
  color: #ff5000;
  font-size: 12px;
}

.actions {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

.buy-btn {
  width: 200px;
  font-size: 16px;
  background-color: #ff5000;
  border-color: #ff5000;
}

.buy-btn:hover {
  background-color: #f04b00;
  border-color: #f04b00;
}
</style>