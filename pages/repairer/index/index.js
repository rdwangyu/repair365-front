import { BASE_URL, formatDateTime } from '../../../utils/api'

Page({

  data: {
    list: [],
    latitude: 39.9042,   // 默认北京，可改
    longitude: 116.4074,
    markers: []
  },

  onLoad() {
    this.getLocation()
    this.loadList()

    // 🔥 每分钟刷新
    this.timer = setInterval(() => {
      this.loadList()
    }, 60000)
  },

  onUnload() {
    clearInterval(this.timer)
  },

  /* 获取当前位置 */
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      }
    })
  },

  /* 加载最新3条发布中订单 */
  loadList() {
    wx.request({
      url: BASE_URL + 'master/order/',
      method: 'GET',
      header: {
        Authorization: `Bearer ${wx.getStorageSync('userToken')}`
      },
      data: {
        status: 20,
        page: 1,
        page_size: 3
      },
      success: (res) => {
        if (res.data.errcode === 0) {
          const arr = res.data.result.orders || []

          const list = arr.map(item => ({
            ...item,
            create_time: formatDateTime(new Date(item.create_time)),
            shortDesc: (item.issue_description || '').slice(0, 20)
          }))

          // 🔥 地图点
          const markers = list.map((item, index) => ({
            id: item.id,
            latitude: item.latitude || this.data.latitude,
            longitude: item.longitude || this.data.longitude,
            width: 30,
            height: 30
          }))

          this.setData({ list, markers })
        }
      }
    })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/repairer/order/detail/detail?id=${id}`
    })
  }

})