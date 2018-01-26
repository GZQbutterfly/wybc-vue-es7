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
    //配送员实名认证
    {
        path: '/distributor_realname_form',
        name: 'distributor_realname_form',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./distributorRealName/form/distributor.form')['DistributorRealNameForm']);
            }, 'cms/auth/distributorRealName');
        }
    },
    //配送员押金deposit
    {
        path: '/deposit',
        name: 'deposit',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./deposit/deposit')['Deposit']);
            }, 'cms/auth/deposit');
        }
    },

];

export default routes;
