import Vue from 'vue';
import { merge } from 'lodash';
import { qs, baseURL, getLocalUserInfo } from 'common.env';
import { PayComponent } from './pay.component';

let appid = process.env.NODE_ENV == 'development' ? '2017082208323174' : '2017082208323174';

/**
 * 支付宝支付类
 */
export class AliPay   {
     _$vm;
     _$store;
     _$router;
     _$state;
     _$user;
     _$http;
     _$host;
     _$payData = {
        payType: 'ALI'
    };
    // 手机支付打开支付宝
     _webHost = 'https://openapi.alipay.com/gateway.do'; // https://mapi.alipay.com/gateway.do  https://openapi.alipay.com/gateway.do
     _webDevHost = 'https://openapi.alipaydev.com/gateway.do';
    constructor(_vm) {
        this._$vm = _vm;
        this._$store = _vm.$store;
        this._$state = this._$store.state;
        this._$user = this._$state.workVO.user;
        this._$http = this._$state.$http;
        this._$host = this._$state.host;
        // console.log('浏览器环境:  支付宝');
    }
    q(url, data) {
        return this._$http({
            data: data,
            url: url,
            method: 'post'
        });
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
    pay() {
        return Promise.resolve(null);
    }
    /**
     * 手机网页支付接口
     * 服务端返回支付宝页面，由页面自己跳到支付宝客户端
     */
    webPay(url, data) {
        // 手机网页支付接口
        let _self = this;
        let user = getLocalUserInfo();
        data.payType = this._$payData.payType;
        data.userId = user.userId;
        data.token = user.token;
        data.subPayType = "QUICK_WAP_WAY"; 
        location.href = baseURL + url + '?' + qs.stringify(data) + '&_pay=alipay';
    }
}
