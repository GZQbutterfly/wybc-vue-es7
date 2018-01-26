import deliveryRoutes from './delivery/delivery.routes';
const routes = [
    {
        path: '/order_layout ',
        name: 'order_layout',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'cms/order/order');
        },
        redirect: {
            name: 'cms_out_order'
        },
        children: [
            {
                path: '/cms_out_order',
                name: 'cms_out_order',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./out/out.order')['OutOrder']);
                    }, 'cms/order/order');
                }
            }, {
                path: '/cms_stock_order',
                name: 'cms_stock_order',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./stock/stock.order')['StockOrder']);
                    }, 'cms/order/order');
                }
            }, {
                path: '/cms_stock_order_detail',
                name: 'cms_stock_order_detail',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./stock/detail/stock.order.detail')['StockOrderDetail']);
                    }, 'cms/order/order');
                }
            }, {
                path: '/cms_out_order_detail',
                name: 'cms_out_order_detail',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./out/detail/out.order.detail')['OutOrderDetail']);
                    }, 'cms/order/order');
                }
            }
        ]
    },
    //配送员详情
    {
        path: '/distributor_detail',
        name: 'distributor_detail',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./distributorDetail/distributor_detail')['DistributorDetail']);
            }, 'cms/order/order');
        }
    },
    ...deliveryRoutes
];

export default routes;
