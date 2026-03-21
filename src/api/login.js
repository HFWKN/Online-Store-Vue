// 导入request，这是封装好的axios类
import request from "@/utils/request"

// 登录
export const LoginApi = (UserDto) => request.post('/auth/user/login', UserDto)