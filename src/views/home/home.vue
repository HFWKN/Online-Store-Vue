<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pageList } from '@/api/product/page.js'
import { categoryList } from '@/api/product/productCategory.js'
import { Picture, ShoppingCart } from '@element-plus/icons-vue'

import banner1 from '@/image/Design006_CwCkwTBK7m.jpg'
import banner2 from '@/image/OIP-C (1).webp'
import banner3 from '@/image/OIP-C.webp'
import seckillImage from '@/image/780.jpg'

const router = useRouter()

// 状态管理
const productList = ref([])
const loading = ref(true)
const 当前页码 = ref(1)
const 每页条数 = ref(24) // 调整为24条，配合一行6个商品，正好4行
const 总数 = ref(0)
const currentCategoryId = ref(null) // 记录当前选中的分类ID
const searchKeyword = ref('') // 搜索关键词

// 分类数据
const categories = ref([])

// 轮播图数据
const bannerImages = ref([
  banner1,
  banner2,
  banner3
])

// 数据拉取方法
const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: 当前页码.value,
      pageSize: 每页条数.value,
      categoryId: currentCategoryId.value, // 加入分类ID参数
      productName: searchKeyword.value // 加入搜索关键词参数
    }
    const res = await pageList(params)
    if (res.success && res.data) {
      productList.value = res.data.list || []
      总数.value = Number(res.data.total || 0)
    } else {
      console.error('获取商品列表失败:', res.message)
    }
  } catch (error) {
    console.error('获取商品列表异常:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await categoryList()
    if (res.success && res.data) {
      // 原始数据是扁平的 [{name: '手机'}, ...]
      // 为了达到淘宝分类那样一行多个的效果，我们将其分组，每组3-4个
      const rawList = res.data || []
      const grouped = []
      for (let i = 0; i < rawList.length; i += 3) {
        const chunk = rawList.slice(i, i + 3)
        grouped.push({
          id: chunk[0].id,
          originalItems: chunk
        })
      }
      categories.value = grouped
    } else {
      console.error('获取分类列表失败:', res.message)
    }
  } catch (error) {
    console.error('获取分类列表异常:', error)
  }
}

const handleCategoryClick = (categoryId) => {
  // 如果点击的是当前已选中的分类，则取消选中（展示全部）；否则选中该分类
  currentCategoryId.value = currentCategoryId.value === categoryId ? null : categoryId
  当前页码.value = 1 // 切换分类时重置页码到第一页
  loadProducts()
}

const handleSearch = () => {
  当前页码.value = 1 // 搜索时重置页码到第一页
  loadProducts()
}

const handleHotSearch = (keyword) => {
  searchKeyword.value = keyword
  handleSearch()
}

