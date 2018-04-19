import finishRoutes from './finish/finish.routes';

const routes = [
    {
        path: '/delivery_m_layout',
        name: 'delivery_m_layout',
        meta: { title: '店长配送' },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'cms/order/delivery_m');
        },
        redirect: {
            name: 'delivery_m_order'
        },
        children: [
            // 配送订单tabs
            {
                path: '/delivery_m_order',
                name: 'delivery_m_order',
                meta: { title: '店长配送', keepAlive: true},
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./tabs/tabs')['DeliveryTabs']);
                    }, 'cms/order/delivery_m');
                },
            },
            // 配送订单tabs
            {
                path: '/delivery_m_order_guid',
                name: 'delivery_m_order_guid',
                meta: { title: '快速仓说明', keepAlive: true},
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./guid/guid')['FastDeliveryGuid']);
                    }, 'cms/order/delivery_m');
                },
            },
            // 已完成订单
            ...finishRoutes
        ]
    }
];

export default routes;