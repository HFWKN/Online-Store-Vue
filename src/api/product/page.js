import request from "@/utils/request"


// 分页条件查询商品信息
export const pageList = (params) => {
  return request({
    url: '/product/page', // 请根据实际后端Controller上的@RequestMapping进行调整，例如 '/product/page'
    method: 'get',
    params
  })
}