import deliveryRoutes from './delivery/delivery.routes';

const routes = [
    {
        path: '/order_layout',
        name: 'order_layout',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'web/order/order');
        },
        redirect: {
            name: 'user_order'
        },
        children: [
            {
                path: '/user_order',
                name: 'user_order',
                meta: {
                    noMenu: 1
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./list/user.order')['UserOrder']);
                    }, 'web/order/order');
                }
            },
            // 订单详情
            {
                path: '/order_detail',
                name: 'order_detail',
                meta: {
                    noMenu: 1
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./detail/order.detail')['OrderDetail']);
                    }, 'web/order/order');
                }

            },
            // 提交订单页面流程 submit
            {
                path: '/order_submit',
                name: 'order_submit',
                meta: {
                    noMenu: true
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./submit/order.submit')['OrderSubmit']);
                    }, 'web/order/order');
                }
            },
            //活动套餐
            {
                path: '/package',
                name: 'package',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./package/package')['Package']);
                    }, 'web/order/order');
                }
            }
        ]
    },
    // delivery
    ...deliveryRoutes
];

export default routes;
