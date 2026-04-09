import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(), // 注释或删除这行以关闭底部开发者工具
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 配置反向代理
  server: {
     // 👇 1. 添加这一行，允许外部网络访问
    host: true,
    // 👇 1. 允许特定的域名访问（解决 Blocked request 报错）
    allowedHosts: [
      'liubingqi.us.ci' ,
      'store-lbq.cc.cd'
    ],
    proxy: {
      '/api': { // 如果前端请求的路径是/api
        target: 'http://localhost:10010', // 那么就把请求交给此服务器
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // 并抹除/api，因为有"/api"就代表是连接服务器的请求
      }
    }
  }
})
