import {
    BASE_URL,
    formatDateTime,
    formatLocation
} from '../../../../utils/api'

Page({

    data: {
        order: null,
        timeline: [],
        categoryText: '',
        statusText: ''
    },

    onLoad(options) {
        this.loadOrder(options.id)
    },

    callMaster(e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        })
    },

    loadOrder(id) {
        wx.showLoading({
            title: '加载中...'
        })

        wx.request({
            url: BASE_URL + `customer/order/${id}/`,
            method: 'GET',
            header: {
                Authorization: `Bearer ${wx.getStorageSync('userToken')}`
            },

            success: (res) => {
                if (res.data.errcode === 0) {
                    const r = res.data.result
                    const order = {
                        id: r.id,
                        order_number: r.order_number,
                        contact_phone: r.contact_phone,
                        location: formatLocation(r.location),
                        appointment_time: formatDateTime(new Date(r.appointment_time)),
                        issue_description: r.issue_description,
                        repair_category: r.repair_category,
                        order_status: r.order_status,
                        create_time: formatDateTime(new Date(r.create_time)),

                        assignee_name: r.assignee.fullname,
                        assignee_phone: r.assignee.phone
                    }

                    this.setData({
                        order,
                        timeline: this.buildTimeline(order),
                        categoryText: order.repair_category === 0 ? '维修电动车' : '其他',
                        statusText: this.getStatusText(order.order_status)
                    })
                }
            },

            complete: () => wx.hideLoading()
        })
    },

    buildTimeline(o) {
        return [{
                label: '提交订单',
                time: this.formatTime(o.create_time),
                done: true
            },
            {
                label: '已接单',
                time: o.order_status >= 30 ? '已接单' : '',
                done: o.order_status >= 30
            },
            {
                label: '上门中',
                time: o.order_status >= 40 ? '进行中' : '',
                done: o.order_status >= 40
            },
            {
                label: '完成',
                time: o.order_status >= 50 ? '已完成' : '',
                done: o.order_status >= 50
            }
        ]
    },

    formatTime(t) {
        if (!t) return ''

        // 👇 关键修复（iOS兼容）
        t = t.replace(/-/g, '/')

        const d = new Date(t)

        return `${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    },

    getStatusText(s) {
        return {
            20: '发布中',
            1: '已取消',
            30: '已接单',
            31: '上门中',
            40: '已到达',
            50: '已完成'
        } [s] || '处理中'
    },

    copyOrderNo() {
        wx.setClipboardData({
            data: this.data.order.order_number
        })
    },

    refresh() {
        this.loadOrder(this.data.order.id)
    },

    goHome() {
        wx.reLaunch({
            url: '/pages/user/index/index'
        })
    },

    cancelOrder() {
        wx.showModal({
            title: '确认取消订单？',
            success: (res) => {
                if (res.confirm) {
                    wx.request({
                        url: BASE_URL + `customer/order/${this.data.order.id}/`,
                        method: 'DELETE',
                        header: {
                            Authorization: `Bearer ${wx.getStorageSync('userToken')}`
                        },
                        success: () => {
                            wx.showToast({
                                title: '已取消'
                            })
                            this.loadOrder(this.data.order.id)
                        }
                    })
                }
            }
        })
    }

})