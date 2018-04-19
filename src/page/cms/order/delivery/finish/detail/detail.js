// 已完成配送订单详情
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';


import { timeout } from 'common.env';

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
            { label: '已接单' },
            { label: '已取货' },
            { label: '成功送达' }
        ],
        stepIndex: 2,
        len: 2
    };

    orders = [];

    orderStatus = 'received'; // canceled  
    _$service;

    mounted() {
        this._$service = service(this.$store);

        this.$nextTick(() => {

            this.initPage();

        });
    }

    async initPage() {
        let _query  = this.$route.query;

        let _result = (await this._$service.queryDeliveryFinishDetail(_query)).data;

        //debugger;
        if(!_result || _result.errorCode){
            return;
        }
        
        this.data = _result.delivery;
        this.orders = _result.orders;
        if(_result.orders[0].consuType == 3){
            let _moneyPrice = _result.orders[0].number * _result.orders[0].goldPrice;
            if(_moneyPrice > _result.orders[0].totalGold){
                let _number = _result.orders[0].totalGold / _result.orders[0].goldPrice; //使用金币抵扣的数量
                let _obj = JSON.parse(JSON.stringify(_result.orders[0]));
                _obj.number = _result.orders[0].number - _number;
                _obj.consuType = 2;
                _obj.moneyPrice = _obj.purchasePrice;
                _result.orders[0].number = _number;
                this.orders.push(_obj);
            }
        }
        //  10 取消，  11 完成
        if(_query.deliveryState == 10){
            this.orderStatus = 'canceled';
        }

    }

    refresh(done) {
        let _self = this;
        setTimeout(() => {
            done(true);
        }, 500);
    }

    infinite(done) {
        let _self = this;
        done(true);
    }

}