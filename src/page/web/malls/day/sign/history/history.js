import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';


import calendar from 'components/calendar/calendar.vue';

import service from '../sign.service';

import './history.scss';
@Component({
    template: require('./history.html')
})
export class DaySignHistory extends BaseVue {

    list = [];
    _$service;

    showContent = false;

    daysCount = 0;

    goldTotal = 0;

    mounted() {
        this._$service = service(this.$store);
    }

    activated() {
        document.title = '签到记录';
        this.$nextTick(() => {
            this.queryHistoryList();
        });
    }

    async queryHistoryList() {
        let _result = (await this._$service.querySignDays({ type: 2 })).data;
        if (_result && !_result.errorCode) {
            let _signRecordList = _result.signRecordList || [];
            let _newList = [];
            let _goldTotal = 0;
            let _signCount = 0;

            for (let i = 0, len = _signRecordList.length; i < len; i++) {
                let _item = _signRecordList[i];
                let _signTime = (_item.getTime ? _item.getTime : _item.signTime) + '';
                let _dateSplits = _signTime.split(' ');
                let _goldNum = (+_item.awardInfo) || 0;
                let _type = _item.getTime ? 1 : 0;
                _newList.push({
                    date: _dateSplits[0],
                    time: _dateSplits[1],
                    datetime: _signTime,
                    goldNum: _goldNum,
                    type: _type,
                    count: (+_item.daysCount) || 0
                });
                // !_type && (_signCount++);
                // _goldTotal += _goldNum;
            }

            _newList.sort((b, a) => {
                return a.datetime.replace(/\D/g, '') - b.datetime.replace(/\D/g, '');
            });

            this.list = _newList;
            this.daysCount = (+_result.signCount) || 0;
            this.goldTotal = (+_result.awardTotal) || 0;
        }
        this.showContent = true;
    }

}