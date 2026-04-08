import request from '@/utils/request'

// 获取秒杀活动列表
export const getSeckillActivityList = () => {
  return request({
    url: '/seckill/activity/list',
    method: 'get'
  })
}

// 获取秒杀商品列表
export const getSeckillProductList = (activityId) => {
  return request({
    url: `/seckill/product/list/${activityId}`,
    method: 'get'
  })
}
