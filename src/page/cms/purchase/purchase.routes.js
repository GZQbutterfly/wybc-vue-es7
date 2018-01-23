import { CmsLayout } from './layout/layout';

const routes = [
    // ===>
    // 我要进货
    {
        path: '/cms_purchase',
        name: 'cms_purchase',
        component: () => Promise.resolve(CmsLayout),
        redirect: { name: 'cms_purchase_classify' },
        children: [
            // 分类
            {
                path: '/cms_purchase_classify',
                name: 'cms_purchase_classify',
                meta: { keepAlive: true, menu: true },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./classify/classify' )['CmsPurchaseClassify']);
                    }, 'cms/purchase/malls');
                }
            },
            // 购物车
            {
                path: '/cms_purchase_shop_car',
                name: 'cms_purchase_shop_car',
                meta: { keepAlive: true, menu: true },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./shop_car/shop_car')['CmsPurchaseShopCar']);
                    }, 'cms/purchase/malls');
                }
            },
            // 我的
            {
                path: '/cms_purchase_userinfo',
                name: 'cms_purchase_userinfo',
                meta: { keepAlive: true, menu: true },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./userinfo/userinfo')['CmsPurchaseUserinfo']);
                    }, 'cms/purchase/malls');
                }
            },
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
            //提交订单
            {
                path: '/cms_purchase_submit_order',
                name: 'cms_purchase_submit_order',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./order/submit/submit.order')['CmsPurchaseSubmitOrder']);
                    }, 'cms/purchase/order');
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
            //仓储说明
            {
                path: '/cms_stock_info',
                name: 'cms_stock_info',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./order/submit/stockinfo/stock.info')['StockInfo']);
                    }, 'cms/purchase/order');
                }
            }
            
        ]
    },
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
        meta: {  title:'地址' },
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
];

export default routes;
