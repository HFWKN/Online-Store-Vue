import request from '@/utils/request'

/**
 * 获取下单 token，防止重复提交
 * @returns {Promise}
 */
export function getToken() {
  return request({
    url: '/order/getToken',
    method: 'post'
  })
}

/**
 * 提交订单
 * @param {Object} data CreateOrderDto
 * @param {String} token 订单唯一标识 token
 * @returns {Promise}
 */
export function createOrder(data, token) {
  return request({
    url: '/order/userPlaceAnOrder',
    method: 'post',
    data: data,
    headers: {
      'X-Order-Token': token
    }
  })
}
