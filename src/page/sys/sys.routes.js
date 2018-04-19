import loginRoutes from './login/login.routes';
import leadRoutes from './lead/lead.routes';


const routes = [
    ...loginRoutes,
    // 搜索
    {
        path: '/search',
        name: 'search',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./search/search')['Search']);
            }, 'sys/system');
        },
        history: false
    },
    // 搜索tmp
    {
        path: '/search_bar',
        name: 'search_bar',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('../../commons/vue_plugins/components/search/tmp/search')['searchBar']);
            }, 'sys/system');
        }
    },
    // 搜索测试
    {
        path: '/search_test',
        name: 'search_test',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./search/test/search_test')['SearchTest']);
            }, 'sys/system');
        },
        history: false
    }, 
    {
        path: '/address',
        name: 'address',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./address/address')['Address']);
            }, 'sys/system');
        }
    }, {
        path: '/message_notice',
        name: 'message_notice',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./notice/message/message.notice')['MessageNotice']);
            }, 'sys/system');
        }
    },
    // 无忧本草协议
    {
        path: '/wybc_protocol',
        name: 'wybc_protocol',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./protocol/protocol')['Protocol']);
            }, 'sys/system');
        }
    },
    //开店
    // 宣传信息
    {
        path: '/apply_shop_campaign',
        name: 'apply_shop_campaign',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./apply/campaign/campaign')['ApplyShopCampaign']);
            }, 'sys/system/applyshop');
        }
    },
    // 填写学校
    {
        path: '/apply_shop_choose_school',
        name: 'apply_shop_choose_school',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./apply/chooseSch/chooseSch')['ApplyShopChooseSch']);
            }, 'sys/system/applyshop');
        }
    },
    // 邀请码
    {
        path: '/apply_shop_invitecode',
        name: 'apply_shop_invitecode',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./apply/invitecode/invitecode')['ApplyShopInvitecode']);
            }, 'sys/system/applyshop');
        }
    },
    // 申请开店
    {
        path: '/apply_shop',
        name: 'apply_shop',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./apply/shop/shop')['ApplyShop']);
            }, 'sys/system/applyshop');
        }
    },
    // 申请开店Wiki
    {
        path: '/apply_shop_wiki',
        name: 'apply_shop_wiki',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./apply/wiki/wiki')['applyShopWiki']);
            }, 'sys/system/applyshop');
        }
    },
    // 引导页面
    ...leadRoutes,
];

export default routes;
