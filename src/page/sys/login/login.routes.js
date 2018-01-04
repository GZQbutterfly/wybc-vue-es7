
const routes = [
    {
        path: '/login',
        name: 'login',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout')['LoginLayout']);
            }, 'sys/login/login');
        }
    },
    {
        path: '/login_back',
        name: 'login_back',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./back/back')['LoginBack']);
            }, 'sys/login/login');
        }
    }
];

export default routes;
