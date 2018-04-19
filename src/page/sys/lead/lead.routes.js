
import { Layout } from './layout/layout';

const routes = [
    // 引导页面
    {
        path: '/lead',
        name: 'lead',
        meta: { title: "学惠精选", noLoginTip: false },
        component: Layout
        //  resolve => {
        //     require.ensure([], require => {
        //         resolve(require('./layout/layout')['Layout']);
        //     }, 'sys/system/lead');
        // }
    },
    // 查询店铺页面
    {
        path: '/lead_search',
        name: 'lead_search',
        meta: { title: "搜索店铺" },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./search/search')['Search']);
            }, 'sys/system/lead');
        }
    }
];

export default routes;
