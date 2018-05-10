const routes = [
    {
        path: '/pay_list',
        name: 'pay_list',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./list/syspaylist')['SysPayList']);
            }, 'sys/system/pay');
        }
    },
    {
        path: '/pay_result',
        name: 'pay_result',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./result/payresult')['PayResult']);
            }, 'sys/system/pay');
        }
    },
];

export default routes;
