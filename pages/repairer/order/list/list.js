import {
  BASE_URL,
  formatDateTime
} from '../../../../utils/api'

Page({

  data: {
    list: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,

    keyword: '',

    statusOptions: [{
        label: '发布中',
        value: 20
      },
      {
        label: '已接单',
        value: 30
      },
      {
        label: '上门中',
        value: 31
      },
      {
        label: '已到达',
        value: 40
      },
      {
        label: '已完成',
        value: 50
      },
      {
        label: '未解决',
        value: 51
      },
      {
        label: '已支付',
        value: 60
      },
      {
        label: '已退款',
        value: 61
      }
    ],
    statusIndex: null
  },

  onLoad() {
    this.loadList()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.resetAndLoad(() => wx.stopPullDownRefresh())
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadList()
    }
  },

  resetAndLoad(cb) {
    this.setData({
      page: 1,
      list: [],
      hasMore: true
    })
    this.loadList(cb)
  },

  // 请求
  loadList(cb) {
    if (this.data.loading) return
    this.setData({
      loading: true
    })

    const params = {
      page: this.data.page,
      page_size: this.data.pageSize
    }

    // 🔥 只在有值时传
    if (this.data.keyword) params.search_keyword = this.data.keyword
    if (this.data.statusIndex) params.status = this.data.statusIndex

    wx.request({
      url: BASE_URL + 'master/order/',
      method: 'GET',
      header: {
        Authorization: `Bearer ${wx.getStorageSync('userToken')}`
      },
      data: params,

      success: (res) => {
        if (res.data.errcode === 0) {
          const arr = res.data.result.orders || []

          const list = arr.map(item => ({
            ...item,
            statusClass: this.getStatusClass(item.order_status),
            create_time: formatDateTime(new Date(item.create_time)),
            shortDesc: (item.issue_description || '').slice(0, 20),
            categoryText: item.repair_category === 0 ? '电动车维修' : '其他',
            statusText: this.getStatusText(item.order_status)
          }))

          this.setData({
            list: this.data.page === 1 ? list : this.data.list.concat(list),
            hasMore: list.length === this.data.pageSize
          })
        }
      },

      complete: () => {
        this.setData({
          loading: false
        })
        cb && cb()
      }
    })
  },

  getStatusClass(status) {
    if (status === 20) return 'blue'
    if (status === 30 || status === 31) return 'orange'
    if (status === 40) return 'purple'
    if (status === 50) return 'green'
    if (status === 51) return 'red'
    return 'gray'
  },

  // ✅ 用配置匹配状态
  getStatusText(val) {
    const found = this.data.statusOptions.find(i => i.value === val)
    return found ? found.label : '处理中'
  },

  // 🔍 搜索
  onKeyword(e) {
    this.setData({
      keyword: e.detail.value
    })
    this.resetAndLoad()
  },

  // 📊 状态点击（可取消）
  toggleStatus(e) {
    const v = e.currentTarget.dataset.value
    this.setData({
      statusIndex: this.data.statusIndex === v ? null : v
    })
    this.resetAndLoad()
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/repairer/order/detail/detail?id=${id}`
    })
  }

})