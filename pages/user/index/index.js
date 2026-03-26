import {
    BASE_URL,
    formatDate,
    formatDateTime
} from '../../../utils/api'
Page({

    data: {
        showForm: false,
        showTabbar: true,

        desc: '',
        phone: '',
        comment: '',
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

        districts: ['福山区', '芝罘区', '高新区', '开发区', '莱山区'],
        selectedDistrict: '福山区',
        detailAddress: '',
        form: {},
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
        if (this._loadingUserInfo) return // 👈 防重复
        this._loadingUserInfo = true

        this.setData({
            showForm: true,
            showTabbar: false,
        })

        wx.hideTabBar()

        if (this.data.phone === '' || this.data.detailAddress === '') {
            console.log('用户信息获取')
            wx.showLoading({
                title: '用户信息自动填充...'
            })

            wx.request({
                url: BASE_URL + 'customer/',
                method: 'GET',
                header: {
                    Authorization: `Bearer ${wx.getStorageSync('userToken')}`
                },

                success: (res) => {
                    if (res.data.errcode === 0) {
                        if (res.data.result.phone && this.data.phone === '') {
                            this.setData({
                                phone: res.data.result.phone
                            })
                        }

                        if (res.data.result.address && this.data.detailAddress === '') {
                            const addressArray = res.data.result.address.split('@@@@@@')
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
                },

                complete: () => {
                    wx.hideLoading() // ⭐ 不管成功失败都关闭
                    this._loadingUserInfo = false // 👈 释放锁
                }
            })
        }


    },

    closeForm() {
        this.setData({
            showForm: false,
            showTabbar: true
        })
        wx.showTabBar()
    },

    onDetailAddress(e) {
        this.data.detailAddress = e.detail.value
    },

    onPhone(e) {
        this.setData({
            phone: e.detail.value
        })
    },

    onDesc(e) {
        this.setData({
            desc: e.detail.value
        })
    },

    onComment(e) {
        this.setData({
            comment: e.detail.value
        })
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
            return formatDateTime(now)
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

        const dateStr = formatDate(targetDate)

        return `${dateStr} ${time}`
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
        const phone = (this.data.phone || '').trim()
        const desc = (this.data.desc || '').trim()
        const comment = (this.data.comment || '').trim()
        const detailAddress = (this.data.detailAddress || '').trim()
        const district = this.data.selectedDistrict
        const category = this.data.selectedCategory

        // ===== 校验 =====
        if (!district) return wx.showToast({
            title: '请选择区县',
            icon: 'none'
        })
        if (!detailAddress) return wx.showToast({
            title: '请输入详细地址',
            icon: 'none'
        })
        if (!phone) return wx.showToast({
            title: '请输入联系电话',
            icon: 'none'
        })

        const phoneReg = /^1[3-9]\d{9}$/
        if (!phoneReg.test(phone)) return wx.showToast({
            title: '手机号格式错误',
            icon: 'none'
        })

        if (!desc) return wx.showToast({
            title: '请填写问题描述',
            icon: 'none'
        })
        if (desc.length < 5) return wx.showToast({
            title: '问题描述太简单',
            icon: 'none'
        })

        const appointment = this.buildAppointmentTime()
        if (!appointment) return

        const fullAddress = `烟台市@@@@@@${district}@@@@@@${detailAddress}`

        // ===== 防重复 =====
        if (this._submitting) return
        this._submitting = true

        wx.request({
            url: BASE_URL + 'customer/order/',
            method: 'POST',
            header: {
                Authorization: `Bearer ${wx.getStorageSync('userToken')}`
            },
            data: {
                location: fullAddress,
                repair_category: category,
                contact_phone: phone,
                issue_description: desc,
                appointment_time: appointment,
                comment: comment
            },

            success: (res) => {
                if (res.data.errcode === 0) {
                    this.setData({
                        selectedTime: null,
                        selectedDay: null,
                        selectedDistrict: '',
                        detailAddress: '',
                        phone: '',
                        desc: '',
                        comment: ''
                    })

                    this.closeForm()
                    wx.navigateTo({
                        url: `/pages/user/order/detail/detail?id=${res.data.result.id}`
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
            }
        })
    }

})