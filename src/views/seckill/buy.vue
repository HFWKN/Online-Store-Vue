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

              <!-- 收货地址选择区 -->
              <div class="address-section">
                <span class="address-label">收货地址</span>
                <div v-if="addressList.length > 0" class="address-select-wrapper">
                  <el-select 
                    v-model="selectedAddressId" 
                    placeholder="请选择收货地址" 
                    size="large"
                    class="address-select"
                  >
                    <el-option
                      v-for="addr in addressList"
                      :key="addr.id"
                      :label="`${addr.receiverName} ${addr.receiverPhone} - ${addr.address}`"
                      :value="addr.id"
                    >
                      <div class="select-option-content">
                        <span class="option-name">{{ addr.receiverName }}</span>
                        <span class="option-phone">{{ addr.receiverPhone }}</span>
                        <el-tag v-if="addr.isDefault === 1" size="small" type="success" class="option-tag">默认</el-tag>
                        <span class="option-address">{{ addr.address }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </div>
                <div v-else class="no-address-inline">
                  <span class="no-address-text">暂无收货地址</span>
                  <el-button type="primary" link @click="goToAddressManager">去添加</el-button>
                </div>
              </div>

              <!-- 购买操作区 -->
              <div class="actions">
                <el-button 
                  type="danger" 
                  size="large" 
                  class="buy-btn" 
                  @click="handleBuy"
                  :loading="isSubmitting"
                >
                  立即抢购
                </el-button>
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
import { getStockSpecList, getSeckillToken, submitSeckillOrder } from '@/api/buy.js'
import { ArrowLeft, Picture, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { selectAddress } from '@/api/user/address.js'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const product = ref(null)
const specs = ref([])
const selectedSpecId = ref(null)
const buyCount = ref(1) // 购买数量，默认1，且不可修改

const addressList = ref([])
const selectedAddressId = ref(null)

const selectedSpec = computed(() => {
  if (!selectedSpecId.value || specs.value.length === 0) return null
  return specs.value.find(item => String(item.id) === String(selectedSpecId.value)) ?? null
})

const selectedAddress = computed(() => {
  if (!selectedAddressId.value || addressList.value.length === 0) return null
  return addressList.value.find(addr => addr.id === selectedAddressId.value) ?? null
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

const goToAddressManager = () => {
  router.push('/my/address')
}

const isSubmitting = ref(false)

const handleBuy = async () => {
  if (!selectedSpecId.value) {
    ElMessage.warning('请先选择商品规格')
    return
  }
  
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  const { activityId, productId } = route.query
  if (!activityId || !productId) {
    ElMessage.error('缺少必要的商品参数')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  const MAX_RETRIES = 2 // 最大重试次数

  // 获取 token 所需的参数
  const tokenDto = {
    productId: Number(productId),
    activityId: Number(activityId),
    specId: Number(selectedSpecId.value)
  }

  // 组装下单参数
  const orderDto = {
    addressId: selectedAddressId.value,
    stockId: selectedSpec.value.id, // 根据后端要求，这里用规格的ID作为库存ID
    activityId: Number(activityId),
    productId: Number(productId),
    specId: selectedSpec.value.id,
    num: buyCount.value,
    payAmount: Number(displayPrice.value)
  }

  // 内部封装一个带重试机制的下单函数
  const attemptOrder = async (retryCount) => {
    try {
      // 1. 领 token（每次下单/重试前都要重新获取）
      const tokenRes = await getSeckillToken(tokenDto)
      if (!tokenRes.success || !tokenRes.data) {
        ElMessage.error(tokenRes.message || '获取抢购资格失败')
        return
      }
      const token = tokenRes.data
      sessionStorage.setItem('seckillToken', token)
      
      // 2. 发起秒杀下单请求
      const orderRes = await submitSeckillOrder(orderDto, token)
      
      // 根据后端返回的 Result<CodeInfoVo> 解析
      if (orderRes.success && orderRes.data) {
        const codeInfo = orderRes.data // 这个就是后端的 CodeInfoVo
        
        if (codeInfo.code === 200) {
          ElMessage.success(codeInfo.message || '秒杀成功！')
          // TODO: 下单成功后，可跳转至订单列表页或支付页
          // router.push('/my/order')
        } else if (codeInfo.code === 500) {
          // 500 代表"可重试失败"
          if (retryCount < MAX_RETRIES) {
            // 还没有达到最大重试次数，进行自动重试
            await attemptOrder(retryCount + 1)
          } else {
            // 超过重试次数，抛出提示让用户手动重试
            ElMessage.error('下单失败，请重试')
          }
        } else {
          // 其他业务错误码 (如 401重复购买, 403库存不足, 408活动结束等)
          ElMessage.warning(codeInfo.message || '秒杀失败')
        }
      } else {
        ElMessage.error(orderRes.message || '秒杀下单请求失败')
      }
      
    } catch (error) {
      console.error('抢购异常:', error)
      ElMessage.error('网络异常，抢购失败')
    }
  }

  // 开始首次下单尝试
  await attemptOrder(0)
  
  isSubmitting.value = false
}

// 获取地址列表
const fetchAddress = async () => {
  try {
    const res = await selectAddress()
    if (res.success) {
      addressList.value = res.data || []
      if (addressList.value.length > 0) {
        const defaultAddr = addressList.value.find(a => a.isDefault === 1)
        selectedAddressId.value = defaultAddr ? defaultAddr.id : addressList.value[0].id
      }
    }
  } catch (error) {
    console.error('获取地址失败:', error)
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
  fetchProductSpec()
  fetchAddress()
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

/* 地址选择区 */
.address-section {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
}

.address-label {
  font-size: 14px;
  color: #999;
  margin-right: 20px;
  white-space: nowrap;
}

.address-select-wrapper {
  flex: 1;
  max-width: 500px;
}

.address-select {
  width: 100%;
}

.select-option-content {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.option-name {
  font-weight: bold;
  color: #333;
}

.option-phone {
  color: #666;
}

.option-tag {
  flex-shrink: 0;
}

.option-address {
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.no-address-inline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.no-address-text {
  color: #999;
  font-size: 14px;
}
</style>