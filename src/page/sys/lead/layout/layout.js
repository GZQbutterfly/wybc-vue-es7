// 引导页面
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { timeout, isNotLogin } from 'common.env';

import { isEmpty } from 'lodash';

import Swiper from 'swiper';

import ShopBox from 'components/shop_box/shop.box';

import service from './layout.service';

// 预加载web首页页面数据
require.ensure([], require => { }, 'web/malls/malls');

import './layout.scss';
@Component({
    template: require('./layout.html'),
    components: {
        'shop-box': ShopBox
    }
})
export class Layout extends BaseVue {
    defaultUserImg = '/static/images/pic-login.png';
    posterImg = require('../../../../static/images/lead/kuaizhao.jpg');
    scope = {
        propagandaImg: '/static/images/lead/tu1.png',
        shopImg: '/static/images/lead/tu2.png',
        zujiIcon: require('../../../../static/images/lead/zuji.png'),
        tuijianIcon: require('../../../../static/images/lead/tuijian.png'),
        historyList: [],
        recommendList: []
    };
    _valid = false;
    showStr = 'hidden';
    _$service;
    mounted() {

        this._valid = this.$route.query.valid;

        this.showStr = this._valid ? 'visible' : 'hidden';

        this._$service = service(this.$store);
        this.$nextTick(() => {
            this.initPage();
        });
    }

    async initPage() {
        let login = !isNotLogin();
        let flag = true;
        // 获取 浏览店铺 足迹
        if (login) {//未登录状态足迹为空
            flag = await this.queryHistory();
        } else if (!this._valid) {
            // 未登录状态 检测缓存店铺信息 进入缓存店铺
            let localWdInfo = await this.$store.getters.GET_WD_INFO();
            // console.log('店铺信息 ', localWdInfo, isEmpty(localWdInfo));
            if (!isEmpty(localWdInfo)) {
                this.toHome(localWdInfo);
                return;
            }
        }
        // 获取 推荐店铺
        flag && await this.queryRecommendShop();
    }

    renderSwiper() {
        this.swiper = new Swiper(this.$refs.foothistoryRef, {
            spaceBetween: 10,
            slidesOffsetBefore: 12,
            slidesOffsetAfter: 12,
            slidesPerView: 1.4,
            resistanceRatio: 0,
            //freeMode: true,
            direction: 'horizontal',
            observer: true,
            observeParents: true
        });
    }

    async queryHistory() {
        let _self = this;
        let _list = await _self._$service.queryHistory()
        _self.scope.historyList = _list;
        if (_list.length) {
            if (_self._valid) {
                timeout(() => {
                    _self.renderSwiper();
                });
            } else {
                _self.toHome(_list[0]);
                return false;
            }
        }
        return true;
    }

    queryRecommendShop() {
        this._$service.queryRecommendShop().then((_list) => {
            this.scope.recommendList = _list;
            this.showStr = 'visible';
        });
    }


    toSearch() {
        sessionStorage.removeItem('search_shop_cache');
        this.$router.push('lead_search');
    }

    toHome(item) {

        let shopId = item.infoId || item.shopId;

        let routerAttr = this._valid ? 'push' : 'replace';

        this.$router[routerAttr]({ path: 'home', query: { shopId, from: 'lead' } });
    }

    imgError(e) {
        e.target.src = this.defaultUserImg;
    }

}