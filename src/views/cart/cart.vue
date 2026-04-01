<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMyCart, deleteCart, selectCartByName } from '@/api/cart/cart.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, ShoppingCartFull } from '@element-plus/icons-vue'

const router = useRouter()
const cartList = ref([])
const loading = ref(false)
const selectedItems = ref([])
const searchKeyword = ref('') // 搜索关键词

// 获取购物车数据
const loadCartData = async () => {
  loading.value = true
  try {
    const res = await getMyCart()
    if (res.success && res.data) {
      cartList.value = res.data
    } else {
      ElMessage.error(res.message || '获取购物车失败')
    }
  } catch (error) {
    console.error('获取购物车异常:', error)
    ElMessage.error('获取购物车异常，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 选中项变化
const handleSelectionChange = (val) => {
  selectedItems.value = val
}

// 修改数量
const handleNumChange = (row) => {
  // 实时计算小计
  row.allPrice = row.num * row.specPrice
  // TODO: 这里可以调用后端接口更新购物车商品数量
}

// 删除单个商品
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要将该商品移出购物车吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCart([row.id])
      if (res.success) {
        cartList.value = cartList.value.filter(item => item.id !== row.id)
        ElMessage.success('删除成功')
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除商品异常:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedItems.value.length} 件商品吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const selectedIds = selectedItems.value.map(item => item.id)
      const res = await deleteCart(selectedIds)
      if (res.success) {
        cartList.value = cartList.value.filter(item => !selectedIds.includes(item.id))
        ElMessage.success('批量删除成功')
      } else {
        ElMessage.error(res.message || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除异常:', error)
      ElMessage.error('批量删除失败，请稍后重试')
    }
  }).catch(() => {})
}

// 去结算
const handleCheckout = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }
  
  // 提取结算所需的字段
  const checkoutItems = selectedItems.value.map(item => ({
    productId: item.productId,
    // 适配后端可能返回的各种命名：specId, productSpecId, spec_id 等
    specId: item.specId || item.productSpecId || item.spec_id || null, 
    productName: item.productName,
    mainImage: item.mainImage,
    color: item.color,
    productSpec: item.productSpec,
    price: item.specPrice,
    num: item.num
  }))
  
  sessionStorage.setItem('checkoutItems', JSON.stringify(checkoutItems))
  router.push('/checkout')
}

// 计算选中商品总数量
const totalNum = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.num, 0)
})

// 计算选中商品总金额
const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.allPrice, 0)
})

const goHome = () => {
  router.push('/home')
}

// 点击商品进入详情页
const goToDetail = (row) => {
  if (row.productId) {
    // 将商品规格信息通过 query 参数传递给详情页
    router.push({ 
      name: 'shopDetailed', 
      params: { id: row.productId },
      query: { 
        color: row.color,
        spec: row.productSpec
      }
    })
  }
}

// 搜索购物车商品
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    // 如果搜索词为空，重新加载所有购物车数据
    loadCartData()
    return
  }
  
  loading.value = true
  try {
    const res = await selectCartByName(searchKeyword.value)
    if (res.success && res.data) {
      // res.data 是购物车记录的 ID 集合 (List<Long>)
      const matchedCartIds = res.data
      
      // 因为我们需要展示完整的商品信息，但搜索接口只返回了购物车 ID 集合
      // 这里的处理策略是：先获取全部购物车数据，然后在前端过滤出匹配的购物车记录
      const allCartRes = await getMyCart()
      if (allCartRes.success && allCartRes.data) {
        cartList.value = allCartRes.data.filter(item => matchedCartIds.includes(item.id))
      }
    } else {
      ElMessage.error(res.message || '搜索失败')
    }
  } catch (error) {
    console.error('搜索异常:', error)
    ElMessage.error('搜索异常，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCartData()
})
</script>

