import {
  BASE_URL
} from '../../utils/api'

Page({
  data: {
    registering: false
  },

  onLoad() {
    const lastRole = wx.getStorageSync('lastRole');
    if (lastRole === 'user')
    {
      this.selectUser();
    } else if (lastRole === 'repairer')
    {
      this.selectRepairer();
    } else {
      return;
    }
  },

  selectUser() {
    // 检查是否已有用户 token
    const userToken = wx.getStorageSync('userToken');
    if (userToken) {
      // 已有 token，直接跳转到用户首页
      wx.reLaunch({
        url: '/pages/user/index/index'
      });
      return;
    }

    // 没有 token，先通过微信登录获取 code
    if (this.data.registering) return;
    this.setData({
      registering: true
    });

    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          this.checkUserExists(loginRes.code, BASE_URL + 'customer/', '/pages/user/index/index', '');
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

  // 检查用户是否已存在
  checkUserExists(code, url, page, register_page) {
    wx.request({
      url: url,
      method: 'POST',
      data: {
        code: code,
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('检查用户存在性:', res);

        if (res.statusCode === 200) {
          if (res.data.errcode === 0) {
            // 用户已存在，直接保存 token 并跳转
            if (res.data.result && res.data.result.access_token) {
              wx.setStorageSync('userToken', res.data.result.access_token);
              wx.hideLoading();
              this.setData({
                registering: false
              });
              wx.reLaunch({
                url: page
              });
            } else {
              console.error('用户数据异常: ', res.data.result);
              wx.showToast({
                title: '用户数据异常'
              })
            }
          } else {
            wx.redirectTo({
              url: register_page
            })
          }
        } else {
          wx.showToast({
            title: `请求异常 ${res.statusCode}`
          })
        }
      },
      fail: (err) => {
        wx.showToast({
          title: `请求异常 ${err}`
        })
      },
      complete: wx.hideLoading()
    });
  },

  selectRepairer() {
    // 检查是否已有维修工 token
    const repairerToken = wx.getStorageSync('repairerToken');

    if (repairerToken) {
      // 已有 token，直接跳转到维修工首页
      wx.reLaunch({
        url: '/pages/repairer/index/index'
      });
      return;
    }

    // 没有 token，先通过微信登录获取 code
    if (this.data.registering) return;
    this.setData({
      registering: true
    });

    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          this.checkUserExists(loginRes.code, BASE_URL + 'master/', '/pages/repairer/index/index', '/pages/repairer/profile/register/register');
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