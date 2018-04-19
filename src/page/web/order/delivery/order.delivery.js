import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import orderDetailService from './order.delivery.service';

import { toLogin, getZoneData } from 'common.env';
import { error } from 'util';

require('./order.delivery.scss');

@Component({ template: require('./order.delivery.html') })

export class OrderDelivery extends BaseVue {
    _$service;
    orderDeliveryInfo = { deliveryState: [] };
    mounted() {
        document.title = '配送详情';
        this._$service = orderDetailService(this.$store);
        this.init();
    }
    init() {
        let _orderId = this.$route.query.orderId;
        let _combinOrderNo = this.$route.query.combinOrderNo;
        let _data = {};
        if (_orderId) {
            _data.orderId = _orderId
        } else {
            _data.combinOrderNo = _combinOrderNo
        }
        let _self = this;
        _self._$service.orderDelivery(_data).then(res => {
            let _result = res.data;
            if (!_result || _result.errorCode) {
                let dialogObj = {
                    title: '提示',
                    content: _result.msg,
                    assistBtn: '',
                    mainBtn: '确定',
                    type: 'error',
                    assistFn() {
                    },
                    mainFn() {
                    }
                }
                _self.$store.state.$dialog({ dialogObj });
            } else {
                _self.orderDeliveryInfo = _result;
                _self.orderDeliveryInfo.deliveryState = _result.data.reverse();
            }

        })
    }
    refresh(done) {
        setTimeout(() => {
            this.init();
            done(true)
        }, 300);
    }
}