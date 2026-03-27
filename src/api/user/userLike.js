import request from "@/utils/request"

// 获取我的收藏列表
export const getAllUserLike = () => {
  return request({
    url: '/user/like/getAll',
    method: 'get'
  })
}

// 新增收藏
export const addUserLike = (data) => {
  return request({
    url: '/user/like/add',
    method: 'post',
    data
  })
}

// 取消收藏
export const deleteUserLike = (data) => {
  return request({
    url: '/user/like/delete',
    method: 'delete',
    data: data
  })
}

// 获取收藏状态
export const getUserLikeStatus = (data) => {
  return request({
    url: '/user/like/getStatus',
    method: 'post',
    data
  })
}

