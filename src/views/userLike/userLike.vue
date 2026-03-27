<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllUserLike, deleteUserLike } from '@/api/user/userLike.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const likeList = ref([])
const loading = ref(true)

// 加载收藏列表
const loadLikeList = async () => {
  loading.value = true
  try {
    const res = await getAllUserLike()
    if (res.success && res.data) {
      likeList.value = res.data
    } else {
      ElMessage.error(res.message || '获取收藏列表失败')
    }
  } catch (error) {
    console.error('获取收藏列表异常:', error)
    ElMessage.error('获取收藏列表异常')
  } finally {
    loading.value = false
  }
}

// 跳转到商品详情
const goToDetail = (productId, specId, productSpec) => {
  const query = {}
  if (specId) {
    query.specId = specId
  }
  if (productSpec) {
    query.productSpec = productSpec
  }

  router.push({
    path: `/shopDetailed/${productId}`,
    query
  })
}

// 取消收藏
const handleCancelLike = (item) => {
  console.log('准备取消收藏，当前商品项数据:', item);
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const likeDto = {
        productId: item.productId,
        categoryId: item.categoryId,
        specId: item.specId,
        productSpec: item.productSpec
      }
      console.log('发送给后端的 likeDto:', likeDto);
      const res = await deleteUserLike(likeDto)
      if (res.success) {
        ElMessage.success('已取消收藏')
        // 重新加载列表
        loadLikeList()
      } else {
        ElMessage.error(res.message || '取消收藏失败')
      }
    } catch (error) {
      console.error('取消收藏异常:', error)
      ElMessage.error('网络异常，操作失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

onMounted(() => {
  loadLikeList()
})
</script>

<template>
  <div class="user-like-container">
    <div class="header">
      <h2>我的收藏</h2>
    </div>

    <div v-loading="loading" class="content-wrapper">
      <el-empty v-if="!loading && likeList.length === 0" description="暂无收藏商品" />
      
      <div v-else class="like-grid">
        <el-card 
          v-for="item in likeList" 
          :key="item.id" 
          class="like-card" 
          shadow="hover"
          @click="goToDetail(item.productId, item.specId, item.productSpec)"
        >
          <div class="product-image-box">
            <el-image 
              :src="item.mainImage" 
              fit="cover" 
              class="product-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          
          <div class="product-info">
            <h3 class="product-name" :title="item.productName">{{ item.productName }}</h3>
            <!-- 展示颜色和规格 -->
            <p class="product-spec" v-if="item.color || item.productSpec || item.spec">
              {{ [item.color, item.productSpec ?? item.spec].filter(Boolean).join(' / ') }}
            </p>
            <p class="product-spec" v-else>默认规格</p>
            <div class="price-box">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ (item.specPrice != null ? item.specPrice : item.price)?.toFixed(2) }}</span>
            </div>
            <div class="bottom-actions">
              <div class="category-tag">
                <el-tag size="small" type="info">{{ item.categoryName }}</el-tag>
              </div>
              <el-button 
                type="danger" 
                link 
                size="small" 
                class="cancel-btn"
                @click.stop="handleCancelLike(item)"
              >
                <el-icon><Delete /></el-icon>
                取消收藏
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-like-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.content-wrapper {
  min-height: 400px;
}

.like-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.like-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}

.like-card:hover {
  transform: translateY(-5px);
}

.product-image-box {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.product-info {
  padding: 12px 0 0;
}

.product-name {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
  font-weight: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-spec {
  margin: 0 0 8px;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-box {
  color: #f56c6c;
  margin-bottom: 8px;
}

.price-symbol {
  font-size: 14px;
}

.price-value {
  font-size: 18px;
  font-weight: bold;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.cancel-btn {
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cancel-btn:hover {
  color: #f56c6c;
}
</style>
