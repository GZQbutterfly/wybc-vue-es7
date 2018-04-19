// 配送界面 tabs（待抢单，待取货，配送中）

import { Component, Watch } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import Swiper from 'swiper';
import { timeout, interval } from 'common.env';

import { find } from 'lodash';


import { Rob } from '../tab/rob/rob';
import { Pickup } from '../tab/pickup/pickup';
import { Delivering } from '../tab/delivering/delivering';
import { SlideslipMenu } from '../sideslip_menu/sideslip_menu';
import { Notice } from '../notice/notice';
import { Loadding } from '../loadding/loadding';
import { Unauthorized } from '../unauthorized/unauthorized';

import { Tip } from '../tip/tip';


import service from '../delivery.service';


import './tabs.scss';
@Component({
    template: require('./tabs.html'),
    components: {
        'rob': Rob,
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
        { label: '待抢单', attr: 'robShow', refname: 'robRef', num: 0 },
        { label: '待取货', attr: 'pickupShow', refname: 'pickupRef', num: 0 },
        { label: '配送中', attr: 'deliveringShow', refname: 'deliveringRef', num: 0 }
    ];

    headerIndex = -1;

    deliveryVO = {
        robNum: 0,
        pickupNum: 0,
        deliveringNum: 0,
        lockNotice: false
    };

    robShow = false;
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
    noticeData = {};

    timer = 0;

    _eventSource;
    _$service;

    firstALert = true;

    mounted() {

        this.$store.state.deliveryVO = this.deliveryVO;

        this._$service = service(this.$store);

        this.$nextTick(() => {

            this.preWithTabsBd();

            this.initPage();


        });
    }

    // 处理tabs 内容体的高度异常
    preWithTabsBd() {
        // 在某些低版本的浏览器内核，导致父元素的高度，子元素不继承，现做以下处理
        timeout(() => {
            let _tabsCbdRef = this.$refs.tabsCbdRef;
            if (_tabsCbdRef && !_tabsCbdRef.offsetHeight) {
                _tabsCbdRef.style.height = _tabsCbdRef.parentElement.offsetHeight + 'px';
            }
        }, 10);
    }

    async initPage() {

        document.title = '配送单';

        this.renderSwiper();

        let _query = this.$route.query;

        this.setTabAction(_query.tabindex || 0);

        this._$service.queryDeliveryTabsNum();

        let _result = await this._$service.queryAuthResult({});
        // 配送员认证通过
        if (_result.checkState == 2) {
            // // 消息链接启动  
            this._eventSource = this._$service.robOrderEventSource('api/push_new_oder', { shopId: this.$store.state.workVO.user.userId }, (res) => {
                //console.log('sse data:', res.data);
                let _result = res.data;
                if (!_result || _result.errorCode) {
                    return;
                }

                // 获取抢单列表数据
                if (!this.tabindex && this.firstALert) {
                    this.firstALert = false;
                    let _list = this.$refs.robRef.getList();

                    let _isExist = find(_list, { combinOrderNo: _result.combinOrderNo });

                    if (_isExist) {
                        console.log('抢单列表存在这个数据： ', _result.combinOrderNo);
                        return;
                    }
                }

                this.noticeData = _result;
                // 弹出抢单dialog
                if (!this.noticeShow && !this.tipShow) {
                    this.alertNotice();
                    this.deliveryVO.lockNotice = true;
                } else {
                    // 还没显示推送单，不知道要不要放入队列中，这个是有时效的，放入队列好像不大好，故不放。
                }
            });
        }

    }

    renderSwiper() {
        let _self = this;
        this.swiper = new Swiper(this.$refs.bodyRef, {
            slidesPerView: 'auto',
            direction: 'horizontal',
            passiveListeners: false,
            resistanceRatio: 0,
            on: {
                slideChange() {
                    _self.swtichTab(null, this.activeIndex);
                }
            }
        });
    }

    swtichTab($event, index) {
        if (index != this.headerIndex) {
            this.setTabAction(index);
            this.$router.replace({ path: this.$route.name, query: { tabindex: index } })
        }
    }

    setTabAction(index = 0) {

        let item = this.tabs[index];
        this[item.attr] = true;
        this.swiper.slideTo(index);
        this.headerIndex = +index;

    }

    // 禁止touchmove
    noTouchMove(e) {
        e.preventDefault();
        return false;
    }

    // 右侧滑出菜单
    rightSlideOutMenu() {
        this.menuFirst = true;
        this.menuShow = !this.menuShow;
    }

    // 抢单dialog
    alertNotice(data) {
        if (this.authShow) {
            // 当前有弹框，等待下一波弹出
            return;
        }
        this.noticeFirst = true;
        this.noticeShow = !this.noticeShow;
        // 抢单数据触发
        if (data) {
            this.robData = data;
            this.alertTip();
            this.deliveryVO.lockNotice = true;
        } else {
            if (!this.noticeShow) {
                timeout(() => {
                    this.deliveryVO.lockNotice = false;
                }, 500);
            } else {
                // 更新tab 的数据集
                this.queryTabDatas();
            }
        }

    }
    // 请求当前tab的数据
    queryDatas() {
        if (this.loaddingShow) {
            // 正在努力加载
            return;
        }

        this.alertLoadding();

        this.queryTabDatas(() => {
            this.alertLoadding();
        });

        this._$service.queryDeliveryTabsNum();

    }

    queryTabDatas(fn = () => { }) {
        // 加载对应的tab的数据集
        let item = this.tabs[this.headerIndex];
        // 访问子组件方法
        timeout(() => {
            this.$refs[item.refname].refresh(fn);
        }, 200);
    }

    // loadding dialog
    alertLoadding() {
        this.loaddingFirst = true;
        this.loaddingShow = !this.loaddingShow;
    }

    // 认证dialog
    alertAuth() {
        this.authFirst = true;
        this.authShow = !this.authShow;
    }

    // 接单结果dialog
    alertTip(index) {
        this.tipFirst = true;
        this.tipShow = !this.tipShow;
        if (!this.tipShow) {
            this.swtichTab(null, index || 0);
            this.queryTabDatas();
            this._$service.queryDeliveryTabsNum();
            timeout(() => {
                this.deliveryVO.lockNotice = false;
            }, 500);
        }
    }

    // tab子组件触发该事件
    operation(tabName, data) {
        if (tabName === 'rob') {
            if (data.auth) {
                this.authData = data.authData;
                this.alertAuth();
                return;
            } else if (data.order) {
                this.robData = data.order;
                this.alertTip();
            }
            // this._$service.queryDeliveryTabsNum();
        } else {
            // this._$service.queryDeliveryTabsNum();
        }
    }

    beforeDestroy() {
        window.clearTimeout(this.timer);
        this._eventSource && this._eventSource.close();
    }

    /**
     * 监听 配送单数量，待抢单num, 待取货num， 配送中num
     * @param {*} newVal 
     * @param {*} olVal 
     */
    @Watch('deliveryVO', { immediate: true, deep: true })
    watchDeliveryVO(newVal, olVal) {
        let _tabs = this.tabs;
        _tabs[0].num = newVal.robNum;
        _tabs[1].num = newVal.pickupNum;
        _tabs[2].num = newVal.deliveringNum;
    }
}