
const routes = [
    // 礼包
    {
        path: '/gift_pack',
        name: 'gift_pack',
        meta: { noMenu: 1 },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./gift_pack/gift_pack')['GiftPack']);
            }, 'malls/coupon/coupon');
        }
    },
    //优惠券列表
    {
        path: '/coupon_list',
        name: 'coupon_list',
        meta: { noMenu: 1 },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./coupon_list/coupon_list')['CouponList']);
            }, 'malls/coupon/coupon');
        }
    },
   //优惠券详情MyCouponDetail
    {
        path: '/coupon_detail',
        name: 'coupon_detail',
        meta: { noMenu: 1 },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./coupon_detail/coupon.detail')['MyCouponDetail']);
            }, 'malls/coupon/coupon');
        }
    },
];

export default routes;
