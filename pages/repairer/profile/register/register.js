import {
    BASE_URL
} from '../../../../utils/api'
Page({

    data: {
        form: {
            fullname: '',
            age: '',
            sex: 1,
            phone: '',
            address: '',
            work_year: '',
            avatar: '',
            identity_card_0: '',
            identity_card_1: '',
            business_license: '',
        },
        submitting: false,
    },

    // =====================
    // 输入绑定
    // =====================
    onInput(e) {
        const key = e.currentTarget.dataset.key
        this.setData({
            [`form.${key}`]: e.detail.value
        })
    },

    // =====================
    // 性别选择
    // =====================
    selectSex(e) {
        this.setData({
            'form.sex': e.currentTarget.dataset.val
        })
    },

    // =====================
    // 头像上传
    // =====================
    chooseAvatar() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempPath = res.tempFiles[0].tempFilePath
                this.setData({
                    'form.avatar': tempPath
                })
                // TODO: 上传到服务器后替换为远程 URL
                this.uploadFile(tempPath, 'avatar')
            },
            fail: (res) => {
                console.log(res)
            }
        })
    },

    // =====================
    // 图片上传（身份证 / 营业执照）
    // =====================
    chooseImage(e) {
        const key = e.currentTarget.dataset.key
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempPath = res.tempFiles[0].tempFilePath
                this.setData({
                    [`form.${key}`]: tempPath
                })
                this.uploadFile(tempPath, key)
            }
        })
    },

    // =====================
    // 上传文件到服务器（示例）
    // =====================
    uploadFile(filePath, fieldKey) {
        return new Promise((resolve, reject) => {
            wx.uploadFile({
                url: `${BASE_URL}upload/`, // 替换为实际上传接口
                filePath,
                name: 'image',
                success: (res) => {
                    const data = JSON.parse(res.data)
                    this.setData({
                        [`form.${fieldKey}`]: data.result.url
                    })
                    resolve(data.url)
                },
                fail: (err) => {
                    console.log(err)
                    wx.showToast({
                        title: '上传失败，请重试',
                        icon: 'none'
                    })
                    reject(err)
                }
            })
        })
    },

    // =====================
    // 表单验证
    // =====================
    validateForm() {
        const {
            form
        } = this.data
        const rules = [{
                key: 'fullname',
                label: '真实姓名'
            },
            {
                key: 'age',
                label: '年龄'
            },
            {
                key: 'sex',
                label: '性别'
            },
            {
                key: 'phone',
                label: '手机号码'
            },
            {
                key: 'address',
                label: '服务地址'
            },
            {
                key: 'work_year',
                label: '工作年限'
            },
            {
                key: 'avatar',
                label: '师傅头像'
            },
            {
                key: 'identity_card_0',
                label: '身份证正面'
            },
            {
                key: 'identity_card_1',
                label: '身份证反面'
            },
        ]
        for (const rule of rules) {
            if (!form[rule.key] && form[rule.key] !== 0) {
                wx.showToast({
                    title: `请填写${rule.label}`,
                    icon: 'none'
                })
                return false
            }
        }
        const phoneReg = /^1[3-9]\d{9}$/
        if (!phoneReg.test(form.phone)) {
            wx.showToast({
                title: '手机号格式不正确',
                icon: 'none'
            })
            return false
        }
        const ageReg = /^\d+$/
        if (!ageReg.test(form.age)) {
            wx.showToast({
                title: '年龄不正确',
                icon: 'none'
            })
            return false
        }
        const workYearReg = /^\d+$/
        if (!workYearReg.test(form.work_year)) {
            wx.showToast({
                title: '工作年限不正确',
                icon: 'none'
            })
            return false
        }
        return true
    },

    // =====================
    // 提交审核
    // =====================
    submitForm() {
        if (this.data.submitting) return
        if (!this.validateForm()) return

        this.setData({
            submitting: true
        })

        const {
            form
        } = this.data

        // 获取微信 code 后调用后台登录注册接口
        wx.login({
            success: (loginRes) => {
                if (!loginRes.code) {
                    wx.showToast({
                        title: '微信登录失败',
                        icon: 'none'
                    })
                    this.setData({
                        submitting: false
                    })
                    return
                }

                wx.request({
                    url: `${BASE_URL}master/`, // 对应 UserMasterView.post
                    method: 'POST',
                    data: {
                        code: loginRes.code,
                        fullname: form.fullname,
                        age: Number(form.age),
                        sex: form.sex,
                        phone: form.phone,
                        address: form.address,
                        work_year: Number(form.work_year),
                        avatar: form.avatar,
                        identity_card_0: form.identity_card_0,
                        identity_card_1: form.identity_card_1,
                        business_license: form.business_license,
                        auto_reg: true
                    },
                    header: {
                        'Content-Type': 'application/json'
                    },
                    success: (res) => {
                        const data = res.data
                        if (data.errcode === 0) {
                            wx.setStorageSync('userToken', data.result.access_token)
                            wx.showToast({
                                title: '提交成功！',
                                icon: 'success'
                            })
                            setTimeout(() => {
                                wx.redirectTo({
                                    url: '/pages/repairer/profile/profile/profile'
                                }) // 跳转到审核等待页
                            }, 1500)
                        } else {
                            wx.showToast({
                                title: data.errmsg || '提交失败，请重试',
                                icon: 'none'
                            })
                            this.setData({
                                submitting: false
                            })
                        }
                    },
                    fail: () => {
                        wx.showToast({
                            title: '网络错误，请检查连接',
                            icon: 'none'
                        })
                        this.setData({
                            submitting: false
                        })
                    }
                })
            },
            fail: () => {
                wx.showToast({
                    title: '微信登录失败',
                    icon: 'none'
                })
                this.setData({
                    submitting: false
                })
            }
        })
    }
})