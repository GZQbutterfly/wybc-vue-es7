

const routes = [
    {
        path: '/cms_goods_shelves',
        name: 'cms_goods_shelves',
        meta: { keepAlive: false, menu: false },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['ShelvesLayout']);
            }, 'cms/purchase/shelves');
        }
    },
    // {
    //     path: '/cms_goods_shelves_new',
    //     name: 'cms_goods_shelves_new',
    //     meta: { keepAlive: false, menu: false },
    //     component: resolve => {
    //         require.ensure([], require => {
    //             resolve(require('./layout_new/layout')['ShelvesLayout']);
    //         }, 'cms/purchase/shelves_new');
    //     }
    // }
];



export default routes;