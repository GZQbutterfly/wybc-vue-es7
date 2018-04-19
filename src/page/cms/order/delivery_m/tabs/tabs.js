// 配送界面 tabs（待抢单，待取货，配送中）

import { Component, Watch } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { timeout, interval } from 'common.env';
import { find } from 'lodash';

import { Delivering } from '../tab/delivering/delivering';
import { SlideslipMenu } from '../sideslip_menu/sideslip_menu';

import { Loadding } from '../loadding/loadding';



import service from '../delivery.service';


import './tabs.scss';
@Component({
    template: require('./tabs.html'),
    components: {
        'delivering': Delivering,
        'slideslip-menu': SlideslipMenu,
        'loadding': Loadding
    }
})
export class DeliveryTabs extends BaseVue {

    tabs = [
        { label: '待抢单', attr: 'robShow', refname: 'robRef', num: 0 },
        { label: '待取货', attr: 'pickupShow', refname: 'pickupRef', num: 0 },
        { label: '配送中', attr: 'deliveringShow', refname: 'deliveringRef', num: 0 }
    ];

    headerIndex = -1;

    menuShow = false;
    menuFirst = false;

    loaddingShow = false;
    loaddingFirst = false;

    isOpenFast = false;

    ifHasInfo = false;

    _$service;

    mounted() {

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

        document.title = '店长配送';

        let _query = this.$route.query;

        //"state": 1    //开启状态   1:开启   2:关闭  
        let _result = (await this._$service.checkShopDeliveryInfo()).data;
        if (_result && _result.ifHasInfo) {
            this.ifHasInfo = true;
            this.isOpenFast = [1, true, 'true'].includes(_result.state);
        }

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


    }

    queryTabDatas(fn = () => { }) {
        // 访问子组件方法
        timeout(() => {
            this.$refs.deliveringRef.refresh(fn);
        }, 200);
    }

    // loadding dialog
    alertLoadding() {
        this.loaddingFirst = true;
        this.loaddingShow = !this.loaddingShow;
    }


    beforeDestroy() {
        window.clearTimeout(this.timer);
        this._eventSource && this._eventSource.close();
    }

    async openFastInventory() {
        if (!this.ifHasInfo) {
            // 预判断店长是否设置了配送电话 ，没有 引导期设置
            let flag = await this.confirmDialog('您的店铺没有设置配送信息，请先设置配送信息！', '去设置');
            flag && this.$router.push({ path: 'faststore_info', query: { from: 'delivery_m_order' } });
            return;
        }
        let flag = await this.confirmDialog('确认' + (this.isOpenFast ? '关闭' : '开启') + '快速仓?');
        if (flag) {
            if (this.isOpenFast) {
                // 执行关闭
                console.log("执行关闭");
            } else {
                // 执行开启
                console.log("执行开启");
            }
            //1:开启快速仓   2:关闭快速仓
            this._$service.changeFastDeliveryState({ state: this.isOpenFast ? false : true })
            this.isOpenFast = !this.isOpenFast;
        }
    }


    confirmDialog(msg = '', mainBtnStr = '确认') {
        let _self = this;
        return new Promise((reslove) => {
            _self.alertDialog({
                title: '提示',
                type: 'info',
                content: msg,
                assistBtn: '取消',
                mainBtn: mainBtnStr,
                assistFn() {
                    reslove(false);
                },
                mainFn() {
                    reslove(true);
                }
            })

        });
    }

    alertDialog(dialogObj) {
        this._$dialog({ dialogObj });
    }

}