<template>
  <div class="historical-information-container">
    <div class="header">
      <h2>历史消息通知</h2>
    </div>

    <div class="content-wrapper" v-loading="loading">
      <div v-if="messages.length > 0" class="message-list">
        <el-timeline>
          <el-timeline-item
            v-for="msg in messages"
            :key="msg.id"
            :timestamp="formatDate(msg.createTime)"
            placement="top"
            type="primary"
          >
            <el-card class="message-card">
              <div class="msg-header">
                <span class="product-name">{{ msg.productName }}</span>
                <span class="spec-name">[{{ msg.specName }}]</span>
              </div>
              <div class="msg-content">
                {{ msg.content }}
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div v-else class="empty-state">
        <el-empty description="暂无历史消息记录" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllOrderMessages } from '@/api/order/order.js'
import { ElMessage } from 'element-plus'

const loading = ref(true)
const messages = ref([])

const fetchHistoricalMessages = async () => {
  loading.value = true
  try {
    const res = await getAllOrderMessages()
    if (res.success) {
      messages.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取历史消息失败')
    }
  } catch (error) {
    console.error('获取历史消息异常:', error)
    ElMessage.error('网络异常，获取历史消息失败')
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}

onMounted(() => {
  fetchHistoricalMessages()
})
</script>

<style scoped>
.historical-information-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  min-height: calc(100vh - 150px);
}

.header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
  margin-bottom: 30px;
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.content-wrapper {
  min-height: 300px;
}

.message-list {
  padding: 10px 20px;
}

.message-card {
  margin-bottom: 10px;
  transition: all 0.3s;
}

.message-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.msg-header {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.spec-name {
  font-size: 14px;
  color: #909399;
}

.msg-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 4px;
}

.empty-state {
  padding: 60px 0;
}
</style>
