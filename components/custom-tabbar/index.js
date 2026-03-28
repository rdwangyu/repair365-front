Component({
    properties: {
      role: {
        type: String,
        value: 'user',
        observer: function(newVal) {
          this.updateMenuList(newVal);
        }
      },
      current: {
        type: String,
        value: 'index'
      }
    },
  
    data: {
      visible: true,
      menuList: [],
      icons: {
        index: '/images/tabbar/index.png',
        indexActive: '/images/tabbar/index_active.png',
        order: '/images/tabbar/order.png',
        orderActive: '/images/tabbar/order_active.png',
        profile: '/images/tabbar/profile.png',
        profileActive: '/images/tabbar/profile_active.png'
      }
    },
  
    lifetimes: {
      attached() {
        this.updateMenuList(this.properties.role);
      }
    },
  
    methods: {
      updateMenuList(role) {
        let menuList = [];
        if (role === 'user') {
          menuList = [
            { type: 'index', text: '首页', url: `/pages/user/index/index` },
            { type: 'order', text: '订单列表', url: `/pages/user/order/list/list` },
            { type: 'profile', text: '用户中心', url: `/pages/user/profile/profile` }
          ];
        } else if (role === 'repairer') {
          menuList = [
            { type: 'index', text: '首页', url: `/pages/repairer/index/index` },
            { type: 'order', text: '订单列表', url: `/pages/repairer/order/list/list` },
            { type: 'profile', text: '用户中心', url: `/pages/repairer/profile/profile/profile` }
          ];
        }
        this.setData({ menuList });
      },
  
      switchTab(e) {
        const { url, type } = e.currentTarget.dataset;  
        this.setData({ current: type });
        wx.reLaunch({
          url: url,
          fail: (err) => {
            console.error('跳转失败', err);
            wx.navigateTo({ url });
          }
        });
      },
  
      setCurrent(type) {
        this.setData({ current: type });
      }
    }
  });