<script setup>
import { ref, onMounted } from 'vue'
import { pageList } from '@/api/product/page.js'
import { Picture } from '@element-plus/icons-vue'

// 状态管理
const productList = ref([])
const loading = ref(true)

// 数据拉取方法
const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: 1,
      pageSize: 20
    }
    const res = await pageList(params)
    // 根据提供的后端统一返回结构：res = { success: true, data: { list: [...] } }
    if (res.success && res.data) {
      productList.value = res.data.list || []
    } else {
      console.error('获取商品列表失败:', res.message)
    }
  } catch (error) {
    console.error('获取商品列表异常:', error)
  } finally {
    loading.value = false
  }
}

// 页面挂载时拉取数据
onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="home-container">
    <!-- 头部标题区 -->
    <div class="header-section">
      <h2 class="title">发现好物</h2>
      <p class="subtitle">精选商品，品质生活</p>
    </div>

    <!-- 商品列表展示区域 -->
    <div class="product-list-wrapper" v-loading="loading">
      <el-row :gutter="20">
        <el-col
          v-for="item in productList"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
          class="product-col"
        >
          <el-card class="product-card" shadow="hover" :body-style="{ padding: '0px' }">
            <!-- 商品图片 -->
            <div class="image-wrapper">
              <el-image :src="item.mainImage" fit="cover" class="product-image" lazy>
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            
            <!-- 商品信息 -->
            <div class="product-info">
              <h3 class="product-name" :title="item.name">{{ item.name }}</h3>
              <p class="product-subtitle" :title="item.subTitle">{{ item.subTitle || '暂无简介' }}</p>
              
              <div class="product-footer">
                <div class="price-wrapper">
                  <span class="currency">¥</span>
                  <span class="price">{{ Number(item.price).toFixed(2) }}</span>
                </div>
                <el-tag 
                  v-if="item.companyName" 
                  size="small" 
                  type="info" 
                  effect="plain" 
                  class="company-tag"
                  :title="item.companyName"
                >
                  {{ item.companyName }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 空数据状态 -->
      <el-empty v-if="!loading && productList.length === 0" description="暂无商品数据" />
    </div>
  </div>
</template>

<style scoped>
/* 页面整体容器 */
.home-container {
  padding: 30px 40px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 头部标题区 */
.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 28px;
  color: #303133;
  margin: 0 0 10px 0;
  font-weight: 600;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
  letter-spacing: 1px;
}

/* 列表包装器 */
.product-list-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

.product-col {
  margin-bottom: 24px;
}

/* 卡片样式 */
.product-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  cursor: pointer;
  background-color: #fff;
}

/* 悬停动画 */
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
}

/* 图片区域 */
.image-wrapper {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 40px;
}

/* 详情区域 */
.product-info {
  padding: 16px;
}

/* 标题样式 */
.product-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 副标题样式 */
.product-subtitle {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 18px; /* 保证高度一致，防抖动 */
}

/* 底部区域（价格和标签） */
.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.price-wrapper {
  color: #f56c6c;
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 14px;
  margin-right: 2px;
  font-weight: bold;
}

.price {
  font-size: 22px;
  font-weight: bold;
}

.company-tag {
  max-width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
