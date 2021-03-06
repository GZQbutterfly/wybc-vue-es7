import Vue from 'vue';

// 外部组件 ==>
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import VueProgressiveImage from 'vue-progressive-image';
import VueVideoPlayer from 'vue-video-player';
import VueLazyload from 'vue-lazyload';
import VueForm from 'vue-form';

Vue.use(Vuex);
Vue.use(VueRouter);


// 渐进式图片加载

Vue.use(VueProgressiveImage, {
    delay: 100,
    blur: 10
});

// 图片懒加载

Vue.use(VueLazyload);

// 视频播放
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

// import minirefresh from 'components/minirefresh/minirefresh.vue';
import scroller from 'components/scroller/scroller.vue';

// import steps from 'components/steps/steps.vue';

// 下拉刷新上拉加载
Vue.component('scroller', scroller);

// Vue.component('minirefresh', minirefresh);

Vue.component('app-banner',BannerComponent);

Vue.component('app-container', ContainerComponent);

Vue.component('pull-refresh', PullRefresh);



// Vue.component('app-steps', steps);



// 引入过滤器
import '../vue_plugins/filters/commons';

import '../vue_plugins/directives';
