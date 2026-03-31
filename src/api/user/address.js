import request from '@/utils/request'

/**
 * 查询我的收货地址
 * @returns {Promise}
 */
export function selectAddress() {
  return request({
    url: '/user/address/select',
    method: 'get'
  })
}

/**
 * 新增收货地址
 * @param {Object} data 包含 address 字段的对象
 * @returns {Promise}
 */
export function addAddress(data) {
  return request({
    url: '/user/address/add',
    method: 'post',
    data: data
  })
}

/**
 * 修改收货地址
 * @param {Object} data 包含 id 和 address 字段的对象
 * @returns {Promise}
 */
export function updateAddress(data) {
  return request({
    url: '/user/address/update',
    method: 'put',
    data: data
  })
}

/**
 * 修改默认收货地址
 * @param {Long} addressId 要修改为默认地址的地址id
 * @returns {Promise}
 */
export function updateDefaultAddress(addressId) {
  return request({
    url: `/user/address/updateDefault/${addressId}`,
    method: 'put'
  })
}

/**
 * 删除收货地址(逻辑删除)
 * @param {Long} id 要删除的地址id
 * @returns {Promise}
 */
export function deleteAddress(id) {
  return request({
    url: `/user/address/delete/${id}`,
    method: 'delete'
  })
}
