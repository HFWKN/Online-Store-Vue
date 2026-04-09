import request from '@/utils/request'

// 获取秒杀商品库存规格列表
export const getStockSpecList = (data) => {
  return request({
    url: '/seckill/getStockSpecList',
    method: 'post',
    data
  })
}