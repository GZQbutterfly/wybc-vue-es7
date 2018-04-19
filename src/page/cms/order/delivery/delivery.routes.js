import finishRoutes from './finish/finish.routes';

const routes = [
    {
        path: '/delivery_layout',
        name: 'delivery_layout',
        meta: { title: '配送单' },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'cms/order/delivery');
        },
        redirect: {
            name: 'delivery_order'
        },
        children: [
            // 配送订单tabs
            {
                path: '/delivery_order',
                name: 'delivery_order',
                meta: { title: '配送单', keepAlive: false},
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./tabs/tabs')['DeliveryTabs']);
                    }, 'cms/order/delivery');
                },
            },
            // 已完成订单
            ...finishRoutes
        ]
    }
];

export default routes;