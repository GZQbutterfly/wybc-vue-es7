// 已完成配送订单详情
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { get, isArray } from 'lodash';

import { timeout, getCountDown, interval } from 'common.env';

import service from '../finish.service';

import './detail.scss';

@Component({
    template: require('./detail.html')
})
export class Detail extends BaseVue {


    data = {};

    takeImgSrc = require('../../../../../../static/images/delivery/q.png');

    giveImgSrc = require('../../../../../../static/images/delivery/s.png');

    pointImgSrc = require('../../../../../../static/images/delivery/jiantou.png');

    orderDetailImgSrc = require('../../../../../../static/images/delivery/xiangqing.png');

    orderInfoImgSrc = require('../../../../../../static/images/delivery/bianhao.png');

    stepsOption = {
        steps: [
            { label: '配送中' },
            { label: '成功送达' }
        ],
        stepIndex: 0,
        len: 1
    };

    orderStatusStrs = ['配送店长正在配送.......', '店长配送员确认订单已送达！'];
    orderStatusStr = '配送店长正在配送.......';
    orderStatusIndex = 0; // 0 配送中  配送完成

    timeStatus = 0; // 1  

    countDate = {
        hour: '00',
        minute: '00',
        second: '00'
    };

    firstTime = '11：30';

    lastTime = '10：30';

    isOnTime = false;
    
    deliveryTime = 0;
    finishTime = 0;
    overTime = 0;

    orders = [];
    _$service;

    mounted() {
        this._$service = service(this.$store);

        this.initPage();

    }

    async initPage() {
        let _query = this.$route.query;

        let _result = (await this._$service.queryDeliveryFinishDetail(_query)).data;

        //debugger;
        if (!_result || _result.errorCode) {
            return;
        }
        this.phonenumber = get(_result, 'delivery.buyerPhone');
        this.data = _result.delivery;
        this.orders = _result.orders;
        // 
        if (this.data.deliveryState == 1) {
            this.orderStatusIndex = 0;
            this.overTime = _result.leftTime;
            this.deliveryTime = _result.deliveryTime;
            // 配送中 倒计时 走起
            this.countDown();
        } else {
            this.orderStatusIndex = 1;
            this.finishTime = _result.finishTime;
            this.deliveryTime = _result.deliveryTime;
            // 是否准时
            this.isOnTime = (('' + _result.finishTime).replace(/\D/g, '') - ('' + _result.deliveryTime).replace(/\D/g, '') < 0);
        }

        if (isArray(this.orders)) {
            let total = 0;
            for (let i = 0, len = this.orders.length; i < len; i++) {
                let _order = this.orders[i];
                total += _order.number * _order.moneyPrice;
            }
            this.data.totalMoney = total;
        }
        this.data.punishMent = _result.punishMent;
        this.stepsOption.stepIndex = this.orderStatusIndex;
        this.orderStatusStr = this.orderStatusStrs[this.orderStatusIndex];
    }

    timer = 0;

    overFlag = false;
    overTime = 10000;
    countDown() {
        let _self = this;
        if (isNaN(+_self.overTime) || _self.overTime <= 999) {
            return;
        }
        _self.overFlag = true;
        _self.diffHour();
        _self.timer = interval(() => {
            _self.overTime -= 1000;
            if (_self.overTime <= 999) {
                _self.overFlag = false;
                _self.countDate = { hour: '00', minute: '00', second: '00', day: '00' };
                window.clearInterval(_self.timer);
            } else {
                _self.diffHour();
            }
        }, 999);
    }
    diffHour() {
        let _result = getCountDown(this.overTime, 'h');
        this.countDate = { hour: _result.h, minute: _result.m, second: _result.s };
    }

    destroyed() {
        window.clearInterval(this.timer);
    }

    mapPhone = {};

    phonenumber = '';

    // 联系买家
    async callClick() {
        let _self = this;
        let item = _self.data;

        let combinOrderNo = item.combinOrderNo;

        if (!_self.phonenumber) {
            let _result = (await _self._$service.queryBuyerPhone({ combinOrderNo })).data;
            if (_result && !_result.errorCode) {
                _self.phonenumber = get(_result, 'contact.userPhone');
            }
        }


        //_self.phonenumber = '2333333'; // test

        if (_self.phonenumber) {
            this.mapPhone[combinOrderNo] = _self.phonenumber;
            item.__phone = _self.phonenumber;
            timeout(() => {
                _self.$refs.callRef.click();
            }, 10);
        } else {
            _self.phonenumber = '';
            _self.alertDialog({
                title: '提示',
                type: 'info',
                content: '无法联系买家！',
                assistBtn: '',
                mainBtn: '知道啦',
                mainFn() {
                }
            });
        }
    }

    // 确认到达
    async mainClick() {

        let item = this.data;

        let _flag = await this.confirmDialog();
        if (!_flag) {
            return;
        }

        // console.log('确认到达', item);

        let _result = (await this._$service.confirmationOfDelivery({ combinOrderNo: item.combinOrderNo })).data;
        if (!_result || _result.errorCode) {
            this.alertDialog({
                title: '提示',
                type: 'error',
                content: '抱歉！系统服务出错, 请稍后再试。',
                mainBtn: '知道啦',
                mainFn() { }
            });
        } else {
            this.initPage();
        }
    }

    confirmDialog() {
        let _self = this;
        return new Promise((reslove) => {
            _self.alertDialog({
                title: '提示',
                type: 'info',
                content: '是否确认送达？',
                assistBtn: '取消',
                mainBtn: '确认',
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