const onCurrentChange = (value) => {
  当前页码.value = value
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToDetail = (id) => {
  router.push({ name: 'shopDetailed', params: { id } })
}

const goToCart = () => {
  router.push({ name: 'cart' })
}

const goToSeckill = () => {
  router.push({ name: 'seckill' })
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<template>
  <div class="taobao-container">
    <!-- 顶部搜索栏 -->
    <header class="tb-header">
      <div class="header-inner">
        <div class="logo-area">
          <div class="logo-main">拼少少</div>
          <div class="logo-sub">
            <span class="logo-domain">Pinshaoshao.com</span>
            <span class="logo-tag">热卖<br/>商品</span>
          </div>
        </div>
        
        <div class="search-area">
          <div class="search-box">
            <div class="search-type">宝贝 <span class="divider">|</span></div>
            <input 
              type="text" 
              class="search-input" 
              placeholder="搜索商品" 
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
          <div class="search-hot-links">
            <a href="javascript:void(0)" @click.prevent="handleHotSearch('2026新款相机')">2026新款相机</a>
            <a href="javascript:void(0)" @click.prevent="handleHotSearch('智能洗衣机')">智能洗衣机</a>
            <a href="javascript:void(0)" @click.prevent="handleHotSearch('美的空调')">美的空调</a>
            <a href="javascript:void(0)" @click.prevent="handleHotSearch('无线蓝牙耳机')">无线蓝牙耳机</a>
            <a href="javascript:void(0)" @click.prevent="handleHotSearch('尼康Nikon')">尼康Nikon</a>
          </div>
        </div>
        
        <div class="cart-area">
          <el-button type="danger" plain class="cart-btn" @click="goToCart" style="cursor: pointer; z-index: 10;">
            <el-icon class="cart-icon"><ShoppingCart /></el-icon>
            我的购物车
          </el-button>
        </div>
      </div>
    </header>

    <!-- 首屏主要内容区 -->
    <main class="tb-main">
      <div class="main-inner">
        <!-- 左侧分类 -->
        <aside class="tb-categories">
          <h3 class="cat-title">分类</h3>
          <ul class="cat-list">
            <li v-for="(group, index) in categories" :key="index" class="cat-item">
              <span 
                v-for="(item, i) in group.originalItems" 
                :key="item.id"
                class="cat-link"
                :class="{ 'active': currentCategoryId === item.id }"
                @click="handleCategoryClick(item.id)"
              >
                {{ item.name }}<span v-if="i < group.originalItems.length - 1" class="cat-divider">/</span>
              </span>
            </li>
          </ul>
        </aside>

        <!-- 中间大图展示 -->
        <div class="tb-banner-area">
          <el-carousel height="480px" arrow="hover" trigger="click">
            <el-carousel-item v-for="(img, index) in bannerImages" :key="index">
              <el-image :src="img" fit="cover" class="banner-img" />
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 右侧秒杀专场图片 -->
        <aside class="tb-right-ads seckill-banner" @click="goToSeckill">
          <img :src="seckillImage" alt="秒杀活动专场" class="seckill-img" />
          <div class="seckill-overlay">
            点击此处进入秒杀专场
          </div>
        </aside>
      </div>
    </main>

    <!-- 猜你喜欢 商品列表 -->
    <section class="tb-recommend">
      <div class="recommend-header">
        <div class="like-title">
          <span class="heart">❤️</span>
          <h3>猜你喜欢</h3>
          <span class="sub-text">精选好物推荐</span>
        </div>
      </div>

      <div class="product-grid" v-loading="loading">
        <div class="product-item" v-for="item in productList" :key="item.id" @click="goToDetail(item.id)">
          <div class="img-wrapper">
            <!-- 这里依然可以用el-image，也可以用普通img，但为了图片懒加载和错误占位保留el-image -->
            <el-image :src="item.mainImage" fit="cover" class="p-img" lazy>
              <template #error>
                <div class="img-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="p-info">
            <div class="p-title" :title="item.name">{{ item.name }}</div>
            <div class="p-price-row">
              <span class="price"><span class="currency">¥</span>{{ Number(item.price).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空数据状态 -->
      <div v-if="!loading && productList.length === 0" class="empty-state">
        <el-empty description="暂无商品数据" />
      </div>

      <!-- 分页 -->
      <div v-if="总数 > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="当前页码"
          v-model:page-size="每页条数"
          :total="总数"
          background
          layout="prev, pager, next"
          @current-change="onCurrentChange"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 淘宝风格整体容器 */
.taobao-container {
  background-color: #fff; /* 将整个页面大背景改为纯白 */
  min-height: 100vh;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  color: #333;
}

/* 内部居中容器宽度统一 */
.header-inner, .main-inner, .tb-recommend {
  width: 1400px; /* 从1200px调整为1400px，让显示区域更宽 */
  margin: 0 auto;
}

/* --- 顶部搜索栏 --- */
.tb-header {
  background-color: #fff; /* 搜索栏区域也是纯白，与大背景融为一体 */
  padding: 30px 0;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.header-inner {
  display: flex;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  margin-right: 120px;
}

.logo-main {
  color: #ff5000;
  font-size: 40px;
  font-weight: bold;
  margin-right: 12px;
  letter-spacing: 2px;
}

.logo-sub {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-domain {
  color: #ff5000;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 2px;
}

.logo-tag {
  color: #ff5000;
  font-size: 14px;
  border-left: 1px solid #ffccb3;
  padding-left: 10px;
  margin-left: 10px;
  line-height: 1.2;
}

.logo-area {
  display: flex;
}

.search-area {
  flex: 1;
}

.search-box {
  display: flex;
  align-items: center;
  border: 2px solid #ff5000;
  border-radius: 24px;
  overflow: hidden;
  height: 44px;
  width: 700px;
}

.search-type {
  padding: 0 15px 0 20px;
  color: #ccc;
  font-size: 14px;
  background-color: #f5f5f5;
  height: 100%;
  display: flex;
  align-items: center;
}

.search-type .divider {
  margin-left: 10px;
  color: #f5f5f5;
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
  width: 90px;
  height: 100%;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.search-btn:hover {
  background-color: #f04b00;
}

.search-hot-links {
  margin-top: 10px;
  font-size: 12px;
}

.search-hot-links a {
  color: #999;
  text-decoration: none;
  margin-right: 15px;
  cursor: pointer;
}

.search-hot-links a:hover {
  color: #ff5000;
}

.cart-area {
  margin-left: 40px;
}

.cart-btn {
  height: 44px;
  font-size: 14px;
  font-weight: bold;
  border-color: #ff5000;
  color: #ff5000;
  border-radius: 22px;
  padding: 0 20px;
}

.cart-btn:hover {
  background-color: #fff2e8;
  border-color: #ff5000;
  color: #ff5000;
}

.cart-icon {
  font-size: 18px;
  margin-right: 4px;
}

/* --- 首屏主体区域 --- */
.main-inner {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

/* 左侧分类 */
.tb-categories {
  width: 260px; /* 从230px稍微加宽，适应1400px总宽 */
  background-color: #fff;
  border-radius: 12px;
  padding: 20px 0;
}

.cat-title {
  margin: 0 0 15px 20px;
  font-size: 16px;
  font-weight: bold;
}

.cat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cat-item {
  padding: 10px 20px;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* 移除整个背景的发光/变色 */
.cat-item:hover {
  background-color: transparent;
}

.cat-link {
  cursor: pointer;
  transition: color 0.2s;
}

/* 悬浮或激活时，字体变成淡橙色 */
.cat-link:hover,
.cat-link.active {
  color: #ff8c00; /* 淡橙色 */
  font-weight: normal; /* 保持字体粗细不变 */
}

.cat-divider {
  margin: 0 6px;
  color: #ccc;
}

/* 中间轮播 */
.tb-banner-area {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.banner-img {
  width: 100%;
  height: 100%;
}

/* 覆盖 Element Plus 轮播图的一些默认样式以匹配淘宝风格 */
:deep(.el-carousel__indicators--horizontal) {
  bottom: 20px;
}

:deep(.el-carousel__indicator--horizontal .el-carousel__button) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  opacity: 1;
  transition: all 0.3s;
}

:deep(.el-carousel__indicator--horizontal.is-active .el-carousel__button) {
  width: 24px;
  border-radius: 5px;
  background-color: #fff;
}

/* 右侧广告/秒杀专场 */
.tb-right-ads {
  width: 260px; /* 从240px加宽 */
  display: flex;
  flex-direction: column;
}

.seckill-banner {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 480px; /* 和中间大图保持同样高度 */
  position: relative;
}

.seckill-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.seckill-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seckill-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 80, 0, 0.9);
  color: #fff;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(255, 80, 0, 0.4);
  transition: all 0.2s;
}

.seckill-banner:hover .seckill-overlay {
  background-color: #ff5000;
  transform: translateX(-50%) scale(1.05);
}

/* --- 猜你喜欢 --- */
.tb-recommend {
  padding-bottom: 60px;
}

.recommend-header {
  margin-bottom: 25px;
}

.like-title {
  display: flex;
  align-items: center;
}

.like-title .heart {
  color: #ff5000;
  font-size: 24px;
  margin-right: 10px;
}

.like-title h3 {
  font-size: 24px;
  color: #333;
  margin: 0 12px 0 0;
  font-weight: bold;
}

.like-title .sub-text {
  font-size: 14px;
  color: #999;
  position: relative;
  top: 2px;
}

/* 商品网格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 从5列调整为6列，和淘宝一样一行展示更多商品 */
  gap: 15px;
}

.product-item {
  background-color: transparent;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent; /* 默认透明边框，防止悬浮时抖动 */
  border-radius: 12px; /* 给整个商品项（包括边框）添加圆角 */
}

.product-item:hover {
  border-color: #ff5000; /* 悬浮时变成淘宝经典的橙黄色边框 */
}

.img-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: transparent;
  overflow: hidden;
  border-radius: 8px; /* 图片本身可以带一点圆角，更美观 */
}

.p-img {
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
}

.product-item:hover .p-img {
  transform: scale(1.03);
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #eee;
}

.p-info {
  padding: 10px 8px; /* 稍微调整内边距，使其与边框的距离更协调 */
}

.p-title {
  font-size: 14px;
  color: #333;
  line-height: 20px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* 新增标准属性 */
  -webkit-box-orient: vertical;
  margin-bottom: 10px;
}

.p-price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.price {
  color: #ff5000;
  font-size: 22px;
  font-weight: bold;
}

.price .currency {
  font-size: 14px;
  margin-right: 2px;
}

.empty-state {
  padding: 60px 0;
  background: #fff;
  border-radius: 12px;
}

.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
</style>
