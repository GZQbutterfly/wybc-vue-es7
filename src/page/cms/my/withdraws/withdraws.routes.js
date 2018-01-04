
const routes = [
    // 提现记录列表
    {
        path: '/withdraws_list',
        name: 'withdraws_list',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./list/withdraws.list')['WithdrawsList']);
            }, 'cms/my/withdraws');
        }
    },
    // 提现记录详情
    {
        path: '/withdraws_detail',
        name: 'withdraws_detail',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./detail/withdraws.detail')['WithdrawsDetail']);
            }, 'cms/my/withdraws');
        }
    },
];
export default routes;
