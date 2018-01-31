// 实名认证路由

const routes = [
    // 实名认证
    {
        path: '/realname',
        name: 'realname',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./realname/real.name')['RealName']);
            }, 'cms/auth/realname');
        }
    },
    // 实名认证填写
    {
        path: '/realname_form',
        name: 'realname_form',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./realname/form/form')['RealNameForm']);
            }, 'cms/auth/realname');
        }
    },
    // 实名认证返回结果页
    {
        path: '/realname_result',
        name: 'realname_result',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./realname/result/result')['RealNameResult']);
            }, 'cms/auth/realname');
        }
    },

    // 配送员 实名认证
    {
        path: '/distributor_realname',
        name: 'distributor_realname',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./distributorRealName/distributor.real.name')['DistributorRealName']);
            }, 'cms/auth/distributorRealName');
        }
    },
    // 配送员 实名认证填写
    {
        path: '/distributor_realname_form',
        name: 'distributor_realname_form',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./distributorRealName/form/distributor.form')['DistributorRealNameForm']);
            }, 'cms/auth/distributorRealName');
        }
    },
    // 配送员 实名认证返回结果页
    {
        path: '/distributor_realname_result',
        name: 'distributor_realname_result',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./distributorRealName/result/distributor.result')['DistributorRealNameResult']);
            }, 'cms/auth/distributorRealName');
        }
    },
    //配送员押金deposit
    {
        path: '/distributor_deposit',
        name: 'distributor_deposit',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./distributorDeposit/distributor.deposit')['DistributorDeposit']);
            }, 'cms/auth/distributorDeposit');
        }
    },

];

export default routes;
