import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import '../../vconsole.log';
import '../../commons/env/events';
import './module';

import authHandler from '../../commons/env/auth';
import cmsRouterAuth from './cms.router.auth';
import wxShareWatcher from '../../commons/env/wxshare';
import router from './router';
import store from './store';
import registerGlobal from '../../commons/bridge/registerGlobal';
import { isNativeiOS, isNativeAndroid } from '../../commons/env/common.env';

import preinit from '../../commons/config/preinit';

preinit().then(() => {
    router.__store = store;
    sync(store, router);
    new Vue({
        el: '#app',
        router,
        store,
        created() {
            authHandler(this);
            this.$nextTick(() => {
                cmsRouterAuth(this, this.$router);
                // 分享
                wxShareWatcher(this.$router);

                if (isNativeiOS() || isNativeAndroid()) {
                    registerGlobal(this.$router);
                }
            });
        }
    });
});