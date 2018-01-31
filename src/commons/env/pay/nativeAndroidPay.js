import Vue from 'vue';
import { merge } from 'lodash';

import { bridge, callNative } from '../../bridge/bridge';

import { PayComponent } from './pay.component';
//
/**
 * iOS 原生pay
 */
export class NativeiOSPay {
    _$vm;
    _$store;
    _$router;
    _$state;
    _$user;
    _$http;
    constructor(_vm) {
        this._$vm = _vm;
        this._$store = _vm.$store;
        this._$state = this._$store.state;
        this._$user = this._$state.workVO.user;
        this._$http = this._$state.$http;
    }
    q(url, data) {
        return this._$http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    sign() {

    }
    dialog() {
        let _self = this;
        return new Promise((res, rej) => {
            let _dialog = new Vue({
                el: document.createElement('div'),
                data: {
                    listPays: [
                        { icon: 'icon-x-campaign-wechat pay-wecat', name: '微信支付', paymodel: 'wxpay' },
                        { icon: 'icon-rectangle390 pay-ali', name: '支付宝支付', paymodel: 'alipay' }
                    ],
                    selectPay(item) {
                        res(item);
                    },
                    closePay() {
                        res(null);
                    }
                },
                components: {
                    'app-pay': PayComponent
                },
                template: '<app-pay :listPays="listPays" :selectPay="selectPay" :closePay="closePay"></app-pay>'
            });
            Vue.nextTick(() => {
                document.body.appendChild(_dialog.$el);
            });
        });
    }
    /**
     *
     * @param {Object} data  对象数据{组合订单id}
     * @return  {Boolean}  true 代表已支付， false 代表未支付
     */
    pay(url, data) {
        let _self = this;
        data.url = url;
        return new Promise(async (resolve, reject) => {
            let item = await _self.dialog();
            if (item) {
                // item.paymodel  wxpay 微信支付； alipay 阿里支付；
                let _result = await _self[item.paymodel](url, data);
                // 支付订单结果获取后，进行支付next 
                // TODO 
                callNative("AndroidPay", data, function (rebackData) {
                    //网页回调返回  非支付返回
                    console.log('返回数据: ', rebackData);
                });
            } else {
                // 取消支付
                resolve(false);
            }
        });
    }
    wxpay(url, data) {
        return this.q(url, merge(data, { subPayType: 'APP', payType: 'WX' }));
    }
    alipay(url, data) {
        return this.q(url, merge(data, { subPayType: 'QUICK_MSECURITY_PAY', payType: 'ALI' }));
    }
}
