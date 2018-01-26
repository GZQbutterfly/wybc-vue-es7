import finishRoutes from './finish/finish.routes';

const routes = [
    {
        path: '/delivery_layout',
        name: 'delivery_layout',
        meta: { title: '配送单' },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'web/order/delivery');
        },
        redirect: {
            name: 'delivery_order'
        },
        children: [
            // 配送订单tabs
            {
                path: '/delivery_order',
                name: 'delivery_order',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./tabs/tabs')['DeliveryTabs']);
                    }, 'web/order/delivery');
                },
            },
            // 已完成订单
            ...finishRoutes
        ]
    }
];

export default routes;