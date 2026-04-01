<template>
  <div class="checkout-container">
    <!-- 顶部导航 -->
    <header class="checkout-header">
      <div class="header-inner">
        <div class="logo-area" @click="goHome">
          <div class="logo-main">拼少少</div>
          <div class="logo-title">确认订单</div>
        </div>
      </div>
    </header>

    <main class="checkout-main">
      <div class="main-inner" v-loading="loading">
        <!-- 收货地址选择 -->
        <div class="section-card">
          <h3 class="section-title">收货地址</h3>
          <div v-if="addressList.length > 0" class="address-list">
            <div 
              v-for="addr in addressList" 
              :key="addr.id" 
              class="address-item"
              :class="{ active: selectedAddressId === addr.id }"
              @click="selectedAddressId = addr.id"
            >
              <div class="addr-header">
                <span class="name">{{ addr.receiverName }}</span>
                <span class="phone">{{ addr.receiverPhone }}</span>
              </div>
              <div class="addr-detail">
                <el-tag v-if="addr.isDefault === 1" size="small" type="success" class="default-tag">默认</el-tag>
                {{ addr.address }}
              </div>
              <div class="active-icon" v-if="selectedAddressId === addr.id">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
          <div v-else class="no-address">
            <el-empty description="暂无收货地址" :image-size="60">
              <el-button type="primary" @click="goToAddressManager" size="small">去添加地址</el-button>
            </el-empty>
          </div>
        </div>

        <!-- 确认订单信息 -->
        <div class="section-card">
          <h3 class="section-title">确认商品信息</h3>
          <div class="goods-list">
            <div class="goods-header">
              <div class="col-info">商品信息</div>
              <div class="col-price">单价</div>
              <div class="col-num">数量</div>
              <div class="col-total">小计</div>
            </div>
            <div class="goods-item" v-for="(item, index) in checkoutItems" :key="index">
              <div class="col-info">
                <el-image :src="item.mainImage" fit="cover" class="goods-img" />
                <div class="goods-desc">
                  <div class="goods-name">{{ item.productName }}</div>
                  <div class="goods-spec">
                    <span class="spec-tag" v-if="item.color">{{ item.color }}</span>
                    <span class="spec-tag" v-if="item.productSpec">{{ item.productSpec }}</span>
                  </div>
                </div>
              </div>
              <div class="col-price">¥{{ Number(item.price).toFixed(2) }}</div>
              <div class="col-num">{{ item.num }}</div>
              <div class="col-total highlight">¥{{ (item.price * item.num).toFixed(2) }}</div>
            </div>
          </div>
          
          <div class="order-remark">
            <span class="remark-label">买家留言：</span>
            <el-input 
              v-model="remark" 
              placeholder="选填：对本次交易的说明（建议填写已和卖家协商一致的内容）" 
              maxlength="200"
              show-word-limit
              class="remark-input"
            />
          </div>
        </div>

        <!-- 结算汇总 -->
        <div class="summary-section">
          <div class="summary-content">
            <div class="summary-row">
              <span class="label">商品件数：</span>
              <span class="value">{{ totalNum }} 件</span>
            </div>
            <div class="summary-row total-row">
              <span class="label">应付总额：</span>
              <span class="value total-price">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-address" v-if="selectedAddress">
              寄送至：{{ selectedAddress.address }} &nbsp;&nbsp; 收货人：{{ selectedAddress.receiverName }} {{ selectedAddress.receiverPhone }}
            </div>
          </div>
          <div class="submit-actions">
            <el-button class="submit-btn" type="danger" size="large" @click="submitOrder" :loading="submitting">
              提交订单
            </el-button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { selectAddress } from '@/api/user/address.js'
import { createOrder, getToken } from '@/api/order/order.js'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)

const addressList = ref([])
const selectedAddressId = ref(null)
const checkoutItems = ref([])
const remark = ref('')
const orderToken = ref('')

// 计算选中地址对象
const selectedAddress = computed(() => {
  return addressList.value.find(addr => addr.id === selectedAddressId.value) || null
})

// 计算总数
const totalNum = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + Number(item.num), 0)
})

