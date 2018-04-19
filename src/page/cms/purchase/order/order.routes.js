import { OrderLayout } from './layout/layout';

const routes = [
    {
        path: '/cms_purchase_submit',
        name: 'cms_purchase_submit',
        component: () => Promise.resolve(OrderLayout),
        redirect: { name: 'cms_purchase_submit_order' },
        children: [
            //提交订单
            {
                path: '/cms_purchase_submit_order',
                name: 'cms_purchase_submit_order',
                meta: { keepAlive: true },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./submit/submit.order')['CmsPurchaseSubmitOrder']);
                    }, 'cms/purchase/order/order');
                }
            },
             //提交定单优惠券
            {
                path: '/cms_coupon',
                name: 'cms_coupon',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./coupon/coupon')['CmsCoupon']);
                    }, 'cms/purchase/order/order');
                }
            },
            //仓储说明
            {
                path: '/cms_stock_info',
                name: 'cms_stock_info',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./submit/stockinfo/stock.info')['StockInfo']);
                    }, 'cms/purchase/order/order');
                }
            },
        ]
    }
];

export default routes;