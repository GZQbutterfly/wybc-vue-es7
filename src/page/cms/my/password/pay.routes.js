const routes = [
    {
        path:'/password',
        name:'password',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./password')['PayPassWord']);
            }, 'cms/my/sys');
        }
    },{
        path:'/payoptions',
        name:'payoptions',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./payoptions/payoptions')['PayOptions']);
            }, 'cms/my/sys');
        }
    },{
        path:'/password_set',
        name:'password_set',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./passwordsetting/passwordset')['PayPasswordSet']);
            }, 'cms/my/sys');
        }
    },{
        path:'/password_check',
        name:'password_check',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./passwordcheck/passwordcheck')['PayPasswordCheck']);
            }, 'cms/my/sys');
        }
    }
];

export default routes;