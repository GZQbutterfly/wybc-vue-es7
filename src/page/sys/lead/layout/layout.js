// 引导页面
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { timeout, isNotLogin } from 'common.env';
// isNotLogin
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
        if (!this._valid && isNotLogin()) {
            this.$router.push('/');
            return;
        }

        this.showStr = this._valid ? 'visible' : 'hidden';

        this._$service = service(this.$store);
        this.$nextTick(() => {

            this.updateWxShare({ hideAllItem: true });

            this.initPage();
        });
    }

    async initPage() {

        // 获取 浏览店铺 足迹
        await this.queryHistory();

        // 获取 推荐店铺
        await this.queryRecommendShop();



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

    queryHistory() {
        let _self = this;
        _self._$service.queryHistory().then((_list) => {
            _self.scope.historyList = _list;
            if (_list.length) {
                if (_self._valid) {
                    _self.showStr = 'visible';
                    timeout(() => {
                        _self.renderSwiper();
                    });
                } else {
                    _self.toHome(_list[0]);
                }
            } else {
                _self.showStr = 'visible';
            }
        });
    }

    queryRecommendShop() {
        this._$service.queryRecommendShop().then((_list) => {
            this.scope.recommendList = _list;
        });
    }

    toSearch() {
        sessionStorage.removeItem('search_shop_cache');
        this.$router.push('lead_search');
    }

    toHome(item) {

        let shopId = item.infoId || item.shopId;
         // 进入页面首页时，将该店铺信息写入缓存
        let localWdInfo = localStorage.wdVipInfo ? JSON.parse(localStorage.wdVipInfo) : {};
        localStorage.wdVipInfo = JSON.stringify(Object.assign(localWdInfo, item));
        
        if (shopId) {
            this.$router.push({ path: 'home', query: { shopId, from: 'lead' } });
        } else {
            this.$router.push({ path: 'home', query: { from: 'lead' } });
        }
    }

    imgError(e) {
        e.target.src = this.defaultUserImg;
    }

}