
const routes = [
    {
        path: '/layout',
        name: 'layout',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'web/malls/malls');
        },
        redirect: {name: 'home'},
        children: [
            // 首页
            {
                path: '/home',
                name: 'home',
                meta: {
                    keepAlive: true
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./home/home')['Home']);
                    }, 'web/malls/malls');
                }
            },
            // 分类
            {
                path: '/classify',
                name: 'classify',
                meta: {
                    keepAlive: true
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./classify/classify')['Classify']);
                    }, 'web/malls/malls');
                }
            },
            // 购物车
           {
               path: '/shop_car',
               name: 'shop_car',
               meta: { keepAlive: true },
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
               meta: { keepAlive: true },
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
                meta: {noMenu: 1},
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./goods/goods.detail')['GoodsDetail']);
                    }, 'web/malls/goods');
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
           }
        ]
    },
    // 地址
    {
        path: '/user_address',
        name: 'user_address',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./userinfo/address/user.address')['UserAddress']);
            }, 'web/malls/malls');
        }
    },
];

export default routes;
