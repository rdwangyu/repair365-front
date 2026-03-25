import BASE_URL from '../../../utils/api'
Page({

  data: {
    showForm: false,
    showTabbar: true,

    categories: [{
      label: '电动车',
      value: 0
    }, {
      label: '其他',
      value: 999
    }],
    selectedCategory: 0,

    days: ['今天', '明天', '后天'],
    selectedDay: null,

    times: [{
        label: '上午11点前',
        value: '9:30:00'
      },
      {
        label: '中午期间',
        value: '12:00:00'
      },
      {
        label: '下午',
        value: '15:00:00'
      },
      {
        label: '晚上7点前后',
        value: '19:00:00'
      },
    ],
    selectedTime: null,

    form: {},
    districts: ['福山区', '芝罘区', '高新区', '开发区', '莱山区'],
    selectedDistrict: '福山区',
    detailAddress: '',
  },


  selectDistrict(e) {
    this.setData({
      selectedDistrict: e.currentTarget.dataset.value
    })
  },

  onDetailAddr(e) {
    this.setData({
      detailAddress: e.detail.value
    })
  },

  onRepair() {

    this.setData({
      showForm: true,
      showTabbar: false
    })

    wx.hideTabBar()

    // ===== 获取用户信息 =====
    wx.request({
      url: BASE_URL + 'customer/',
      method: 'GET',
      data: {
        token: wx.getStorageSync('userToken')
      },

      success: (res) => {
        console.log(res)

        if (res.data.errcode === 0) {
          if (res.data.result.phone) {
            this.setData({
              'form.contact_phone': res.data.result.phone
            })
          }

          // ===== 2. 自动填地址 =====
          console.log(1111, res.data.result.address)
          if (res.data.result.address) {
            const addressArray = res.data.result.address.split('@@@@@@')
            console.log(addressArray, 2222)
            this.setData({
              selectedDistrict: addressArray[1],
              detailAddress: addressArray[2]
            })
          }
        } else {
          wx.showToast({
            title: `获取用户信息失败 ${res.data.errmsg}`,
            icon: 'none'
          })
        }

      },

      fail: () => {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })
  },

  closeForm() {
    this.setData({
      showForm: false,
      showTabbar: true
    })
    wx.showTabBar()
  },

  onLocation(e) {
    this.data.form.location = e.detail.value
  },

  onPhone(e) {
    this.data.form.contact_phone = e.detail.value
  },

  onDesc(e) {
    this.data.form.issue_description = e.detail.value
  },

  onComment(e) {
    this.data.form.comment = e.detail.value
  },

  selectCategory(e) {
    this.setData({
      selectedCategory: e.currentTarget.dataset.value
    })
  },

  selectDay(e) {
    const value = e.currentTarget.dataset.value

    this.setData({
      selectedDay: this.data.selectedDay === value ? null : value
    })
  },

  selectTime(e) {
    const value = e.currentTarget.dataset.value

    this.setData({
      selectedTime: this.data.selectedTime === value ? null : value
    })
  },

  buildAppointmentTime() {

    const day = this.data.selectedDay
    const time = this.data.selectedTime
    const now = new Date()

    // ===== 情况1：啥都没选 → 当前时间 =====
    if (!day && !time) {
      return this.formatDateTime(now)
    }

    // ===== 情况2：选了day但没选time → 报错 =====
    if (day && !time) {
      wx.showToast({
        title: '请选择具体时间段',
        icon: 'none'
      })
      return null
    }

    // ===== 情况3：选了time但没选day（不允许）=====
    if (!day && time) {
      wx.showToast({
        title: '请先选择日期',
        icon: 'none'
      })
      return null
    }

    // ===== 计算日期 =====
    let targetDate = new Date()

    if (day === '明天') {
      targetDate.setDate(now.getDate() + 1)
    } else if (day === '后天') {
      targetDate.setDate(now.getDate() + 2)
    }

    const dateStr = this.formatDate(targetDate)

    return `${dateStr} ${time}`
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  formatDateTime(date) {
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${this.formatDate(date)} ${h}:${min}:${s}`
  },

  onCurrent() {
    wx.navigateTo({
      url: '/pages/current/current'
    })
  },

  onCall() {
    wx.makePhoneCall({
      phoneNumber: '10086'
    })
  },

  submitForm() {

    // ===== 数据整理 =====
    const phone = (this.data.form.contact_phone || '').trim()
    const desc = (this.data.form.issue_description || '').trim()
    const comment = (this.data.form.comment || '').trim()
    const addr = (this.data.detailAddress || '').trim()
    const district = this.data.selectedDistrict
    const category = this.data.selectedCategory

    // ===== 1. 地址校验 =====
    if (!district) {
      wx.showToast({
        title: '请选择区县',
        icon: 'none'
      })
      return
    }

    if (!addr) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none'
      })
      return
    }

    // ===== 3. 手机号校验 =====
    if (!phone) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      })
      return
    }

    // 中国手机号校验
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return
    }

    // ===== 4. 描述校验 =====
    if (!desc) {
      wx.showToast({
        title: '请填写问题描述',
        icon: 'none'
      })
      return
    }

    if (desc.length < 5) {
      wx.showToast({
        title: '问题描述太简单',
        icon: 'none'
      })
      return
    }

    // ===== 5. 拼接数据 =====
    const appointment = this.buildAppointmentTime()
    if (!appointment) return

    const location = `烟台市@@@@@@${district}@@@@@@${addr}`

    // ===== 6. 防重复提交（很重要）=====
    if (this._submitting) return
    this._submitting = true

    wx.showLoading({
      title: '提交中...'
    })

    // ===== 7. 请求 =====
    wx.request({
      url: BASE_URL + 'customer/order/',
      method: 'POST',
      data: {
        location: location,
        repair_category: category,
        contact_phone: phone,
        issue_description: desc,
        appointment_time: appointment,
        comment: comment,
        token: wx.getStorageSync('userToken')
      },

      success: (res) => {
        console.log(res)

        if (res.data.errcode === 0) {
          wx.showToast({
            title: '提交成功'
          })

          // 关闭弹窗（体验更好）
          this.closeForm()

          wx.navigateTo({
            url: `/pages/user/order/detail/detail?order_number=${res.data.result.order_number}`
          })

        } else {
          wx.showToast({
            title: `提交失败 ${res.data.errcode}`,
            icon: 'none'
          })
        }
      },

      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },

      complete: () => {
        this._submitting = false
        wx.hideLoading()
      }
    })
  }

})