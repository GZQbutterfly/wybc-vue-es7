import {
    moneyGoldRoutes,
    timelimitRoutes
} from './money/money.routes';
import couponRoutes from './coupon/coupon.routes';
import dayTaskRoutes from './day_task/day_task.routes';

import dayRoutes from './day/day.routes';



const routes = [
    {
        path: '/layout',
        name: 'layout',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'web/malls/malls');
        },
        redirect: { name: 'lead' },
        children: [
            // 首页
            // {
            //     path: '/home',
            //     name: 'home',
            //     meta: {
            //         keepAlive: true,
            //         title: '首页',
            //         head: 1
            //     },
            //     component: resolve => {
            //         require.ensure([], require => {
            //             resolve(require('./home/home')['Home']);
            //         }, 'web/malls/malls');
            //     }
            // },
            {
                path: '/home',
                name: 'home',
                meta: {
                    keepAlive: true,
                    title: '首页',
                    head: 1
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./new_home/list/list')['MallsList']);
                    }, 'web/malls/new_malls');
                }
            },
            // 分类
            {
                path: '/classify',
                name: 'classify',
                meta: {
                    keepAlive: true,
                    title: '分类',
                    head: 1,
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./classify/classify')['Classify']);
                    }, 'web/malls/malls');
                }
            },
            // 店长代理
            {
                path: '/shop_chief',
                name: 'shop_chief',
                meta: {
                    keepAlive: true,
                    title: '店长代理',
                    head: 1,
                    noMenu:1
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./shop_chief/shop_chief')['ShopChief']);
                    }, 'web/malls/malls');
                }
            },
            // 资讯
            {
                path: '/information',
                name: 'information',
                meta: {
                    keepAlive: true,
                    title: '资讯',
                    noMenu: 1
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./information/information')['Information']);
                    }, 'web/malls/malls');
                }
            },
            // 购物车
            {
                path: '/shop_car',
                name: 'shop_car',
                meta: { keepAlive: true, title: '购物车' },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./shop_car/shop_car')['ShopCar']);
                    }, 'web/malls/malls');
                }
            },
            // 我的
            {
                path: '/userinfo',
                name: 'userinfo',
                meta: { keepAlive: true, title: '我的' },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./userinfo/userinfo')['UserInfo']);
                    }, 'web/malls/malls');
                }
            },
            // 商品详情
            {
                path: '/goods_detail',
                name: 'goods_detail',
                meta: { noMenu: 1, noLoginTip:false},
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./goods/goods.detail')['GoodsDetail']);
                    }, 'web/malls/goods');
                }
            },
            // 粉丝记录
            {
                path: '/fans_record',
                name: 'fans_record',
                meta: { noMenu: 1, noLoginTip: false },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./my/fans_record/fans_record')['FansRecord']);
                    }, 'web/malls/my');
                }
            },
            // 推荐开店
            {
                path: '/recommend_shop',
                name: 'recommend_shop',
                meta: { noMenu: 1, noLoginTip: false },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./my/recommend_shop/easy')['EasyScanner']);
                    }, 'web/malls/my');
                }
            },
            // 我的推荐
            {
                path: '/my_recommendation',
                name: 'my_recommendation',
                meta: { noMenu: 1, noLoginTip: false },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./my/my_recommendation/my_recommendation')['MyRecommendation']);
                    }, 'web/malls/my');
                }
            },
            // 搜索、首页、分类的公共商品列表组件
            {
                path: '/goods_list',
                name: 'goods_list',
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./goods_list/goods_list')['GoodsList']);
                    }, 'web/malls/goods');
                }
            },
            // 金币
            ...moneyGoldRoutes,
        ]
    },
    // 地址
    {
        path: '/user_address',
        name: 'user_address',
        meta: { title: '地址' },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('../../sys/user_address/user.address')['UserAddress']);
            }, 'web/malls/malls');
        }
    },
    //关于我们
    {
        path: '/about',
        name: 'about',
        meta: { title: '关于我们' },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./about/about')['About']);
            }, 'web/malls/malls');
        }
    },
    {
        path: '/mask_coupon',
        name: 'mask_coupon',
        meta: { keepAlive: true, title: '购物车' },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./shop_car/mask_coupon/mask_coupon')['maskCoupon']);
            }, 'web/malls/malls');
        }
    },
    {
        path: '/follow_shop',
        name: 'follow_shop',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./userinfo/followShop/follow_shop')['FollowShop']);
            }, 'web/malls/malls');
        }
    },
    {
        path: '/rank_gold',
        name: 'rank_gold',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./userinfo/rank/rankgold')['RankGold']);
            }, 'web/malls/rank');
        }
    },
    {
        path: '/rank_gift',
        name: 'rank_gift',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./userinfo/rank/gift/gift')['RankGift']);
            }, 'web/malls/rank');
        }
    },
    // 金币maskCoupon
    // ...moneyRoutes
    //优惠券
    ...couponRoutes,
    ...dayTaskRoutes,
    // 限时购
    ...timelimitRoutes,
    // day  route
    ...dayRoutes
];

export default routes;