<template>
  <div class="cart-container">
    <!-- 顶部导航 -->
    <header class="cart-header">
      <div class="header-inner">
        <div class="logo-area" @click="goHome">
          <div class="logo-main">拼少少</div>
          <div class="logo-title">购物车</div>
        </div>
        <div class="search-area">
          <div class="search-box">
            <input 
              type="text" 
              class="search-input" 
              placeholder="搜索购物车中的商品" 
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
        </div>
      </div>
    </header>

    <main class="cart-main">
      <div class="main-inner">
        <div class="cart-title-bar">
          <span class="title">全部商品 <span class="count">{{ cartList.length }}</span></span>
        </div>

        <!-- 购物车列表 -->
        <div class="cart-content" v-loading="loading">
          <template v-if="cartList.length > 0">
            <el-table 
              :data="cartList" 
              style="width: 100%" 
              @selection-change="handleSelectionChange"
              :header-cell-style="{ background: '#f5f5f5', color: '#333', fontWeight: 'bold' }"
            >
              <el-table-column type="selection" width="55" align="center" />
              
              <el-table-column label="商品信息" min-width="400">
                <template #default="{ row }">
                  <div class="product-info" @click="goToDetail(row)" style="cursor: pointer;">
                    <el-image :src="row.mainImage" fit="cover" class="product-img" />
                    <div class="product-desc">
                      <div class="p-name hover-color">{{ row.productName }}</div>
                      <div class="p-spec">
                        <span class="spec-tag" v-if="row.color">{{ row.color }}</span>
                        <span class="spec-tag" v-if="row.productSpec">{{ row.productSpec }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="单价" width="150" align="center">
                <template #default="{ row }">
                  <span class="price">¥{{ Number(row.specPrice).toFixed(2) }}</span>
                </template>
              </el-table-column>
              
              <el-table-column label="数量" width="200" align="center">
                <template #default="{ row }">
                  <el-input-number 
                    v-model="row.num" 
                    :min="1" 
                    :max="999" 
                    size="small" 
                    @change="handleNumChange(row)" 
                  />
                </template>
              </el-table-column>
              
              <el-table-column label="金额" width="150" align="center">
                <template #default="{ row }">
                  <span class="subtotal">¥{{ Number(row.allPrice).toFixed(2) }}</span>
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                  <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 底部结算栏 -->
            <div class="cart-footer">
              <div class="footer-left">
                <el-button link @click="handleBatchDelete">删除选中的商品</el-button>
              </div>
              <div class="footer-right">
                <div class="summary">
                  <span class="summary-text">已选商品 <span class="highlight">{{ totalNum }}</span> 件</span>
                  <span class="summary-text">合计（不含运费）：</span>
                  <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
                </div>
                <button 
                  class="checkout-btn" 
                  :class="{ 'disabled': selectedItems.length === 0 }"
                  @click="handleCheckout"
                >
                  结 算
                </button>
              </div>
            </div>
          </template>

          <!-- 购物车为空 -->
          <div v-else class="empty-cart">
            <el-empty description="您的购物车还是空的，赶紧行动吧！">
              <template #image>
                <el-icon :size="80" color="#ccc"><ShoppingCartFull /></el-icon>
              </template>
              <el-button type="primary" @click="goHome" class="go-shop-btn">去逛逛</el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.cart-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

.header-inner, .main-inner {
  width: 1200px;
  margin: 0 auto;
}

/* 顶部导航 */
.cart-header {
  background-color: #fff;
  padding: 20px 0;
  border-bottom: 2px solid #ff5000;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: flex-end;
  cursor: pointer;
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

.search-box {
  display: flex;
  align-items: center;
  border: 2px solid #ff5000;
  height: 36px;
  width: 400px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 15px;
  font-size: 14px;
}

.search-btn {
  background-color: #ff5000;
  color: #fff;
  border: none;
  width: 80px;
  height: 100%;
  font-size: 16px;
  cursor: pointer;
}

/* 主体区域 */
.cart-main {
  padding: 20px 0 60px;
}

.cart-title-bar {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #ff5000;
}

.cart-title-bar .count {
  font-size: 14px;
  color: #ff5000;
  margin-left: 5px;
}

.cart-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

/* 商品信息列 */
.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.product-desc {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 80px;
  padding: 2px 0;
}

.p-name {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.2s;
}

.product-info:hover .hover-color {
  color: #ff5000;
  text-decoration: underline;
}

.p-spec {
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

.price {
  font-size: 14px;
  color: #333;
  font-weight: bold;
}

.subtotal {
  font-size: 14px;
  color: #ff5000;
  font-weight: bold;
}

/* 底部结算栏 */
.cart-footer {
  margin-top: 20px;
  height: 60px;
  background-color: #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  border-radius: 0 0 8px 8px;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
  height: 100%;
}

.summary {
  display: flex;
  align-items: baseline;
  margin-right: 20px;
}

.summary-text {
  font-size: 14px;
  color: #333;
  margin-left: 15px;
}

.highlight {
  color: #ff5000;
  font-size: 18px;
  font-weight: bold;
  margin: 0 4px;
}

.total-price {
  color: #ff5000;
  font-size: 24px;
  font-weight: bold;
  margin-left: 5px;
}

.checkout-btn {
  height: 100%;
  width: 120px;
  background-color: #ff5000;
  color: #fff;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checkout-btn:hover:not(.disabled) {
  background-color: #f04b00;
}

.checkout-btn.disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}

/* 空购物车 */
.empty-cart {
  padding: 60px 0;
}

.go-shop-btn {
  background-color: #ff5000;
  border-color: #ff5000;
  margin-top: 20px;
}

.go-shop-btn:hover {
  background-color: #f04b00;
  border-color: #f04b00;
}
</style>