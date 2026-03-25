import request from "@/utils/request"

// 加入购物车
export const addToCart = (data) => {
  return request({
    url: '/cart/addCart', 
    method: 'post',
    data
  })
}
