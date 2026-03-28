import {
    BASE_URL,
    formatDate,
    formatDateTime
} from '../../../../utils/api'

Page({
    data: {
        order: {},
        timeline: [],
        statusText: '',
        isAssigned: false
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

                    const statusText = this.getStatusText(order.order_status)
                    const isAssigned = order.order_status >= 30 && order.order_status < 60

                    const timeline = this.buildTimeline(order)

                    this.setData({
                        order: {
                            ...order,
                            appointment_time: formatDateTime(new Date(order.appointment_time))
                        },
                        statusText,
                        isAssigned,
                        timeline
                    })

                } else {
                    wx.showToast({
                        title: `获取详情失败`,
                        icon: 'none'
                    })
                }
            },
            fail: () => {
                wx.showToast({
                    title: '加载失败',
                    icon: 'none'
                })
            },
            complete: () => {
                wx.hideLoading()
            }
        })
    },

    /* 状态映射 */
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

    /* 时间线生成（重点） */
    buildTimeline(order) {
        const list = []

        if (order.create_time) {
            list.push({
                time: formatDateTime(new Date(order.create_time)),
                text: '订单创建'
            })
        }

        if (order.order_status >= 10) {
            list.push({
                time: '',
                text: '订单已审核'
            })
        }

        if (order.order_status >= 20) {
            list.push({
                time: '',
                text: '订单已发布'
            })
        }

        if (order.order_status >= 30) {
            list.push({
                time: '',
                text: '维修员已接单'
            })
        }

        if (order.order_status >= 31) {
            list.push({
                time: '',
                text: '维修员上门中'
            })
        }

        if (order.order_status >= 40) {
            list.push({
                time: '',
                text: '已到达现场'
            })
        }

        if (order.order_status === 50) {
            list.push({
                time: '',
                text: '维修完成'
            })
        }

        if (order.order_status === 51) {
            list.push({
                time: '',
                text: '未解决'
            })
        }

        if (order.order_status === 60) {
            list.push({
                time: '',
                text: '已支付'
            })
        }

        if (order.order_status === 61) {
            list.push({
                time: '',
                text: '已退款'
            })
        }

        return list.reverse()
    },

    /* 接单 / 取消接单 */
    handleAction() {
        const {
            isAssigned,
            order
        } = this.data

        if (isAssigned) {
            wx.showModal({
                title: '提示',
                content: '确定取消接单？',
                success: (res) => {
                    if (res.confirm) {
                        this.cancelOrder(order.id)
                    }
                }
            })
        } else {
            this.acceptOrder(order.id)
        }
    },

    /* 接单接口 */
    acceptOrder(id) {
        wx.showLoading({
            title: '接单中'
        })

        wx.request({
            url: BASE_URL + `master/order/${id}/`,
            method: 'POST',
            success: () => {
                wx.showToast({
                    title: '接单成功'
                })
                this.loadOrder(id) // 重新加载
            },
            fail: () => {
                wx.showToast({
                    title: '接单失败',
                    icon: 'none'
                })
            },
            complete: () => {
                wx.hideLoading()
            }
        })
    },

    /* 取消接单接口 */
    cancelOrder(id) {
        wx.showLoading({
            title: '取消中'
        })

        wx.request({
            url: BASE_URL + `master/order/${id}/cancel/`,
            method: 'POST',
            success: () => {
                wx.showToast({
                    title: '已取消'
                })
                this.loadOrder(id)
            },
            fail: () => {
                wx.showToast({
                    title: '取消失败',
                    icon: 'none'
                })
            },
            complete: () => {
                wx.hideLoading()
            }
        })
    },

    goBack() {
        wx.navigateBack()
    }
})