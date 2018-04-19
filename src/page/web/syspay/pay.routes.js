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
];

export default routes;
