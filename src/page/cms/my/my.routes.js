// 我的路由

import withdrawsRoutes from './withdraws/withdraws.routes';
import myInventoryRoutes from './inventory/inventory.routes';
import myCounponRoutes from './coupon/coupon.routes';
import payRoutes from './password/pay.routes';

const routes = [// 我的钱包
    {
        path: '/my_layout ',
        name: 'my_layout',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'cms/my/sys');
        },
        redirect: {
            name: 'my_wallet'
        },
        children: [
            {
                path: '/my_wallet',
                name: 'my_wallet',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./wallet/wallet')['MyWallet']);
                    }, 'cms/my/sys');
                }
            },
            // 我的收益
            {
                path: '/my_income',
                name: 'my_income',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./income/income')['MyIncome']);
                    }, 'cms/my/sys');
                }
            },
            // 团队
            {
                path: '/my_team',
                name: 'my_team',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./team/team')['MyTeam']);
                    }, 'cms/my/sys');
                }
            },
            // 我要推广
            {
                path: '/my_spread',
                name: 'my_spread',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./spread/spread')['MySpread']);
                    }, 'cms/my/sys');
                }
            },
            {
                path: '/team_list',
                name: 'team_list',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./team/team_list/team.list')['TeamList']);
                    }, 'cms/my/sys');
                }
            },
            {
                path: '/helper',
                name: 'helper',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./helper/helper')['Helper']);
                    }, 'cms/my/sys');
                }
            },
            // 资讯
            {
                path: '/information',
                name: 'information',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./information/information')['Information']);
                    }, 'cms/my/sys');
                }
            },
            //快速仓
            {
                path: '/fast_store',
                name: 'fast_store',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./fastStore/fastStore')['FastStore']);
                    }, 'cms/my/sys');
                }
            },{
                path: '/faststore_info',
                name: 'faststore_info',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./fastStore/infomation/fastStore.info')['FastStoreInfo']);
                    }, 'cms/my/sys');
                },
            },{
                path: '/options',
                name: 'options',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./options/options')['Options']);
                    }, 'cms/my/sys');
                }
            },
            //提现记录
            ...withdrawsRoutes,
            //我的库存
            ...myInventoryRoutes,
            // 我的优惠券
            ...myCounponRoutes,
            ...payRoutes
        ]
    }
];
export default routes;
