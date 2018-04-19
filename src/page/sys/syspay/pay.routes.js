const routes = [
    {
        path: '/sys_pay_list',
        name: 'sys_pay_list',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./list/syspaylist')['SysPayList']);
            }, 'sys/system/pay');
        }
    },
    {
        path: '/sys_pay',
        name: 'sys_pay',
        history: false,
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./pay/syspay')['SysPay']);
            }, 'sys/system/pay');
        }
    }
];

export default routes;
