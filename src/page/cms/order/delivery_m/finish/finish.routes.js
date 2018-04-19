const routes = [
    // 完成订单列表
    {
        path: '/delivery_m_finish_list',
        name: 'delivery_m_finish_list',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./list/list')['List']);
            }, 'cms/order/delivery_m');
        }
    },
    // 完成订单详情
    {
        path: '/delivery_m_finish_detail',
        name: 'delivery_m_finish_detail',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./detail/detail')['Detail']);
            }, 'cms/order/delivery_m');
        }
    }
]

export default routes;