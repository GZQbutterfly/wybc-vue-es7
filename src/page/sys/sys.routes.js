import loginRoutes from './login/login.routes';

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
    }, {
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
            }, 'sys/system');
        }
    },
    // 邀请码
    {
        path: '/apply_shop_invitecode',
        name: 'apply_shop_invitecode',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./apply/invitecode/invitecode')['ApplyShopInvitecode']);
            }, 'sys/system');
        }
    },
    // 申请开店
    {
        path: '/apply_shop',
        name: 'apply_shop',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./apply/shop/shop')['ApplyShop']);
            }, 'sys/system');
        }
    },
    // 申请开店Wiki
    {
        path: '/apply_shop_wiki',
        name: 'apply_shop_wiki',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./apply/wiki/wiki')['applyShopWiki']);
            }, 'sys/system');
        }
    }
];

export default routes;
