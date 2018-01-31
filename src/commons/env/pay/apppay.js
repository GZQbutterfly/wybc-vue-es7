import Vue from 'vue';
import { merge } from 'lodash';
import { PayComponent } from './pay.component';
// 集成 微信， 支付宝  支付
import { WxPay } from './wxpay';
import { AliPay } from './alipay';
import { resolve } from 'path';

/**
 * 移动端支付类
 */
export class AppPay   {
     _$vm;
     _$store;
     _$router;
     _$state;
     _$user;
     _$http;
     _$host;
     _$payData = {
        payType: 'ALI',
    };
     _pays = {};
    constructor(_vm) {
        this._$vm = _vm;
        this._$store = _vm.$store;
        this._$state = this._$store.state;
        this._$user = this._$state.workVO.user;
        this._$http = this._$state.$http;
        this._$host = this._$state.host;
        this._pays.alipay = new AliPay(_vm);
        this._pays.wxpay = new WxPay(_vm);
        // console.log('浏览器环境:  移动端');
    }
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
     * @param payType  支付类型，给与时不用dialog选择支付类型
     * @return  {boolean}  true 代表已支付， false 代表未支付
     */
    pay(url, data, payType) {
        let _self = this;
        let _pay = null;
        return new Promise((resolve, reject) => {
            if (payType) {
                _pay = _self.webPay(payType);
                // 去支付
                _pay.webPay(url, data).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            } else {
                _self.dialog().then((item) => {
                    if (item) {
                        // 选择支付方式
                        _pay = _self.webPay(item.paymodel);
                        // 去支付
                        _pay.webPay(url, data).then((res) => {
                            resolve(res);
                        }).catch((err) => {
                            reject(err);
                        });
                    } else {
                        // 取消支付
                        resolve(false);
                    }
                });
            }
        });
    }
    webPay(payType) {
        //console.log(this._pays[payType].webPay);
        let _self = this;
        let pay = _self._pays[payType];
        pay._backUrl = _self._backUrl;
        return pay;
    }
}
