// pages/masterDetail/masterDetail.js

const API_BASE = 'http://192.168.10.118:8000'
const CONTACT_PHONE = '18515070524'

// 账号状态映射
const STATUS_MAP = {
  0: '新建',
  1: '审核中',
  2: '封禁',
  3: '已注销'
}

Page({
  data: {
    loading: true,
    error: false,
    errorMsg: '',
    userInfo: null,
    stars: '',
    statusMap: STATUS_MAP
  },

  onLoad(options) {
    // 如需从上个页面接收参数（如 masterId），可从 options 中获取
    // this.masterId = options.id
    this.loadData()
  },

  // ── 请求用户信息 ──
  loadData() {
    this.setData({ loading: true, error: false })

    // 从本地缓存获取 userToken（登录时存储）
    const userToken = wx.getStorageSync('userToken') || ''

    wx.request({
      url: `${API_BASE}/master/`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const info = res.data
          this.setData({
            userInfo: info,
            stars: this._buildStars(info.user_grade),
            loading: false,
            error: false
          })
        } else if (res.statusCode === 401) {
          this.setData({
            loading: false,
            error: true,
            errorMsg: '登录已过期，请重新登录'
          })
        } else {
          this.setData({
            loading: false,
            error: true,
            errorMsg: `请求失败（${res.statusCode}）`
          })
        }
      },
      fail: (err) => {
        console.error('请求失败', err)
        this.setData({
          loading: false,
          error: true,
          errorMsg: '网络异常，请检查连接后重试'
        })
      }
    })
  },

  // ── 生成星星字符串 ──
  _buildStars(grade) {
    const g = parseFloat(grade) || 0
    const full = Math.floor(g)
    const half = g - full >= 0.5
    let s = '★'.repeat(Math.min(full, 5))
    if (half && full < 5) s += '½'
    const empty = 5 - Math.ceil(g)
    s += '☆'.repeat(Math.max(0, empty))
    return s
  },

  // ── 预览营业执照 ──
  previewLicense() {
    const url = this.data.userInfo && this.data.userInfo.business_license
    if (!url) return
    wx.previewImage({
      urls: [url],
      current: url
    })
  },

  // ── 拨打客服电话 ──
  callService() {
    wx.makePhoneCall({
      phoneNumber: CONTACT_PHONE,
      fail() {
        // 部分环境（开发工具）不支持拨号，忽略
      }
    })
  }
})
