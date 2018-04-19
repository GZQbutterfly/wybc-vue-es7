import Vue from 'vue';



import '../../commons/config/module';

import '../../commons/assets/swiper/swiper.css';
Object.assign = require('object.assign')
//import 'video.js/dist/video-js.css';

// 礼包组件
import { GiftPack } from './malls/coupon/gift_pack/gift_pack';

Vue.component('gift-pack', GiftPack);