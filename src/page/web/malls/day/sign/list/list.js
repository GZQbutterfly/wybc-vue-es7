/**
 * 每日签到
 */
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { get } from 'lodash';

import { timeout } from 'common.env';

import calendar from 'components/calendar/calendar.vue';
import { Popup } from '../popup/popup';

import service from '../sign.service';

import './list.scss';
@Component({
    template: require('./list.html'),
    components: {
        'calendar': calendar,
        'sign-popup': Popup
    }
})
export class DaySignList extends BaseVue {

    calendar2 = {};

    showCalender = false;

    list = [
        // { num: 5, imgsize: 's', total: 2, get: true },
        // { num: 20, imgsize: 's', total: 14, get: false },
        // { num: 50, imgsize: 'l', total: 30, get: false }
    ];

    showList = false;
    userSign = {
        signType: 0 // 0 ： 未签到 ； 1： 已签到
    };

    createPopup = false;

    showPopup = false;

    signPopup = 'sign';

    _$service;


    data() {

        let date = new Date();

        return {
            toDay: date,
            currentMoth: date.getMonth() + 1,
            currentDay: date.getDate()
        }
    }

    mounted() {
        this._$service = service(this.$store);

        this.$nextTick(() => {
            this.querySignSwitchStatus();
        });
    }

    activated() {
        document.title = '每日签到';
    }

    /**
     * 查询签到开关
     */
    async querySignSwitchStatus() {
        let _result = (await this._$service.querySignSwitchStatus()).data;
        //签到开关：0：关闭 1：开启
        if (!_result || _result.errorCode || !_result.success || _result.status != 1) {
            this.notOpenDaySign();
            return;
        }
        this.queryUserSignStatus();
    }

    async queryUserSignStatus() {
        let _result = (await this._$service.querySignStatus()).data;
        if (!_result || _result.errorCode) {
            this.notOpenDaySign(_result.msg);
            return;
        }
        let _userSign = this.userSign;
        _userSign.signType = [true, 'true', 1].includes(_result.state) ? 1 : 0;  //用户今日签到状态 true:已签到，false:未签到
        _userSign.goldNum = get(_result, 'signRulesDay.awardInfo');
        // 查询签到记录
        this.querySignDays();
        this.querySignAwardList();
    }

    async querySignDays() {
        let _result = (await this._$service.querySignDays({ type: 1 })).data;
        let _newList = [];
        if (_result && !_result.errorCode) {
            let _signRecordList = _result.signRecordList || [];
            for (let i = 0, len = _signRecordList.length; i < len; i++) {
                _newList.push(_signRecordList[i].day);
            }
        }
        this.renderCalendar(_newList);
    }

    renderCalendar(list = []) {
        this.showList = true;
        timeout(() => {
            this.calendar2 = {
                range: false,
                signDays: list
            };
            this.showCalender = true;
        });
    }

    daysCount = 0;
    async querySignAwardList() {
        let _result = (await this._$service.querySignAwardList()).data;
        if (!_result || _result.errorCode) {
            return;
        }
        let _signAwardDaysList = _result.signAwardDaysList || [];
        let _newList = [];
        let _count = (+_result.signCount) || 0;
        for (let i = 0, len = _signAwardDaysList.length; i < len; i++) {
            let _item = _signAwardDaysList[i];
            if (_item.is_get) {
                // 已领取的不显示
                continue;
            }
            _newList.push({
                goldNum: _item.awardInfo,
                imgname: this.getGoldImgName(_item.awardInfo),
                total: _item.daysCount,
                get: _item.is_get,
                count: _count,
                signRulesId: _item.daysSignRulesId
            });
        }
        this.daysCount = _count;
        this.list = _newList;
    }

    getGoldImgName(num) {
        // 1 几个金币  （5个以下）      
        // 2 一堆金币  （5-10个）     
        // 3 一袋金币  （10-100个）   
        // 4 一箱金币  （100个）以上
        if (num >= 100) {
            return 'yixiang';
        } else if (num >= 10) {
            return 'yidai';
        } else if (num >= 5) {
            return 'coin2';
        }
        return 'coin1'
    }
    popupInfo = {};
    /**
     * 签到
     */
    async signin() {
        let _userSign = this.userSign;
        if (!_userSign.signType && !_userSign._loadding) {
            _userSign._loadding = true;
            let _result = (await this._$service.setSignIn()).data;
            // _result = {"bsSignRulesDay":{"daySignRulesId":261,"day":4,"awardType":0,"awardInfo":12,"awardName":"金币"},"signCount":1,"success":true,"sinceDay":1};
            if (!_result || _result.errorCode) {
                this.popupInfo = { success: false, msg: get(_result, 'msg') };
                _userSign._loadding = false;
            } else {
                // {"bsSignRulesDay":{"daySignRulesId":261,"day":4,"awardType":0,"awardInfo":100,"awardName":"金币"},"signCount":1,"success":true,"sinceDay":2}
                let _bsSignRulesDay = _result.bsSignRulesDay || {};
                this.popupInfo = { success: true, num: _result.signCount, count: _result.sinceDay, gold: _bsSignRulesDay.awardInfo };
                _userSign.signType = 1;
                this.daysCount++;
                this.calendar2.signDays.push(this.currentDay);
            }
            this.triggerPopup();
        }
    }
    /**
     * 领取累积金币奖励
     */
    async getGold(item) {
        if (!item.get && this.daysCount >= item.total && !item._loadding) {
            item._loadding = true;
            let _result = (await this._$service.getSignGold({ signRulesId: item.signRulesId })).data;
            if (!_result || _result.errorCode) {
                this.popupInfo = { success: false, msg: get(_result, 'msg') };
                // item._loadding = false; // 重新请求累积签到 奖励 
                this.querySignAwardList();
            } else {
                this.popupInfo = { success: true, gold: item.goldNum };
                item.get = true;
            }
            this.signPopup = 'getgold';
            this.createPopup = true;
            this.showPopup = !this.showPopup;
        }
    }

    triggerPopup() {
        this.signPopup = 'sign';
        this.createPopup = true;
        this.showPopup = !this.showPopup;
    }

    notOpenDaySign(msg) {
        let _self = this;
        if(_self.$route.name != 'day_sign_list'){
            return;
        }
        _self._$dialog({
            dialogObj: {
                title: '提示',
                type: 'info',
                content: msg || '每日任务暂未开启！',
                assistBtn: '',
                mainBtn: '知道啦',
                mainFn() {
                    _self.dialogOpen = false;
                    _self.$router.back();
                }
            }
        });
    }
}