// 计算总价
const totalPrice = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + (Number(item.price) * Number(item.num)), 0)
})

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    // 1. 获取商品信息 (从 sessionStorage 中读取)
    const storedItems = sessionStorage.getItem('checkoutItems')
    if (storedItems) {
      checkoutItems.value = JSON.parse(storedItems)
    } else {
      ElMessage.warning('没有找到待结算的商品，请重新选择')
      router.replace('/cart')
      return
    }

    // 2. 获取地址列表
    const res = await selectAddress()
    if (res.success) {
      addressList.value = res.data || []
      // 默认选中默认地址，或者第一个地址
      if (addressList.value.length > 0) {
        const defaultAddr = addressList.value.find(a => a.isDefault === 1)
        selectedAddressId.value = defaultAddr ? defaultAddr.id : addressList.value[0].id
      }
    }

    // 3. 获取订单 Token，防止重复提交
    const tokenRes = await getToken()
    if (tokenRes && tokenRes.success) {
      orderToken.value = tokenRes.data || tokenRes.message || tokenRes.msg // 兼容不同格式
    } else if (typeof tokenRes === 'string') {
      orderToken.value = tokenRes
    }
  } catch (error) {
    console.error('初始化订单页面异常:', error)
    ElMessage.error('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 提交订单
const submitOrder = async () => {
  if (submitting.value) return // 防止连续点击

  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  if (checkoutItems.value.length === 0) {
    ElMessage.warning('商品信息异常')
    return
  }

  // 构造后端的 CreateOrderDto
  const orderDto = {
    addressId: selectedAddressId.value,
    remark: remark.value,
    payAmount: totalPrice.value,
    items: checkoutItems.value.map(item => ({
      productId: item.productId,
      specId: item.specId ? Number(item.specId) : null, // 确保有值时转为数字，或者如果是 undefined 返回 null
      num: item.num
    }))
  }

  submitting.value = true
  try {
    const res = await createOrder(orderDto, orderToken.value)
    // 根据后端返回判断，可能是封装好的对象或直接返回的字符串
    if (typeof res === 'string') {
      ElMessage.success(res || '下单成功！')
      sessionStorage.removeItem('checkoutItems')
      router.push('/my/order')
    } else if (res && res.success) {
      ElMessage.success('下单成功！')
      sessionStorage.removeItem('checkoutItems')
      router.push('/my/order')
    } else {
      ElMessage.error((res && res.message) ? res.message : '下单失败')
    }
  } catch (error) {
    console.error('提交订单异常:', error)
    ElMessage.error('提交订单异常，请稍后重试')
  } finally {
    // 提交完成后延迟1秒再恢复按钮状态，防止快速连续点击
    setTimeout(() => {
      submitting.value = false
    }, 1000)
  }
}

const goHome = () => {
  router.push('/home')
}

const goToAddressManager = () => {
  router.push('/my/address')
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.checkout-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

.header-inner, .main-inner {
  width: 1200px;
  margin: 0 auto;
}

/* 顶部导航 */
.checkout-header {
  background-color: #fff;
  padding: 20px 0;
  border-bottom: 2px solid #ff5000;
}

.logo-area {
  display: flex;
  align-items: flex-end;
  cursor: pointer;
  width: max-content;
}

.logo-main {
  color: #ff5000;
  font-size: 32px;
  font-weight: bold;
  margin-right: 20px;
}

.logo-title {
  font-size: 24px;
  color: #333;
  font-weight: bold;
  margin-bottom: 2px;
}

/* 主体区域 */
.checkout-main {
  padding: 20px 0 60px;
}

.section-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 地址列表 */
.address-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.address-item {
  width: 260px;
  height: 120px;
  border: 2px solid #e5e5e5;
  border-radius: 4px;
  padding: 15px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  background: #fff;
}

.address-item:hover {
  border-color: #ff5000;
}

.address-item.active {
  border-color: #ff5000;
  background: #fffcf9;
}

.addr-header {
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
  display: flex;
  justify-content: space-between;
}

.addr-detail {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.default-tag {
  margin-right: 5px;
}

.active-icon {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 24px;
  height: 24px;
  background-color: #ff5000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 8px;
}

.no-address {
  padding: 20px 0;
}

/* 商品列表 */
.goods-list {
  border: 1px solid #eee;
}

.goods-header {
  display: flex;
  background: #f5f5f5;
  padding: 10px 20px;
  font-size: 14px;
  color: #666;
  font-weight: bold;
}

.goods-item {
  display: flex;
  padding: 20px;
  border-top: 1px solid #eee;
  align-items: center;
}

.col-info {
  flex: 1;
  display: flex;
  gap: 15px;
}

.col-price, .col-num, .col-total {
  width: 120px;
  text-align: center;
  font-size: 14px;
}

.goods-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.goods-desc {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.goods-name {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 10px;
}

.goods-spec {
  display: flex;
  gap: 8px;
}

.spec-tag {
  background-color: #f5f5f5;
  color: #999;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.highlight {
  color: #ff5000;
  font-weight: bold;
}

/* 备注 */
.order-remark {
  margin-top: 20px;
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: #fcfcfc;
  border: 1px solid #eee;
}

.remark-label {
  font-size: 14px;
  color: #333;
  width: 80px;
  padding-top: 5px;
}

.remark-input {
  flex: 1;
}

/* 汇总 */
.summary-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: #fff;
  border-radius: 8px;
  padding: 20px 30px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.summary-content {
  border: 1px solid #ff5000;
  padding: 20px;
  width: 400px;
  background: #fffcf9;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}

.total-row {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.total-price {
  color: #ff5000;
  font-size: 24px;
  font-weight: bold;
}

.summary-address {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  text-align: right;
  line-height: 1.5;
}

.submit-actions {
  width: 440px; /* 匹配内容宽度+padding */
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  width: 150px;
  font-size: 18px;
  font-weight: bold;
  background-color: #ff5000;
  border-color: #ff5000;
}

.submit-btn:hover {
  background-color: #f04b00;
  border-color: #f04b00;
}
</style>
