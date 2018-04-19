
const moneyGoldRoutes = [
    // 金币购
    {
        path: '/money_gold_buy', // 4.4 版本 名称 更改 上线时需注意修改
        name: 'money_gold_buy',
        meta: { keepAlive: true, noMenu: 1, head: 1, noSearch: 1 },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./gold/buy/buy')['MoneyGoldBuy']);
            }, 'malls/money/gold');
        }
    },
    // 金币明细
    {
        path: '/money_gold_detail',
        name: 'money_gold_detail',
        meta: { keepAlive: true, noMenu: 1, noSearch: 1 },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./gold/detail/detail')['MoneyGoldDetail']);
            }, 'malls/money/gold');
        }
    },
];


const timelimitRoutes = [
    // 限时购 商品列表
    {
        path: '/money_timelimit_layout',
        name: 'money_timelimit_layout',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./timelimit/layout/layout')['Layout']);
            }, 'malls/money/timelimit');
        },
        redirect: {
            name: 'money_timelimit_list'
        },
        children: [
            // 
            {
                path: '/money_timelimit_list',
                name: 'money_timelimit_list',
                meta: { keepAlive: false, noMenu: 1, noSearch: 1 },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./timelimit/list/list')['MoneyTimeLimitList']);
                    }, 'malls/money/timelimit');
                }
            },
            {
                path: '/money_timelimit_detail',
                name: 'money_timelimit_detail',
                meta: { keepAlive: false, noMenu: 1, noSearch: 1 },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./timelimit/detail/detail')['MoneyTimeLimitDetail']);
                    }, 'malls/money/timelimit');
                }
            },
            {
                path: '/money_timelimit_remind',
                name: 'money_timelimit_remind',
                meta: { keepAlive: false, noMenu: 1, noSearch: 1 },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./timelimit/myremind/myremind')['MoneyTimeLimitRemind']);
                    }, 'malls/money/timelimit');
                }
            },
        ]
    }
];



if (process.env.NODE_ENV == 'development') {
    timelimitRoutes.push(
        // test money_timelimit_banner  
        {
            path: '/money_timelimit_banner',
            name: 'money_timelimit_banner',
            meta: { keepAlive: true, noMenu: 1, noSearch: 1 },
            component: resolve => {
                require.ensure([], require => {
                    resolve(require('./timelimit/banner/banner')['MoneyTimeLimitBanner']);
                }, 'malls/money/timelimit');
            }
        }
    );
}


export {
    moneyGoldRoutes,
    timelimitRoutes
};
