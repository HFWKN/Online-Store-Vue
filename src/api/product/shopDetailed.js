import request from "@/utils/request"

// 获取该商品详细信息及评论
export const getProductDetailed = (productId) => {
  return request({
    url: `/product/detailed/${productId}`,
    method: 'get'
  })
}

// 查询该商品的全部规格
export const getProductSpec = (productId) => {
  return request({
    url: `/product/spec/${productId}`, // 如果后端有特定的前缀，请修改这里，例如 /productSpec/${productId}
    method: 'get'
  })
}
