/**
 * 限时购 商品列表
 * 
 * 限时秒杀页面模块说明：
 * 1.取最近的4个限时购时段分场；
 * 2.已结束或者已关闭的时段限时购分场不显示
 * 3.只显示进行中、即将开启的时段分场（当页面没有任何时段分场限时购时，点击或刷新弹窗提示：限时购活动未开启！）
 *   （回到首页 ）
 * 4.刷新逻辑
 * A.点击前端时段
 *    a.判断校区限时购是否开启（关闭则提示：限时购活动未开启！    我知道了（点击跳转至首页））
 *    b.（限时购活动开启）判定当前时段分场状态有效（进行中、即将开启）或者无效（已关闭、已结束）
 *             如果有效则刷新当前时段分场的商品
 *             如果无效则跳转到下一个时段刷新当前页面（没有任何时段则弹窗提示：限时购活动未开启！   我知道了（跳转至首页））
 * B.在前端时段分场中下拉刷新商品
 *    a.先判定限时购活动是否开启（关闭则提示：限时购活动未开启！    我知道了（点击跳转至首页））
 *    b.在判定当前时段分场是否有效（进行中/即将开启）
 *             如果有效则刷新当前时段分场的商品
 *             如果无效则跳转到下一个时段刷新当前页面（没有任何时段则弹窗提示：限时购活动未开启！   我知道了（跳转至首页））
 * C.重新进入或者右上角刷新：全部刷新（默认进入第一个时段分场）
 *    a.先判定限时购活动是否开启（关闭则提示：限时购活动未开启！    我知道了（点击跳转至首页））
 *    b.在判定所有时段分场是否有效，刷新所有商品
 */
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import Swiper from 'swiper';

import { debounce } from 'lodash';
import { timeout, getParentDomHeight, isNotLogin, toLogin } from 'common.env';

import { TimeLimitItem } from './item/item';


import service from '../timelimit.service';

import './list.scss';
@Component({
    template: require('./list.html'),
    components: {
        TimeLimitItem
    }
})
export class MoneyTimeLimitList extends BaseVue {


    timelist = [
        // { time: '08:00', action: true, createBody: true, index: 0 },
        // { time: '10:00', action: false, createBody: false, index: 1 },
        // { time: '14:00', action: false, createBody: false, index: 2 },
        // { time: '18:00', action: false, createBody: false, index: 3 },
        // { time: '22:00', action: false, createBody: false, index: 4 }
    ];

    activatedindex = 0;
    activeItem = {};

    showList = false;

    _$service;

    mounted() {

        document.title = '限时购';
        this._$service = service(this.$store);

     

        this._wdResult =  this.$store.dispatch('CHECK_WD_INFO') ;

        this.$nextTick(() => {
            this.initPage();
        });


        this.reloadTitle = debounce(() => {

            this.queryTitle().then((flag) => {
                if (!flag) { return };
                this.setCurrentTimeTab(this.activatedindex);
                timeout(() => {
                    let _itemUI = this.$refs.itemsRef[this.activatedindex];
                    _itemUI && _itemUI.refresh();
                }, 500);
            });

        }, 2000);

    }

    activated() {
        // document.title = '限时购';
    }

    initPage() {
        this.queryTitle().then(() => {
            if (this.timelist.length) {
                this.renderHeaderSwiper();
                this.renderBodySwiper();
            }
        });
    }


    activatedPeriodId = 0;

    async queryTitle() {
        this._wdinfo = await this._wdResult;
        let _result = (await this._$service.queryTimelimitListForTitle({ campusId: this._wdinfo.campusId })).data;
        if (!_result || _result.errorCode || !_result.periodList || !_result.periodList.length) {
            this.showList = false;
            this.notOpenTimeLimit();
            return false;
        } else {
            let _list = _result.periodList;
            let isAction = false;
            let len = _list.length;
            for (let i = 0; i < len; i++) {
                let _item = _list[i];
                _item.action = _item.state == 6; //  分场状态  5:未开始  6:进行中
                _item.time = _item.periodStart.substr(0, 5);
                _item.timeEnd = _item.periodEnd.substr(0, 5);
                if (_item.action && !isAction) {
                    this.activatedindex = i;
                    isAction = true;
                    _item.createBody = true;
                } else {
                    _item.createBody = false;
                }
            }
            if (len && !isAction) {
                // 不存在当前活动模块，默认创建第一个
                _list[0].createBody = true;
            }

            // 这里是 比较活动中的分场id
            if (this.activatedPeriodId) {
                for (let i = 0; i < len; i++) {
                    let _item = _list[i];
                    if (this.activatedPeriodId == _item.periodId) {
                        this.activatedindex = i;
                        break;
                    }
                }
            }

            this.showList = true;
            this.timelist = _list;
            this.activeItem = this.timelist[this.activatedindex];
            return true;
        }
    }

    renderHeaderSwiper() {
        let _self = this;
        _self.headerSwiper = new Swiper(this.$refs.timelistRef, {
            slidesPerView: 4,
            direction: 'horizontal',
            passiveListeners: false,
            resistanceRatio: 0,
            observer: true
        });
    }


    renderBodySwiper() {
        let _self = this;
        let _bodyRef = this.$refs.bodyRef;
        let _parenHeight = getParentDomHeight(_bodyRef);
        if (_bodyRef.offsetHeight < _parenHeight) {
            _bodyRef.style.height = _parenHeight + 'px';
        }
        _self.bodySwiper = new Swiper(_bodyRef, {
            initialSlide: _self.activatedindex,
            slidesPerView: 'auto',
            direction: 'horizontal',
            passiveListeners: false,
            resistanceRatio: 0,
            observer: true,
            on: {
                slideChange() {
                    _self.swtichSiblingSwiper('h', this.activeIndex);
                }
            }
        });
    }

    swtichSiblingSwiper(type, index) {
        let _self = this;
        if (type == 'b') {
            _self.bodySwiper.slideTo(index);
        } else {
            this.activatedindex = index;
            this.setCurrentTimeTab(index);
            _self.headerSwiper.slideTo(index);
        }
    }

    swtichTab(item, index) {
        if (index !== this.activatedindex) {
            this.swtichSiblingSwiper('b', index);
            this.setCurrentTimeTab(index);
            // console.log('您切换的时间 ：', item);
        }
    }

    setCurrentTimeTab(index) {
        let item = this.timelist[index];
        if (!item) {
            return;
        }
        this.activatedindex = index;
        this.activatedPeriodId = item.periodId;
        item.createBody = true;
    }

    dialogOpen = false;
    notOpenTimeLimit() {
        let _self = this;
        if (_self.dialogOpen) {
            return;
        }
        _self.showList = false;
        _self.dialogOpen = true;
        _self._$dialog({
            dialogObj: {
                title: '提示',
                type: 'info',
                content: '限时购活动尚未配置！',
                assistBtn: '',
                mainBtn: '知道啦',
                mainFn() {
                    _self.dialogOpen = false;
                    _self.$router.push('home');
                }
            }
        })
    }

    /**
     * 子集加载
     */
    childrenLoading(err) {
        // console.log('子集刷新中， 错误信息： ', err);
        // if (err) {
        //     this.notOpenTimeLimit();
        //     return;
        // }
        // 这里要刷新 时间段头部
        this.reloadTitle();
    }

    toRemind() {
        let notloginFlag = isNotLogin();
        // debugger;
        if (notloginFlag) {
            //未登录
            toLogin(this.$router, { toPath: 'money_timelimit_list' });
            return;
        }
        this.$router.push({ path: 'money_timelimit_remind' })
    }

}