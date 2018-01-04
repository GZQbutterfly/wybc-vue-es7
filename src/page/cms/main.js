import Vue from 'vue';

import '../../vconsole.log';
import '../../commons/env/events';
import './module';

import authHandler from '../../commons/env/auth';
import cmsRouterAuth from './cms.router.auth';
import wxShareWatcher from '../../commons/env/wxshare';
import router from './router';
import store from './store';

new Vue({
    el: '#app',
    router,
    store,
    mounted() {
        this.$nextTick(() => {
            authHandler(this);


            cmsRouterAuth(this, this.$router);
            // 分享
            wxShareWatcher(this.$router);
        });
    }
});
