const routes = [
    // 优惠券 列表
    {
        path: '/my_coupon_list',
        name: 'my_coupon_list',
        meta: { keepAlive: true, noMenu: 1 },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./list/coupon.list')['MyCouponList']);
            }, 'cms/coupon/coupon');
        }
    },
    // 优惠券 二维码
    {
        path: '/my_coupon_detail',
        name: 'my_coupon_detail',
        meta: { keepAlive: true, noMenu: 1 },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./detail/coupon.detail')['MyCouponDetail']);
            }, 'cms/coupon/coupon');
        }
    },
    // 我的优惠券
    {
        path: '/cms_my_coupon',
        name: 'cms_my_coupon',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./usercoupon/usercoupon')['CmsUserCoupon']);
            }, 'cms/coupon/usercoupon');
        }
    },
    // 限制商品优惠券详情
    {
        path: '/cms_coupon_detail',
        name: 'cms_coupon_detail',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./usercoupon/detail/coupon.detail')['CmsCouponDetail']);
            }, 'cms/coupon/usercoupon/detail');
        }
    }
];

export default routes;
