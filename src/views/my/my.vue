<template>
  <div class="my-container">
    <div class="my-inner">
      <!-- 左侧菜单 -->
      <aside class="my-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="my-menu"
          router
        >
          <el-menu-item-group title="个人信息">
            <el-menu-item index="/my/info">个人信息</el-menu-item>
            <el-menu-item index="/my/address">收货地址</el-menu-item>
          </el-menu-item-group>
          
          <el-menu-item-group title="购物信息">
            <el-menu-item index="/my/favorite">我的收藏</el-menu-item>
            <el-menu-item index="/my/cart">购物车</el-menu-item>
          </el-menu-item-group>
          
          <el-menu-item-group title="订单信息">
            <el-menu-item index="/my/order">我的订单</el-menu-item>
            <el-menu-item index="/my/seckill">我的秒杀</el-menu-item>
          </el-menu-item-group>
        </el-menu>
      </aside>

      <!-- 右侧内容 -->
      <main class="my-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => {
  return route.path
})
</script>

<style scoped>
.my-container {
  background-color: #f5f5f5;
  min-height: calc(100vh - 36px); /* 减去顶部导航高度 */
  padding: 20px 0;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

.my-inner {
  width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
}

.my-sidebar {
  width: 200px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  height: fit-content;
}

.my-menu {
  border-right: none;
}

.my-content {
  flex: 1;
  /* background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); */
  min-height: 600px;
  /* overflow: hidden; */
}

/* 覆盖 el-menu-item-group 标题样式 */
:deep(.el-menu-item-group__title) {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  padding-top: 15px;
}

/* 覆盖激活状态样式 */
:deep(.el-menu-item.is-active) {
  color: #ff5000;
  background-color: #fff2e8;
  border-right: 3px solid #ff5000;
}
</style>
