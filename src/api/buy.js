import request from '@/utils/request'

// 获取秒杀商品库存规格列表
export const getStockSpecList = (data) => {
  return request({
    url: '/seckill/getStockSpecList',
    method: 'post',
    data
  })
}

// 获取秒杀下单Token
export const getSeckillToken = (data) => {
  return request({
    url: '/seckill/order/getToken',
    method: 'post',
    data
  })
}

// 提交秒杀订单
export const submitSeckillOrder = (data, token) => {
  return request({
    url: '/seckill/order',
    method: 'post',
    data,
    headers: {
      'X-SeckillOrder-Token': token
    }
  })
}