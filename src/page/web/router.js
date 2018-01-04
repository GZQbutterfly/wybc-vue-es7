import VueRouter from 'vue-router';

import sysRoutes from '../sys/sys.routes';
import mallsRoutes from './malls/malls.routes';
import orderRoutes from './order/order.routes';

const routes = [
    {
        path: '/',
        redirect: {name: 'layout'}
    },
    // sys
    ...sysRoutes,
    // 商城 malls
    ...mallsRoutes,
    // 订单order
    ...orderRoutes,
    {
        path: '**',
        name: 'not_found',
        meta: { keepAlive: true },
        component: resolve => {
            require.ensure([], require => {
                resolve(require('../sys/notfound/notfound')['NotFound']);
            }, 'sys/system');
        }
    }
];


const router = new VueRouter({
    mode: 'history',
    routes
});

export default router;
