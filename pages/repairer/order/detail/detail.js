import {
  BASE_URL,
  formatDateTime,
  formatLocation
} from '../../../../utils/api'

Page({
  data: {
    order: {},
    timeline: [],
    statusText: '',
    actionButtons: []
  },

  onLoad(options) {
    this.loadOrder(options.id)
  },

  loadOrder(id) {
    wx.showLoading({
      title: '加载中...'
    })

    wx.request({
      url: BASE_URL + `master/order/${id}/`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${wx.getStorageSync('userToken')}`
      },
      success: (res) => {
        if (res.data.errcode === 0) {
          const order = res.data.result
          this.setData({
            order: {
              ...order,
              location: formatLocation(order.location),
              appointment_time: order.appointment_time ?
                formatDateTime(new Date(order.appointment_time)) : ''
            },
            statusClass: this.getStatusClass(order.order_status),
            statusText: this.getStatusText(order.order_status),
            timeline: this.buildTimeline(order),
            actionButtons: this.getActionButtons(order.order_status)
          })
        } else {
          wx.showToast({
            title: '获取失败'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '加载失败'
        })
      },
      complete: () => wx.hideLoading()
    })
  },

  getStatusClass(status) {
    if (status === 20) return 'status-blue'
    if (status === 30 || status === 31) return 'status-orange'
    if (status === 40) return 'status-purple'
    if (status === 50) return 'status-green'
    if (status === 51) return 'status-red'
    if (status === 1) return 'status-gray'
    return 'status-blue'
  },

  getStatusText(status) {
    const map = {
      0: '已创建',
      1: '已取消',
      10: '已审核',
      20: '待接单',
      30: '已接单',
      31: '上门中',
      40: '已到达',
      50: '已完成',
      51: '未解决',
      60: '已支付',
      61: '已退款',
      999: '已删除'
    }
    return map[status] || '未知状态'
  },

  buildTimeline(order) {
    const steps = [{
        key: 0,
        text: '创建'
      },
      {
        key: 20,
        text: '待接单'
      },
      {
        key: 30,
        text: '已接单'
      },
      {
        key: 31,
        text: '上门中'
      },
      {
        key: 40,
        text: '已到达'
      },
      {
        key: 50,
        text: '完成'
      }
    ]

    return steps.map(item => ({
      text: item.text,
      active: order.order_status >= item.key,
      current: item.key === order.order_status
    }))
  },

  getActionButtons(status) {
    switch (status) {
      case 20:
        return [{
          text: '立即接单',
          type: 'primary',
          action: 'accept'
        }]

      case 30:
        return [{
            text: '取消接单',
            type: 'warn',
            action: 'cancel'
          },
          {
            text: '我已出发',
            type: 'primary',
            action: 'depart'
          }
        ]

      case 31:
        return [{
          text: '我已到达',
          type: 'primary',
          action: 'arrive'
        }]

      case 40:
        return [{
            text: '已完成',
            type: 'primary',
            action: 'finish'
          },
          {
            text: '未解决',
            type: 'warn',
            action: 'fail'
          }
        ]

      default:
        return []
    }
  },

  handleAction(e) {
    const action = e.currentTarget.dataset.action
    const id = this.data.order.id

    switch (action) {
      case 'accept':
        this.updateStatus(id, 30, '接单成功')
        break
      case 'cancel':
        this.updateStatus(id, 20, '已取消')
        break
      case 'depart':
        this.updateStatus(id, 31, '已出发')
        break
      case 'arrive':
        this.updateStatus(id, 40, '已到达')
        break
      case 'finish':
        this.updateStatus(id, 50, '已完成')
        break
      case 'fail':
        this.updateStatus(id, 51, '未解决')
        break
    }
  },

  updateStatus(id, status, text) {
    wx.showLoading({
      title: '处理中...'
    })

    wx.request({
      url: BASE_URL + `master/order/${id}/`,
      method: 'PUT',
      header: {
        Authorization: `Bearer ${wx.getStorageSync('userToken')}`
      },
      data: {
        order_status: status
      },
      success: (res) => {
        if (res.data.errcode === 0) {
          wx.showToast({
            title: text
          })
          this.loadOrder(res.data.result.id)
        } else {
          console.log(res.data.errmsg)
          wx.showToast({
            title: '状态更新失败'
          })
        }

      },
      fail: () => {
        wx.showToast({
          title: '失败',
          icon: 'none'
        })
      }
    })
  },

  makePhoneCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (!phone) return

    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})