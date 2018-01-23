const routes = [
    {
        path: '/delivery_layout',
        name: 'delivery_layout',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'web/order/delivery');
        },
        redirect: {
            name: 'delivery_order'
        },
        children: [
            {
                path: '/delivery_order',
                name: 'delivery_order',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./tabs/tabs')['DeliveryTabs']);
                    }, 'web/order/delivery');
                },
            }
        ]
    }
]

export default routes;