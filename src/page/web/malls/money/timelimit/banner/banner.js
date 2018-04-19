/**
 * 限时购  首页banner
 * 限时购说明：
 * 1.页面显示3个半个商品
 * 2.商品可以左右滑动
 * 3.点击商品进入商品详情
 * 4.点击“- 限时购 -”进入限时购商品列表
 * 5.点击更多进入限时购页面
 * 6.开启时间：当客服端本地倒计时结束时（00:00:00），自动请求服务器，局部刷新前端页面（限时购页面内倒计时一样）
 * 7.结束时间：当客服端本地倒计时结束时（00:00:00），自动请求服务器，局部刷新前端页面（限时购页面内倒计时一样）
 */

import { Component, Vue } from 'vue-property-decorator';

import Swiper from 'swiper';


import { timeout, getCountDown, interval } from 'common.env';
import service from '../timelimit.service';

// import calendar from 'components/calendar/calendar.vue';

import './banner.scss';
@Component({
    template: require('./banner.html'),
    // components: {
    //     'calendar': calendar
    // }
})
export class MoneyTimeLimitBanner extends Vue {

    // calendar2 = {
    //     range: false,
    //     value: [2018, 3, 27], //默认日期
    //     lunar: false, //显示农历
    //     begin: [2017, 2, 16], //可选开始日期
    //     end: [2019, 2, 16], //可选结束日期
    //     select(begin, end) {
    //         // console.log(begin.toString(),end.toString());
    //     },
    //     timestamp: Date.now()
    // };
    list = [];

    showBanner = false;

    action = false;

    hour = 0;

    countDate = {
        hour: '00',
        minute: '00',
        second: '00'
    };
    _$service;

    mounted() {

        this._$service = service(this.$store);

        this._wdResult = this.$store.dispatch('CHECK_WD_INFO');

        this.$nextTick(() => {
            this.initPage();
            // this.intervalInit();
        });

    }

    initPage() {
        timeout(() => {
            this.queryTimelimitBanner().then(() => {
                this.renderSwiper();
                this.countDown();
            });
        });
    }

    async queryTimelimitBanner() {
        let _wdinfo = await this._wdResult;
        let _result = (await this._$service.queryTimelimitBanner({ campusId: _wdinfo.campusId })).data;
        // debugger;
        //限时购总开关   0:关闭  即不显示  1:开启
        if (!_result || _result.errorCode || _result.state != 1) {
            this.showBanner = false;
        } else {
            //periodState: 6,  //最近分场的状态   6:进行中  5:未开始
            this.action = _result.periodState == 6;
            this.hour = _result.periodStart; //开始时间  16点场
            this.overTime = _result.leftTimeStamp;//剩余时间或者即将开启时间的时间差
            this.list = _result.goodsList;//商品列表
            this.showBanner = true;
            this.periodId = _result.periodId;
        }
    }

    renderSwiper() {
        let _self = this;
        _self.swiper = new Swiper(this.$refs.bodyRef, {
            slidesPerView: 3.5,
            direction: 'horizontal',
            passiveListeners: false,
            resistanceRatio: 0,
            observer: true
        });
    }

    reInit() {
        this.queryTimelimitBanner().then(() => {
            this.countDown();
        });
    }

    toTimelimitList() {
        this.$router.push('money_timelimit_layout');
    }

    toGoodsDetail(goods) {
        // 传入时段信息，区分商品详情时段 数据
        this.$router.push({ path: 'money_timelimit_detail', query: { goodsId: goods.goodsId, periodId: this.periodId } })
    }

    countDown() {
        let _self = this;
        if (isNaN(+_self.overTime) || _self.overTime < 999) {
            return;
        }
        _self.overFlag = true;
        _self.diffHour();
        window.clearInterval(_self.timer);
        _self.timer = interval(() => {
            _self.overTime -= 1000;
            if (_self.overTime <= 500) {
                _self.overFlag = false;
                _self.countDate = { hour: '00', minute: '00', second: '00', day: '00' };
                window.clearInterval(_self.timer);
                // 倒计时结束， 重新请求 并刷新限时活动数据
                timeout(() => {
                    _self.reInit();
                }, 2000);
            } else {
                _self.diffHour();
            }
        }, 1000);
    }

    reTimer = 0;
    intervalInit() {
        let _self = this;
        _self.reTimer = interval(() => {
            _self.reInit();
        }, 5000);
    }


    diffHour() {
        let _result = getCountDown(this.overTime, 'h');
        this.countDate = { hour: _result.h, minute: _result.m, second: _result.s };
    }

    destroyed() {
        window.clearInterval(this.timer);
        window.clearInterval(this.reTimer);
    }

}