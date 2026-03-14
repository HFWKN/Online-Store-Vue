import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// 1. 引入 Element Plus
import ElementPlus from 'element-plus'
// 2. 引入样式 (重要！不然没有样式)
import 'element-plus/dist/index.css'
// 3. 引入图标 (可选)
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 3. 引入中文语言包 (可选)
import zhCn from 'element-plus/es/locale/lang/zh-cn' 

// 创建 Vue 实例
const app = createApp(App)

// 4. 注册组件库
app.use(ElementPlus)
// 5. 注册所有图标 (全局可用)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 4. 使用 Element Plus 并传入 language 配置
app.use(ElementPlus, {
  locale: zhCn, // 设置语言为中文
})

// 创建 Pinia 实例
app.use(createPinia())
// 使用路由
app.use(router)

app.mount('#app')
