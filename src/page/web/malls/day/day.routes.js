const dayRoutes = [
    {
        path: '/day_sign_layout',
        name: 'day_sign_layout',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./sign/layout/layout')['Layout']);
            }, 'malls/day/sign');
        },
        redirect: {
            name: 'day_sign_list'
        },
        children: [
            // 每日签到
            {
                path: '/day_sign_list',
                name: 'day_sign_list',
                meta: { keepAlive: true, noMenu: 1, head: 1, noSearch: 1 },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./sign/list/list')['DaySignList']);
                    }, 'malls/day/sign');
                }
            },
            // 签到记录
            {
                path: '/day_sign_history',
                name: 'day_sign_history',
                meta: { keepAlive: true, noMenu: 1, head: 1, noSearch: 1 },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./sign/history/history')['DaySignHistory']);
                    }, 'malls/day/sign');
                }
            },
            // 签到说明
            {
                path: '/day_sign_guid',
                name: 'day_sign_guid',
                meta: { keepAlive: true, noMenu: 1, head: 1, noSearch: 1 },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./sign/guid/guid')['DaySignGuid']);
                    }, 'malls/day/sign');
                }
            }
        ]
    }
];


export default dayRoutes;