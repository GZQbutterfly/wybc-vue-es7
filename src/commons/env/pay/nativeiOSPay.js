import Vue from 'vue';
import { merge } from 'lodash';


import { PayComponent } from './pay.component';
import {bridge} from '../../bridge/bridge';

//
/**
 * iOS 原生pay
 */
export class NativeiOSPay   {

    sign() {
        return Promise.resolve(null);
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
     * @param data  对象数据
     * @return  {boolean}  true 代表已支付， false 代表未支付
     */
    pay(url, data) {
        let _self = this;
        let _pay = null;
        alert('原生pay');
        return new Promise((resolve, reject) => {
            _self.dialog().then((item) => {
                if (item) {
                    // 选择支付方式
                    data.paymodel = paymodel;
                    data.url = url;
                    alert('原生pay item',item);
                    bridge.callNative('iOSPay',data,function(data){
                        alert('支付返回 ',data);
                    })
                } else {
                    // 取消支付
                    resolve(false);
                }
            });
        });
    }
}
