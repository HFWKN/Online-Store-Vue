<script setup>
import { ref, onMounted } from 'vue'
import { pageList } from '@/api/product/page.js'
import { categoryList } from '@/api/product/productCategory.js'
import { Picture } from '@element-plus/icons-vue'

// 状态管理
const productList = ref([])
const loading = ref(true)
const 当前页码 = ref(1)
const 每页条数 = ref(20) // 调整为更适合展示的条数，每行5个，4行=20个
const 总数 = ref(0)
const currentCategoryId = ref(null) // 记录当前选中的分类ID

// 分类数据
const categories = ref([])

// 模拟右侧推荐数据
const rightBanners = ref([
  { title: '品质家居', sub: '超值优惠', color: '#ff6b6b' },
  { title: '精致美妆', sub: '品质之选', color: '#f06292' },
  { title: '品质五金', sub: '超值特惠', color: '#ff9800' },
  { title: '超值百货', sub: '省钱省心', color: '#4fc3f7' }
])

// 数据拉取方法
const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: 当前页码.value,
      pageSize: 每页条数.value,
      categoryId: currentCategoryId.value // 加入分类ID参数
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

const onCurrentChange = (value) => {
  当前页码.value = value
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
          <div class="logo-main">淘宝</div>
          <div class="logo-sub">
            <span class="logo-domain">Taobao.com</span>
            <span class="logo-tag">热卖<br/>商品</span>
          </div>
        </div>
        
        <div class="search-area">
          <div class="search-box">
            <div class="search-type">宝贝 <span class="divider">|</span></div>
            <input type="text" class="search-input" placeholder="手工材料包" />
            <button class="search-btn">搜索</button>
          </div>
          <div class="search-hot-links">
            <a href="#">儿童diy手工沙画</a>
            <a href="#">沙石画</a>
            <a href="#">美容仪器</a>
            <a href="#">木鱼预</a>
            <a href="#">儿童彩色沙画</a>
          </div>
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
          <div class="banner-card">
            <div class="banner-text">
              <h2>春回暖<br/>衣上新</h2>
              <p>新装上架 一键焕新</p>
            </div>
            <div class="banner-dots">
              <span class="dot active"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- 右侧推荐卡片 -->
        <aside class="tb-right-ads">
          <div 
            v-for="(ad, index) in rightBanners" 
            :key="index" 
            class="ad-card"
            :style="{ borderLeftColor: ad.color }"
          >
            <div class="ad-info">
              <h4>{{ ad.title }}</h4>
              <p>{{ ad.sub }}</p>
            </div>
            <div class="ad-pic" :style="{ backgroundColor: ad.color + '22' }"></div>
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
        <div class="product-item" v-for="item in productList" :key="item.id">
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
            <div class="p-tags">
              <span v-if="item.companyName" class="tag-company">{{ item.companyName }}</span>
              <span v-else class="tag-hot">热卖</span>
            </div>
            <div class="p-price-row">
              <span class="price"><span class="currency">¥</span>{{ Number(item.price).toFixed(2) }}</span>
              <span class="sales">0人付款</span>
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
  background-color: #f4f4f4;
  min-height: 100vh;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  color: #333;
}

/* 内部居中容器宽度统一 */
.header-inner, .main-inner, .tb-recommend {
  width: 1200px;
  margin: 0 auto;
}

/* --- 顶部搜索栏 --- */
.tb-header {
  background-color: #fff;
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
  color: #666;
  font-size: 14px;
  background-color: #f5f5f5;
  height: 100%;
  display: flex;
  align-items: center;
}

.search-type .divider {
  margin-left: 10px;
  color: #ccc;
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
}

.search-hot-links a:hover {
  color: #ff5000;
}

/* --- 首屏主体区域 --- */
.main-inner {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

/* 左侧分类 */
.tb-categories {
  width: 230px;
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

.cat-item:hover {
  background-color: #fff0e8;
}

.cat-link {
  cursor: pointer;
  transition: color 0.2s;
}

.cat-link:hover {
  color: #ff5000;
}

.cat-link.active {
  color: #ff5000;
  font-weight: bold;
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

.banner-card {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  display: flex;
  align-items: center;
  padding: 50px;
  color: #fff;
  box-sizing: border-box;
}

.banner-text h2 {
  font-size: 42px;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.banner-text p {
  font-size: 20px;
  margin: 0;
  opacity: 0.9;
}

.banner-dots {
  position: absolute;
  bottom: 25px;
  left: 50px;
  display: flex;
  gap: 8px;
}

.banner-dots .dot {
  width: 10px;
  height: 10px;
  background-color: rgba(255,255,255,0.4);
  border-radius: 50%;
  cursor: pointer;
}

.banner-dots .dot.active {
  background-color: #fff;
  width: 24px;
  border-radius: 5px;
}

/* 右侧广告 */
.tb-right-ads {
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ad-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #ccc;
  flex: 1;
}

.ad-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.ad-info h4 {
  margin: 0 0 6px 0;
  font-size: 16px;
  color: #333;
}

.ad-info p {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.ad-pic {
  width: 56px;
  height: 56px;
  border-radius: 8px;
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
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}

.product-item {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.product-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
  border-color: #ff5000;
}

.img-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #f9f9f9;
  overflow: hidden;
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
  padding: 14px;
}

.p-title {
  font-size: 14px;
  color: #333;
  line-height: 20px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 10px;
}

.p-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  height: 20px;
  overflow: hidden;
}

.tag-company {
  font-size: 12px;
  color: #ff5000;
  background-color: #ffe4d0;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.tag-hot {
  font-size: 12px;
  color: #fff;
  background-color: #ff5000;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
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

.sales {
  font-size: 12px;
  color: #999;
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