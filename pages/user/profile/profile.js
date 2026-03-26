import {
    BASE_URL,
    formatLocation
} from '../../../utils/api'

Page({

    data: {
        user: {},

        sexOptions: [{
                label: '未知',
                value: 0
            },
            {
                label: '男',
                value: 1
            },
            {
                label: '女',
                value: 2
            }
        ],
        sexIndex: 0,
        sexText: '未知',

        statusText: '正常'
    },

    onLoad() {
        this.loadUser()
    },

    loadUser() {
        wx.request({
            url: BASE_URL + 'customer/',
            method: 'GET',
            header: {
                Authorization: `Bearer ${wx.getStorageSync('userToken')}`
            },

            success: (res) => {
                if (res.data.errcode === 0) {
                    const u = res.data.result

                    const sexObj = this.data.sexOptions.find(i => i.value === u.sex) || this.data.sexOptions[0]

                    this.setData({
                        user: {
                            ...u,
                            address: formatLocation(u.address)
                        },
                        sexIndex: this.data.sexOptions.findIndex(i => i.value === u.sex),
                        sexText: sexObj.label,
                        statusText: u.account_status === 0 ? '正常' : '异常'
                    })
                    console.log(this.data)
                }
            }
        })
    },

    // 失焦更新
    onBlur(e) {
        const field = e.currentTarget.dataset.field
        const value = (e.detail.value || '').trim()
        if (this.data.user[field] == value) return
        this.updateField(field, value)
    },

    onSexChange(e) {
        const index = e.detail.value
        const obj = this.data.sexOptions[index]

        if (this.data.user.sex === obj.value) return

        this.setData({
            sexIndex: index,
            sexText: obj.label
        })

        this.updateField('sex', obj.value)
    },

    updateField(field, value) {
        wx.request({
            url: BASE_URL + 'customer/',
            method: 'PUT',
            header: {
                Authorization: `Bearer ${wx.getStorageSync('userToken')}`
            },
            data: {
                [field]: value
            },

            success: (res) => {
                if (res.data.errcode === 0) {
                    this.setData({
                        [`user.${field}`]: value
                    })

                    wx.showToast({
                        title: '已更新',
                        icon: 'success'
                    })

                } else {
                    wx.showToast({
                        title: '更新失败',
                        icon: 'none'
                    })
                }
            }
        })
    },

    callService() {
        wx.makePhoneCall({
            phoneNumber: '18515070524'
        })
    }

})