<template>
<div class="all">
  <el-dialog v-model="dialogFormVisible" 
    :title="dialogTitle" 
    width="500"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false" 
  >
    <el-form 
      ref="registerFormRef"
      :model="RegisterDto" 
      :rules="rules"
      label-width="auto" 
      style="max-width: 600px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="RegisterDto.username" placeholder="请输入用户名 (3-20个字符，字母、数字和下划线)" />
      </el-form-item>   
      <el-form-item label="密码" prop="password">
        <el-input v-model="RegisterDto.password" type="password" placeholder="请输入密码 (6-20个字符)" show-password />
      </el-form-item>  
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="RegisterDto.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
      </el-form-item>  
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="RegisterDto.email" placeholder="请输入邮箱 (选填)" />
      </el-form-item>  
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <div class="all2">
          <span>已有账号？</span>
          <router-link to="/login" class="login-link">去登录</router-link>
        </div>
        <el-button @click="quxiao">清空</el-button>
        <el-button type="primary" @click="tijiao" :loading="loading">注册</el-button>
      </div>
    </template>
  </el-dialog>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RegisterApi } from "@/api/login.js"
import { ElMessage } from 'element-plus'
import router from "../../router"

const dialogFormVisible = ref(false)
const dialogTitle = ref('注册账户')
const registerFormRef = ref(null)
const loading = ref(false)

const RegisterDto = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

onMounted(() => {
  dialogFormVisible.value = true
})

// 自定义确认密码校验
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== RegisterDto.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

// 自定义邮箱校验 (允许为空)
const validateEmail = (rule, value, callback) => {
  if (value === '' || value === null || value === undefined) {
    callback()
  } else {
    const emailReg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    if (emailReg.test(value)) {
      callback()
    } else {
      callback(new Error('邮箱格式不正确'))
    }
  }
}

// 表单校验规则
const rules = ref({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  email: [
    { validator: validateEmail, trigger: 'blur' }
  ]
})

// 提交按钮
const tijiao = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await RegisterApi(RegisterDto.value)
        if (result.success || result.code === 200 || result.code === 0) { // 兼容不同后端的成功状态
          ElMessage.success(result.message || '注册成功')
          // 注册成功后跳转到登录页
          router.push('/login')
        } else {
          ElMessage.error(result.message || '注册失败')
        }
      } catch (error) {
        console.error('注册异常:', error)
        // 异常处理在request.js拦截器中可能已经有了提示，这里可以根据需要保留
        if (error.response && error.response.data && error.response.data.message) {
            ElMessage.error(error.response.data.message);
        } else {
            ElMessage.error('注册异常，请稍后再试');
        }
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单校验失败')
      return false
    }
  })
}

const quxiao = () => {
  if (registerFormRef.value) {
    registerFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.all {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5; /* 可选：加个背景色让弹窗更明显 */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.all2 {
  margin-right: auto; /* 让文字链接靠左，按钮靠右 */
  font-size: 14px;
}

.login-link {
  color: #409EFF;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
