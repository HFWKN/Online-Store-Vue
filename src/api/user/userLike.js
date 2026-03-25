import request from "@/utils/request"

// 获取我的收藏列表
export const getAllUserLike = () => {
  return request({
    url: '/user/like/getAll',
    method: 'get'
  })
}
