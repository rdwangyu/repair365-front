import {BASE_URL} from '../../utils/api'
Page({
    data: {
        registering: false
    },

    selectUser() {
        if (this.data.registering) return;
        this.setData({
            registering: true
        });

        wx.showLoading({
            title: '注册中...',
            mask: true
        });

        wx.login({
            success: (loginRes) => {
                if (loginRes.code) {
                    this.registerUser(loginRes.code);
                } else {
                    wx.hideLoading();
                    this.setData({
                        registering: false
                    });
                    wx.showToast({
                        title: '微信登录失败',
                        icon: 'none'
                    });
                }
            },
            fail: (err) => {
                wx.hideLoading();
                this.setData({
                    registering: false
                });
                wx.showToast({
                    title: '获取登录凭证失败',
                    icon: 'none'
                });
                console.error('wx.login fail:', err);
            }
        });
    },

    registerUser(code) {
        wx.request({
            url: BASE_URL + 'customer/',
            method: 'POST',
            data: {
                code: code,
            },
            header: {
                'content-type': 'application/json'
            },
            success: (res) => {
                wx.hideLoading();
                this.setData({
                    registering: false
                });

                console.log(res)
                if (res.statusCode === 200) {
                    if (res.data.errcode === 0) {
                        wx.setStorageSync('userToken', res.data.result.access_token);
                        wx.reLaunch({
                            url: '/pages/user/index/index'
                        });
                    } else {
                        wx.showToast({
                            title: res.data.errmsg,
                            icon: 'none'
                        });
                    }
                } else {
                    wx.showToast({
                        title: `注册失败 ${res.statusCode}`,
                        icon: 'none'
                    });
                }
            },
            fail: (err) => {
                wx.hideLoading();
                this.setData({
                    registering: false
                });
                wx.showToast({
                    title: '网络请求失败',
                    icon: 'none'
                });
                console.error('注册请求失败:', err);
            }
        });
    },

    selectRepairer() {
        wx.reLaunch({
            url: '/pages/repairer/index/index'
        });
    },

    goToAgreement() {
        wx.navigateTo({
            url: '/pages/agreement/agreement'
        });
    },

    goToPrivacy() {
        wx.navigateTo({
            url: '/pages/privacy/privacy'
        });
    }
});