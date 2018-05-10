import orderRouters from "./order/order.routes";
import shelvesRoutes from './shelves/shelves.routes';

const routes = [
    //商品详情
    {
        path: '/cms_purchase_goods_detail',
        name: 'cms_purchase_goods_detail',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./goods/goods.detail')['CmsPurchaseGoodsDetail']);
            }, 'cms/purchase/malls');
        }
    },
    //订单详情
    {
        path: '/cms_purchase_order_detail',
        name: 'cms_purchase_order_detail',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./order/detail/order.detail')['CmsPurchaseOrderDetail']);
            }, 'cms/purchase/order');
        }
    },
    //商品详情优惠券
    {
        path: '/cms_mask_coupon',
        name: 'cms_mask_coupon',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./goods/mask_coupon/mask_coupon')['CmsMaskCoupon']);
            }, 'cms/purchase/malls');
        }
    },
    // 商品货架
    ...shelvesRoutes
    ,
    //我要进货搜索页面
    {
        path: '/cms_purchase_search',
        name: 'cms_purchase_search',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./search/search')['Search']);
            }, 'cms/search/search');
        }
    },
    // 地址
    {
        path: '/cms_user_address',
        name: 'cms_user_address',
        meta: {
            title: '地址'
        },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('../../sys/user_address/user.address')['UserAddress']);
            }, 'cms/purchase/address');
        }
    },
    {
        path: '/address',
        name: 'address',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('../../sys/address/address')['Address']);
            }, 'sys/system');
        }
    },
    ...orderRouters,
];

export default routes;