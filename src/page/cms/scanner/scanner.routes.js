// Sacnner
const routes = [
    // ===>
    // 轻松扫描
    {
        path: '/easy_scanner',
        name: 'easy_scanner',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./easy/easy')['EasyScanner']);
            }, 'cms/scanner/scanner');
        }
    }
];

export default routes;
