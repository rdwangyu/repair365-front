import { BASE_URL } from '../../../../utils/api'

const CONTACT_PHONE = '18515070524'

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
    statusMap: STATUS_MAP,
    showTabbar: true,
    tabbarHeight: 50,   // 动态测量，默认 50px
    bottomPadding: 160  // page-wrap 底部留白，动态计算
  },

  onLoad() {
    this._measureTabbar()
    this.loadData()
  },

  // ── 动态获取 tabbar 高度，防止内容被遮住 ──
  _measureTabbar() {
    const sys = wx.getSystemInfoSync()
    const safeBottom = sys.screenHeight - (sys.safeArea ? sys.safeArea.bottom : sys.screenHeight)
    const defaultH = 50
    this._applyHeights(defaultH, safeBottom)

    // 等组件渲染后精确测量
    setTimeout(() => {
      wx.createSelectorQuery()
        .select('custom-tabbar')
        .boundingClientRect(rect => {
          if (rect && rect.height > 0) {
            this._applyHeights(rect.height, safeBottom)
          }
        })
        .exec()
    }, 300)
  },

  _applyHeights(tabbarH, safeBottom) {
    // 按钮条高度 ≈ 80rpx按钮 + 28rpx上下padding + 安全区 换算成 px
    const btnBarPx = Math.ceil((80 + 28) / 2) + safeBottom
    this.setData({
      tabbarHeight: tabbarH,
      bottomPadding: tabbarH + btnBarPx + 12
    })
  },

  // ── 拉取用户信息 ──
  loadData() {
    this.setData({ loading: true, error: false })
    const userToken = wx.getStorageSync('userToken') || ''
    console.log(1111, userToken)
    wx.request({
      url: BASE_URL + 'master/',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const info = res.data.result
          this.setData({
            userInfo: info,
            stars: this._buildStars(info.user_grade),
            loading: false,
            error: false
          })
        } else if (res.statusCode === 401) {
          this.setData({ loading: false, error: true, errorMsg: '登录已过期，请重新登录' })
        } else {
          this.setData({ loading: false, error: true, errorMsg: `请求失败（${res.statusCode}）` })
        }
      },
      fail: (err) => {
        console.error('请求失败', err)
        this.setData({ loading: false, error: true, errorMsg: '网络异常，请检查连接后重试' })
      }
    })
  },

  // ── 生成星星字符串（5星制）──
  _buildStars(grade) {
    const g = Math.min(parseFloat(grade) || 0, 5)
    const full = Math.floor(g)
    const half = g - full >= 0.5
    const emptyCount = 5 - full - (half ? 1 : 0)
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(Math.max(0, emptyCount))
  },

  // ── 营业执照放大预览（修正：从 userInfo 取数据）──
  previewLicense() {
    const url = this.data.userInfo && this.data.userInfo.business_license
    if (!url) return
    wx.previewImage({ urls: [url], current: url })
  },

  // ── 拨打客服电话 ──
  callService() {
    wx.makePhoneCall({
      phoneNumber: CONTACT_PHONE,
      fail() {} // 开发工具不支持，静默忽略
    })
  }
})
