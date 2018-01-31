// 配送界面 tabs（待抢单，待取货，配送中）

import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import Swiper from 'swiper';
import { timeout, interval } from 'common.env';


import { RobOrder } from '../tab/rob/rob';
import { Pickup } from '../tab/pickup/pickup';
import { Delivering } from '../tab/delivering/delivering';
import { SlideslipMenu } from '../sideslip_menu/sideslip_menu';
import { Notice } from '../notice/notice';
import { Loadding } from '../loadding/loadding';
import { Unauthorized } from '../unauthorized/unauthorized';

import { Tip } from '../tip/tip';


import sse from '../delivery.sse';

import './tabs.scss';
@Component({
    template: require('./tabs.html'),
    components: {
        'rob': RobOrder,
        'pickup': Pickup,
        'delivering': Delivering,
        'slideslip-menu': SlideslipMenu,
        'notice': Notice,
        'loadding': Loadding,
        'unauthorized': Unauthorized,
        'tip': Tip
    }
})
export class DeliveryTabs extends BaseVue {
    tabs = [
        { label: '待抢单', attr: 'robShow' },
        { label: '待取货', attr: 'pickupShow' },
        { label: '配送中', attr: 'deliveringShow' }
    ];
    headerIndex = 0;

    robShow = true;
    pickupShow = false;
    deliveringShow = false;

    menuShow = false;
    menuFirst = false;

    noticeShow = false;
    noticeFirst = false;

    loaddingShow = false;
    loaddingFirst = false;

    authShow = false;
    authFirst = false;

    tipShow = false;
    tipFirst = false;

    robData = {};

    timer = 0;

    _eventSource;
    mounted() {
        this.$nextTick(() => {
            // this.$refs.tabsRef.style.minHeight = document.body.offsetHeight + 'px';
            this.preWithTabsBd();
            this.initPage();

        });
    }

    preWithTabsBd() {
        // 在某些低版本的浏览器内核，导致父元素的高度，子元素不继承，现做以下处理
        timeout(() => {
            let _tabsCbdRef = this.$refs.tabsCbdRef;
            if (_tabsCbdRef && !_tabsCbdRef.offsetHeight) {
                _tabsCbdRef.style.height = _tabsCbdRef.parentElement.offsetHeight + 'px';
            }
        }, 10);
    }

    initPage() {
        document.title = '配送单';
         this.renderSwiper();
        //this.alertNotice();

        // 消息链接启动
        this._eventSource = sse().sent('http://localhost:8844/stream', { shopId: 110 }, (res) => {
            console.log('sse data:', res);
            let _result = res.data;
            if(_result.errorCode){
                return;
            }
            if(!this.noticeShow){
                this.alertNotice();
            }
        });
    }

    renderSwiper() {
        let _self = this;

        this.swiper = new Swiper(this.$refs.bodyRef, {
            slidesPerView: 'auto',
            direction: 'horizontal',
            passiveListeners: false,
            resistanceRatio: 0,
            on: {
                slideChangeTransitionEnd() {
                    _self.swtichTab(null, this.activeIndex);
                }
            }
        });
    }


    swtichTab($event, index) {
        if (index !== this.headerIndex) {
            let item = this.tabs[index];
            this.headerIndex = index;
            this[item.attr] = true;
            this.swiper.slideTo(index);
        }
    }

    noTouchMove(e) {
        e.preventDefault();
        return false;
    }

    toMenu() {
        this.menuFirst = true;
        this.menuShow = !this.menuShow;
    }

    alertNotice(data) {
        if (this.authShow || this.tipShow || this.loaddingShow) {
            // 当前有弹框，等待下一波弹出
            return;
        }
        this.noticeFirst = true;
        this.noticeShow = !this.noticeShow;
        // 抢单数据触发
        if (data) {
            this.robData = data;
            this.alertTip();
        }
    }
    // 请求当前tab的数据
    queryDatas() {
        if (this.loaddingShow) {
            // 正在努力加载
            return;
        }
        if (this.headerIndex) {

        }
        this.alertLoadding();

        timeout(() => {
            this.alertLoadding();
        }, 2000);

    }

    alertLoadding() {
        this.loaddingFirst = true;
        this.loaddingShow = !this.loaddingShow;
    }

    alertAuth() {
        this.authFirst = true;
        this.authShow = !this.authShow;
    }

    alertTip() {
        this.tipFirst = true;
        this.tipShow = !this.tipShow;
    }

    robOperation(data) {

        if (data.auth) {
            this.alertAuth();
        } else if (data.order) {
            this.robData = data.order;
            this.alertTip();
        }
    }

    beforeDestroy() {
        window.clearTimeout(this.timer);
        this._eventSource.close();
    }
}