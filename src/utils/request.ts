import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // API 基础路径
  timeout: 60000, // 请求超时时间（60秒）
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取用户信息
    const loginUser = localStorage.getItem('loginUser')
    if (loginUser) {
      try {
        const user = JSON.parse(loginUser)
        // 如果存在 token，添加到请求头 (根据后端返回的数据结构适配 accessToken)
        if (user.accessToken) {
          config.headers['token'] = user.accessToken
          config.headers['Authorization'] = user.tokenType ? `${user.tokenType} ${user.accessToken}` : `Bearer ${user.accessToken}`
        } else if (user.token) {
          config.headers['token'] = user.token
        }
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data
  },
  (error) => {
    // 处理响应错误
    if (error.response) {
      const { status, data, config } = error.response
      const msg = data?.message || data?.msg || ''
      
      if (status === 401) {
        // 白名单接口允许 401 不跳转不报错
        const whiteListUrls = [
          '/product/category/list',
          '/product/page',
          '/product/list'
        ]
        const isWhiteListedApi = whiteListUrls.some(url => config.url && config.url.includes(url))
        
        if (isWhiteListedApi) {
          // 如果是白名单接口返回401，我们直接返回一个假的成功响应或者拦截错误，不触发跳转
          // 但由于后端拦截器可能强制阻断了，我们需要在后端放行这些接口。
          // 暂时前端静默处理，不弹窗，不跳转
          return Promise.resolve({ success: false, message: '未登录但允许访问' })
        }

        // 未授权，清除本地用户信息并跳转登录页
        localStorage.removeItem('loginUser')
        ElMessage.error(msg || '登录超时，请重新登录')
        router.push('/login')
      } else if (status === 403) {
        ElMessage.error(msg || '没有权限访问')
      } else if (status === 404) {
        ElMessage.error(msg || '请求的资源不存在')
      } else if (status === 500) {
        ElMessage.error(msg || '服务器错误')
      } else {
        ElMessage.error(msg || '接口访问异常')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    
    return Promise.reject(error)
  },
)

export default request
