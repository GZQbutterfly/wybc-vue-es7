import Vuex from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);
//路由中大小写风格不统一  此配置统一小写
//单独缓存  android需要每次更换url重新注入config
let store = new Vuex.Store({
    state: {
        customization: {
           'home':true,
           'classify':true,
           'goods_detail':true,
           'information':true,
           'money_gold_buy':true,
           'easy_scanner':true,
           'helper':true,
           'info':true,
           'cms_stock_info':true,
           'money_timelimit_detail':true,
           'lead':true,
        },
        signature:{}
    }
});

export default store;
