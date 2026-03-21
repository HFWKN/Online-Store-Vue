<script setup>
import { ref,onMounted } from 'vue'
import { LoginApi } from "@/api/login.js"
import { ElMessage } from 'element-plus'
import router from "../../router";

// 钩子函数
onMounted(() => {
  dialogFormVisible.value = true;

});
const dialogFormVisible = ref();
const dialogTitle = ref('登录账户');

const UserDto = ref({
    username: '',
    password: ''
})


// 提交按钮
const tijiao = async()=>{
    const result = await LoginApi(UserDto.value)
    if(result.success){
      ElMessage.success('正在登录');
      //把当前登录用户的信息储存在浏览器的localStorage中   使用json.stringify()方法将对象转为字符串保存
      localStorage.setItem('loginUser',JSON.stringify(result.data));  
      router.push('/home');
      ElMessage.success('登录成功');
    }else{
      ElMessage.error('登录失败');
    }
}

const quxiao = ()=>{
    UserDto.value.username = '';
    UserDto.value.password = '';
}

</script>
<template>
<div class="all">

   <el-dialog v-model="dialogFormVisible" 
    :title="dialogTitle" 
    width="500"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false" 
  ><!-- 点击对话框之外的区域，不会自动关闭对话框 ，并隐藏右上角关闭符号-->
            <el-form :model="UserDto" label-width="auto" style="max-width: 600px">
                    <el-form-item label="用户名">
                        <el-input v-model="UserDto.username" placeholder="请输入用户名" />
                    </el-form-item>   
                    <el-form-item label="密码">
                        <el-input v-model="UserDto.password" placeholder="请输入密码" />
                    </el-form-item>  
            </el-form>
    <template #footer>
      <div class="dialog-footer">
        <div class="all2">
           <span>无账号？</span>
    <router-link to="/login" class="login-link">注册</router-link>
    </div>
        <el-button @click="quxiao">清空</el-button>
        <el-button type="primary" @click="tijiao">提交</el-button>
        
      </div>
    </template>
  </el-dialog>




</div>

</template>

<style scoped>

  .all2{
      margin-right: 10px;
  }

</style>