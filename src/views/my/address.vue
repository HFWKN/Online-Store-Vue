<template>
  <div class="address-container">
    <div class="header">
      <h2>收货地址管理</h2>
      <el-button type="primary" @click="openAddDialog">新增地址</el-button>
    </div>

    <div class="content-wrapper" v-loading="loading">
      <el-empty v-if="!loading && addressList.length === 0" description="暂无收货地址，请点击右上角新增" />
      
      <div v-else class="address-list">
        <el-card v-for="item in addressList" :key="item.id" class="address-card" shadow="hover">
          <div class="address-info">
            <div class="address-detail">
              <span class="text">{{ item.address }}</span>
              <el-tag size="small" type="success" v-if="item.isDefault === 1" class="default-tag">默认地址</el-tag>
            </div>
            <div class="address-actions">
              <el-button 
                v-if="item.isDefault !== 1" 
                type="primary" 
                link 
                size="small" 
                @click="setDefault(item.id)"
              >
                设为默认
              </el-button>
              <el-button 
                type="primary" 
                link 
                size="small" 
                @click="openEditDialog(item)"
              >
                修改
              </el-button>
              <el-button 
                type="danger" 
                link 
                size="small" 
                @click="handleDelete(item.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 新增/修改地址对话框 -->
    <el-dialog v-model="showAddDialog" :title="dialogTitle" width="500px">
      <el-form :model="addForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="详细地址" prop="address">
          <el-input 
            v-model="addForm.address" 
            type="textarea" 
            rows="3" 
            placeholder="请输入详细的收货地址" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="submitAdd" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { selectAddress, addAddress, updateDefaultAddress, deleteAddress, updateAddress } from '@/api/user/address'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const addressList = ref([])

// 对话框及表单相关
const showAddDialog = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const isEdit = ref(false) // 标记当前是否为修改模式
const currentEditId = ref(null) // 记录当前正在修改的地址ID

const dialogTitle = computed(() => isEdit.value ? '修改收货地址' : '新增收货地址')

const addForm = ref({
  address: ''
})

const rules = {
  address: [
    { required: true, message: '详细地址不能为空', trigger: 'blur' },
    { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
  ]
}

// 打开新增对话框
const openAddDialog = () => {
  isEdit.value = false
  currentEditId.value = null
  addForm.value.address = ''
  showAddDialog.value = true
}

// 打开修改对话框
const openEditDialog = (item) => {
  isEdit.value = true
  currentEditId.value = item.id
  addForm.value.address = item.address
  showAddDialog.value = true
}

// 获取地址列表
const loadAddresses = async () => {
  loading.value = true
  try {
    const res = await selectAddress()
    if (res.success) {
      addressList.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取收货地址失败')
    }
  } catch (error) {
    console.error('获取收货地址异常:', error)
    ElMessage.error('网络异常，获取地址失败')
  } finally {
    loading.value = false
  }
}

// 设为默认地址
const setDefault = async (id) => {
  try {
    const res = await updateDefaultAddress(id)
    if (res.success) {
      ElMessage.success('设置默认地址成功')
      // 重新加载列表以更新状态
      loadAddresses()
    } else {
      ElMessage.error(res.message || '设置默认地址失败')
    }
  } catch (error) {
    console.error('设置默认地址异常:', error)
    ElMessage.error('网络异常，设置失败')
  }
}

// 删除地址
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该收货地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteAddress(id)
    if (res.success) {
      ElMessage.success('删除成功')
      loadAddresses()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除地址异常:', error)
      ElMessage.error('网络异常，删除失败')
    }
  }
}

// 提交新增/修改地址
const submitAdd = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        let res;
        if (isEdit.value) {
          // 修改模式
          res = await updateAddress({
            id: currentEditId.value,
            address: addForm.value.address
          })
        } else {
          // 新增模式
          res = await addAddress({
            address: addForm.value.address
          })
        }
        
        if (res.success) {
          ElMessage.success(isEdit.value ? '修改地址成功' : '新增地址成功')
          showAddDialog.value = false
          // 清空表单
          addForm.value.address = ''
          currentEditId.value = null
          // 重新加载列表
          loadAddresses()
        } else {
          ElMessage.error(res.message || (isEdit.value ? '修改地址失败' : '新增地址失败'))
        }
      } catch (error) {
        console.error(isEdit.value ? '修改地址异常:' : '新增地址异常:', error)
        ElMessage.error(`网络异常，${isEdit.value ? '修改' : '新增'}地址失败`)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.address-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  min-height: 600px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 500;
}

.content-wrapper {
  min-height: 300px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-card {
  transition: all 0.3s;
}

.address-card:hover {
  border-color: #ff5000;
}

.address-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-detail {
  display: flex;
  align-items: center;
  gap: 10px;
}

.address-actions {
  display: flex;
  align-items: center;
}

.default-tag {
  flex-shrink: 0;
}

.text {
  font-size: 15px;
  color: #333;
  line-height: 1.5;
}
</style>
