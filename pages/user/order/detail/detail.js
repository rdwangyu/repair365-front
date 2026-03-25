import BASE_URL from '../../../../utils/api'

Page({
  data: {
    order: null,
    statusText: '',
    statusColor: ''
  },

  onLoad(options) {
    const order_number = options.order_number
    this.loadOrder(order_number)
  },

  loadOrder(order_number) {
    wx.showLoading({ title: '加载中...' })

    wx.request({
      url: BASE_URL + `customer/order/${order_number}/`,
      method: 'GET',
      data: {
        // 看看token用post还是get传？？？？？  django还没有实现master和customer的查询订单详情
        token: wx.getStorageSync('userToken')
      },

      success: (res) => {
        if (res.data.errcode === 0) {
          const order = res.data.result

          const statusMap = this.getStatusMap(order.status)

          this.setData({
            order,
            statusText: statusMap.text,
            statusColor: statusMap.color
          })
        } else {
          wx.showToast({
            title: '获取订单失败',
            icon: 'none'
          })
        }
      },

      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 状态映射
  getStatusMap(status) {
    const map = {
      0: { text: '待接单', color: '#999' },
      1: { text: '已接单', color: '#3c9cff' },
      2: { text: '维修中', color: '#f59e0b' },
      3: { text: '已完成', color: '#10b981' },
      4: { text: '已取消', color: '#ef4444' }
    }

    return map[status] || { text: '未知状态', color: '#999' }
  }
})