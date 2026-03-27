<template>
  <div class="shop-detailed-container">
    <!-- 头部导航 -->
    <div class="header">
      <el-button type="primary" plain @click="goHome">
        <el-icon><ArrowLeft /></el-icon> 返回首页
      </el-button>
      <h2>商品详情</h2>
    </div>

    <!-- 骨架屏（加载状态） -->
    <el-skeleton :loading="loading" animated :rows="10">
      <template #default>
        <div v-if="product">
          <!-- 商品主要信息区 -->
          <div class="main-info">
            <!-- 左侧图片 -->
            <div class="product-image">
              <el-image :src="product.mainImage" fit="contain" class="main-img" lazy>
                <template #error>
                  <div class="img-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>

            <!-- 右侧信息 -->
            <div class="product-info">
              <h1 class="title">{{ product.name }}</h1>
              <p class="subtitle">{{ product.subTitle }}</p>
              
              <div class="price-box">
                <div class="price-row">
                  <span class="price-label">价格</span>
                  <span class="price"><span class="currency">￥</span>{{ displayPrice }}</span>
                </div>
                <div class="info-row" v-if="product.categoryName">
                  <span class="info-label">分类</span>
                  <span class="info-value">{{ product.categoryName }}</span>
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
                    {{ item.color }} - {{ item.productSpec ?? item.spec }}
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
                  :max="99" 
                  size="large"
                  class="quantity-input"
                />
              </div>

              <!-- 购买操作区 -->
              <div class="actions">
                <el-button type="danger" size="large" class="buy-btn" @click="handleBuy">立即购买</el-button>
                <el-button type="warning" plain size="large" class="cart-btn" @click="handleAddToCart">加入购物车</el-button>
                <el-button 
                  :type="isLiked ? 'warning' : 'default'" 
                  plain 
                  size="large" 
                  class="like-btn" 
                  :disabled="isLikeLoading"
                  @click="handleToggleLike"
                >
                  <el-icon><Star :class="{ 'is-active-star': isLiked }" /></el-icon> 
                  {{ isLiked ? '已收藏' : '收藏' }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 商品详情和评论区 -->
          <div class="details-section">
            <el-tabs class="details-tabs" v-model="activeTab">
              <!-- 详情页 -->
              <el-tab-pane label="商品详情" name="details">
                <div class="html-content" v-if="product.detailHtml" v-html="product.detailHtml"></div>
                <el-empty v-else description="暂无详情介绍" />
              </el-tab-pane>
              
              <!-- 评论页 -->
              <el-tab-pane :label="`商品评价 (${product.commentCount || 0})`" name="comments">
                <div class="comments-container">
                  <div class="rating-summary" v-if="product.commentCount > 0">
                    <div class="rate-score">
                      <span class="score-num">{{ product.goodCommentRate || 100 }}<span class="percent">%</span></span>
                      <span class="score-label">好评率</span>
                    </div>
                  </div>
                  
                  <div v-if="product.allComments && product.allComments.length > 0" class="comment-list">
                    <div v-for="comment in product.allComments" :key="comment.id" class="comment-item">
                      <div class="comment-user">
                        <el-avatar :size="40">{{ comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U' }}</el-avatar>
                        <span class="username">{{ comment.userName }}</span>
                      </div>
                      <div class="comment-main">
                        <el-rate v-model="comment.starRating" disabled text-color="#ff9900" />
                        <div class="comment-content">{{ comment.content }}</div>
                        <div class="comment-meta">
                          <span>{{ formatDate(comment.createTime) }}</span>
                          <span v-if="comment.categoryName" class="meta-divider">|</span>
                          <span v-if="comment.categoryName">分类：{{ comment.categoryName }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <el-empty v-else description="暂无评论" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        <el-empty v-else description="未能找到商品信息" />
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetailed, getProductSpec } from '@/api/product/shopDetailed'
import { addToCart } from '@/api/cart/cart'
import { addUserLike, deleteUserLike, getUserLikeStatus } from '@/api/user/userLike'
import { ArrowLeft, Picture, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const productId = route.params.id

const loading = ref(true)
const product = ref(null)
const specs = ref([])
const activeTab = ref('details')
const selectedSpecId = ref(null)
const buyCount = ref(1) // 购买数量，默认1
const isLiked = ref(false) // 收藏状态
const isLikeLoading = ref(false) // 收藏按钮防抖状态

// 计算展示的价格
const displayPrice = computed(() => {
  if (selectedSpecId.value && specs.value.length > 0) {
    const selectedSpec = specs.value.find(item => String(item.id) === String(selectedSpecId.value))
    if (selectedSpec && selectedSpec.specPrice != null) {
      return Number(selectedSpec.specPrice).toFixed(2)
    }
  }
  return product.value && product.value.price ? Number(product.value.price).toFixed(2) : '0.00'
})

const selectedSpecText = computed(() => {
  if (!selectedSpecId.value || specs.value.length === 0) return null
  const selectedSpec = specs.value.find(item => String(item.id) === String(selectedSpecId.value))
  if (!selectedSpec) return null
  return selectedSpec.productSpec ?? selectedSpec.spec ?? null
})

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    const res = await getProductDetailed(productId)
    if (res.success) {
      product.value = res.data
    } else {
      ElMessage.error(res.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情异常:', error)
    ElMessage.error('网络异常，获取商品详情失败')
  }
}

// 获取商品规格
const fetchProductSpec = async () => {
  try {
    const res = await getProductSpec(productId)
    if (res.success) {
      specs.value = (res.data || []).map(item => {
        if (!item) return item
        if (item.spec == null && item.productSpec != null) return { ...item, spec: item.productSpec }
        return item
      })
      
      // 尝试匹配路由中传递过来的规格参数
      const targetSpecId = route.query.specId
      const targetSpecStr =
        route.query.spec ??
        route.query.productSpec ??
        (typeof targetSpecId === 'string' && Number.isNaN(Number(targetSpecId)) ? targetSpecId : null)
      let matchedSpecId = null

      if (targetSpecId && specs.value.length > 0) {
        // 优先根据直接传过来的 specId 匹配
        const matchedItem = specs.value.find(item => String(item.id) === String(targetSpecId))
        if (matchedItem) {
          matchedSpecId = matchedItem.id
        }
      }

      if (!matchedSpecId && targetSpecStr && specs.value.length > 0) {
        // 兼容原来的模糊字符串匹配逻辑
        const targetWords = targetSpecStr.split(/[\s,，+、]+/).filter(Boolean)
        
        const matchedItem = specs.value.find(item => {
          const specStr = [item.color, item.productSpec ?? item.spec].filter(Boolean).join(' ')
          return targetWords.every(word => specStr.includes(word)) || targetSpecStr === specStr.trim()
        })

        if (matchedItem) {
          matchedSpecId = matchedItem.id
        }
      }

      // 如果有匹配到的规格就选中它，否则默认选中第一个规格
      if (matchedSpecId) {
        selectedSpecId.value = matchedSpecId
      } else if (specs.value.length > 0) {
        selectedSpecId.value = specs.value[0].id
      }
    } else {
      console.warn('获取规格失败:', res.message)
    }
  } catch (error) {
    console.error('获取商品规格异常:', error)
  }
}

const selectSpec = (id) => {
  selectedSpecId.value = id
}

const goHome = () => {
  router.push({ name: 'home' })
}

const handleBuy = () => {
  ElMessage.info('购买功能暂未实现，敬请期待！')
}

// 加入购物车处理逻辑
const handleAddToCart = async () => {
  if (!selectedSpecId.value) {
    ElMessage.warning('请先选择商品规格')
    return
  }

  try {
    const cartDto = {
      productId: Number(productId),
      categoryId: product.value.categoryId,
      specId: Number(selectedSpecId.value),
      productSpec: selectedSpecText.value,
      price: Number(displayPrice.value),
      num: buyCount.value
    }

    const res = await addToCart(cartDto)
    if (res.success) {
      ElMessage.success('成功加入购物车！')
    } else {
      ElMessage.error(res.message || '加入购物车失败')
    }
  } catch (error) {
    console.error('加入购物车异常:', error)
    ElMessage.error('网络异常，加入购物车失败')
  }
}

// 获取收藏状态
const checkLikeStatus = async () => {
  if (!selectedSpecId.value || !product.value) return
  
  try {
    const likeDto = {
      productId: Number(productId),
      categoryId: product.value.categoryId,
      specId: Number(selectedSpecId.value),
      productSpec: selectedSpecText.value
    }
    const res = await getUserLikeStatus(likeDto)
    if (res.success) {
      isLiked.value = res.data
    }
  } catch (error) {
    console.error('获取收藏状态异常:', error)
  }
}

// 监听规格变化，重新获取收藏状态
watch(selectedSpecId, (newVal) => {
  if (newVal) {
    checkLikeStatus()
  }
})

// 切换收藏状态处理逻辑
const handleToggleLike = async () => {
  if (!selectedSpecId.value) {
    ElMessage.warning('请先选择商品规格')
    return
  }
  
  if (isLikeLoading.value) return // 防抖，防止重复点击
  
  isLikeLoading.value = true // 开启禁用状态

  try {
    const likeDto = {
      productId: Number(productId),
      categoryId: product.value.categoryId,
      specId: Number(selectedSpecId.value),
      productSpec: selectedSpecText.value
    }

    if (isLiked.value) {
      // 取消收藏
      const res = await deleteUserLike(likeDto)
      if (res.success) {
        ElMessage.success('已取消收藏')
        isLiked.value = false
      } else {
        ElMessage.error(res.message || '取消收藏失败')
      }
    } else {
      // 新增收藏
      const res = await addUserLike(likeDto)
      if (res.success) {
        ElMessage.success('成功加入收藏！')
        isLiked.value = true
      } else {
        ElMessage.error(res.message || '加入收藏失败')
      }
    }
  } catch (error) {
    console.error('操作收藏异常:', error)
    ElMessage.error('网络异常，操作失败')
  } finally {
    // 操作完成后，等待 1 秒再解除按钮禁用
    setTimeout(() => {
      isLikeLoading.value = false
    }, 1000)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  window.scrollTo(0, 0)
  if (productId) {
    loading.value = true
    await Promise.all([fetchProductDetail(), fetchProductSpec()])
    loading.value = false
    // 初始化完成后检查当前选中规格的收藏状态
    if (selectedSpecId.value) {
      checkLikeStatus()
    }
  } else {
    ElMessage.error('缺少商品ID参数')
    loading.value = false
  }
})
</script>

<style scoped>
.shop-detailed-container {
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
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.subtitle {
  font-size: 14px;
  color: #ff5000;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.price-box {
  background-color: #f5f5f5;
  padding: 15px 20px;
  margin-bottom: 25px;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}

.price-label {
  color: #999;
  font-size: 13px;
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

.info-row {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: #999;
  width: 60px;
}

.info-value {
  color: #666;
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

.actions {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

.buy-btn, .cart-btn, .like-btn {
  width: 160px;
  font-size: 16px;
}

.is-active-star {
  color: #E6A23C;
}

.buy-btn {
  background-color: #ff5000;
  border-color: #ff5000;
}

.buy-btn:hover {
  background-color: #f04b00;
  border-color: #f04b00;
}

.details-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.details-tabs {
  padding: 0 20px 20px 20px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  height: 50px;
  line-height: 50px;
}

:deep(.el-tabs__item.is-active) {
  color: #ff5000;
  font-weight: bold;
}

:deep(.el-tabs__active-bar) {
  background-color: #ff5000;
}

.html-content {
  line-height: 1.8;
  color: #333;
  padding: 20px;
  font-size: 15px;
}

.html-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px auto;
}

.comments-container {
  padding: 20px;
}

.rating-summary {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.rate-score {
  display: flex;
  align-items: baseline;
}

.score-num {
  font-size: 40px;
  color: #ff5000;
  font-weight: bold;
}

.percent {
  font-size: 20px;
}

.score-label {
  margin-left: 10px;
  color: #999;
  font-size: 14px;
}

.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-item {
  display: flex;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-user {
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.username {
  margin-top: 10px;
  color: #666;
  font-size: 13px;
  text-align: center;
  word-break: break-all;
}

.comment-main {
  flex: 1;
  padding-left: 20px;
}

.comment-content {
  margin: 15px 0;
  color: #333;
  line-height: 1.6;
  font-size: 14px;
}

.comment-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
}

.meta-divider {
  margin: 0 10px;
  color: #eee;
}
</style>
