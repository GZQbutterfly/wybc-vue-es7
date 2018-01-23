import Vue from 'vue';
import {get} from 'lodash';

// 外部组件 ==>
import VueRouter from 'vue-router';
import Vuex from 'vuex';
// import VueScroller from 'vue-scroller';
import VueProgressiveImage from 'vue-progressive-image';
import VueVideoPlayer from 'vue-video-player';
import VueLazyload from 'vue-lazyload';
import VueForm from 'vue-form';


Vue.use(Vuex);
Vue.use(VueRouter);

//console.log(VueScroller);

// Vue.component('scroller', resolve => {
//     require.ensure([], require => {
//         let scroller = require('vue-scroller');
//         resolve(get(scroller, 'default.Scroller') || get(scroller, 'Scroller'));
//     }, 'sys/plugins/vue_out');
// });


// 下拉刷新上拉加载
// Vue.use(VueScroller);

// 渐进式图片加载
// console.log(VueProgressiveImage);
Vue.use(VueProgressiveImage, {
    delay: 100,
    blur: 10
});

// 图片懒加载
// console.log(VueLazyload);
Vue.use(VueLazyload);

// 视频播放
// console.log(VueVideoPlayer);
import '../assets/vue-video-player/video.js/video-js.css';

Vue.use(VueVideoPlayer);


//引入校验规则
import validators from '../vue_plugins/validators/validators';
// 表单校验
Vue.use(VueForm, validators);

// <==

// 内部组件 ==>
import ContainerComponent from '../vue_plugins/components/container/container.vue';
import PullRefresh from '../vue_plugins/components/pull_refresh/pull_refresh.vue';
import BannerComponent  from '../vue_plugins/components/banner/banner.vue';

import minirefresh from 'components/minirefresh/minirefresh.vue';
import scroller from 'components/scroller/scroller.vue';

// 下拉刷新上拉加载
Vue.component('scroller', scroller);

Vue.component('minirefresh', minirefresh);

Vue.component('app-banner',BannerComponent);
//   resolve => {
//     require.ensure([], require => {
//         resolve(require('../vue_plugins/components/banner/banner.vue'));
//     }, 'sys/plugins/vue_env');
// });
Vue.component('app-container', ContainerComponent);
// resolve => {
//     require.ensure([], require => {
//         resolve(require('../vue_plugins/components/container/container.vue'));
//     }, 'sys/plugins/vue_env');
// });
Vue.component('pull-refresh',PullRefresh);
//  resolve => {
//     require.ensure([], require => {
//         resolve(require('../vue_plugins/components/pull_refresh/pull_refresh.vue'));
//     }, 'sys/plugins/vue_env');
// });
// <==



// 引入过滤器
import '../vue_plugins/filters/commons';
