import Vue from 'vue';

import '../../vconsole.log';
import '../../commons/env/events';
import './module';


import authHandler from '../../commons/env/auth';
import wxShareWatcher from '../../commons/env/wxshare';
import router from './router';
import store from './store';
import registerGlobal from '../../commons/bridge/registerGlobal';
import {isNativeiOS} from '../../commons/env/util/client';

new Vue({
    el: '#app',
    router,
    store,
    mounted(){
        this.$nextTick(()=>{
           authHandler(this);
           wxShareWatcher(this.$router);
           if (isNativeiOS()) {
                registerGlobal(this.$router);
           }
        });
    }
});

