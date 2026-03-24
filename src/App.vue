<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import TopNav from '@/components/TopNav.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <el-config-provider :locale="zhCn">
    <TopNav v-if="route.path !== '/login' && route.path !== '/'" />
    <router-view></router-view>
  </el-config-provider>
</template>

<style scoped>


</style>
