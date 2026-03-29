import request from "@/utils/request"

// 加入购物车
export const addToCart = (data) => {
  return request({
    url: '/cart/addCart', 
    method: 'post',
    data
  })
}

// 查询我的购物车
export const getMyCart = () => {
  return request({
    url: '/cart/selectAllByCart',
    method: 'post'
  })
}

// 批量删除购物车中的商品
export const deleteCart = (ids) => {
  return request({
    url: '/cart/deleteCart',
    method: 'post',
    data: ids
  })
}

// 根据商品名称查询购物车
export const selectCartByName = (name) => {
  return request({
    url: '/cart/selectByName',
    method: 'get',
    params: { name }
  })
}
