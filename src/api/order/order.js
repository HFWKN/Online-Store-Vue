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

/**
 * 查询当前用户的所有订单明细
 * @param {Object} params 包含 status, productName 的对象
 * @returns {Promise}
 */
export function getAllOrderItems(params) {
  return request({
    url: '/order/orderItem',
    method: 'get',
    params
  })
}

/**
 * 轮询获取订单消息
 * @param {Object} params 包含 lastTime, lastId, limit 的对象
 * @returns {Promise}
 */
export function getOrderMessages(params) {
  return request({
    url: '/order/message/getByUserId',
    method: 'get',
    params
  })
}

/**
 * 获取所有历史订单消息
 * @returns {Promise}
 */
export function getAllOrderMessages() {
  return request({
    url: '/order/message/getAll',
    method: 'get'
  })
}
