import VueRouter from 'vue-router';

import purchaseRoutes from './purchase/purchase.routes';
import orderRoutes from './order/order.routes';
import authRoutes from './auth/auth.routes';
import gradeRoutes from './grade/grade.routes';
import myRoutes from './my/my.routes';
import scannerRoutes from './scanner/scanner.routes'

// ==>
const routes = [
    {
        path: '/',
        redirect: {
            name: 'cms_home'
        }
    }, {
        path: '/cms_home',
        name: 'cms_home',
        component: (resolve) => {
            require.ensure([], require => {
                resolve(require('./home/home.js')['CmsHome']);
            }, `cms/home`);
        }
    },
    ...purchaseRoutes,
    ...orderRoutes,
    ...authRoutes,
    ...myRoutes,
    ...gradeRoutes,
    ...scannerRoutes,
    {
        path: '/message_notice',
        name: 'message_notice',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('../sys/notice/message/message.notice')['MessageNotice']);
            }, 'sys/system');
        }
    },
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

// ==>
const router = new VueRouter({
    mode: 'hash',
    routes
});

// ==>
export default router;
