// 导入request，这是封装好的axios类
import request from "@/utils/request"

// 登录
export const LoginApi = (UserDto) => request.post('/user/login', UserDto)

// 注册
export const RegisterApi = (RegisterDto) => request.post('/user/register', RegisterDto)