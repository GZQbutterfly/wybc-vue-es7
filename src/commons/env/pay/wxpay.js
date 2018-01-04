import Vue from 'vue';
import { merge } from 'lodash';

import { wxAppid, getAuthUser } from 'common.env';


import { PayComponent } from './pay.component';

//
const wx = require('weixin-js-sdk');

const appid = wxAppid;

/**
 * 微信支付类
 */
export class WxPay  {
     _$vm;
     _$store;
     _$router;
     _$state;
     _$user;
     _$http;
     _$host;
     _$payData = {
        payType: 'WX',
        subPayType: 'JSAPI',
        openid: '',
        appid: ''
    };
    _openid;
    constructor(_vm) {
        this._$vm = _vm;
        this._$store = _vm.$store;
        this._$state = this._$store.state;
        this._$user = this._$state.workVO.user;
        this._$http = this._$state.$http;
        this._$host = this._$state.host;
        this._openid = getAuthUser().openid;
        // console.log('浏览器环境:  微信');
    }
    q(url, data) {
        return this._$http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    /**
     * 获取签名
     */
    sign() {
        let _self = this;
        return new Promise((rs, rj) => {
            _self.q('api/wx/g_signature', { url: location.href }).then((res) => {
                if (res['errorCode']) {
                    rs(res);
                    return;
                }
                let _data = res.data;
                _self._$state.wxops = _data;
                rs(res);
                // 支付签名
                wx.config({
                    debug: _data.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: appid, // 必填，公众号的唯一标识
                    timestamp: _data.timestamp, // 必填，生成签名的时间戳
                    nonceStr: _data.noncestr, // 必填，生成签名的随机串
                    signature: _data.signature, // 必填，签名，见附录1
                    jsApiList: [
                        'hideMenuItems',
                        'showMenuItems',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'hideAllNonBaseMenuItem',
                        'showAllNonBaseMenuItem',
                        'chooseWXPay',
                        'chooseImage'
                    ]
                });
            });
        })
    }
    dialog() {
        let _self = this;
        return new Promise((res, rej) => {
            let _dialog = new Vue({
                el: document.createElement('div'),
                data: {
                    listPays: [
                        { icon: 'icon-x-campaign-wechat pay-wecat', name: '微信支付', paymodel: 'wxpay' }
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
     * 微信端支付
     * @param url 本地服务地址
     * @param data 提交数据对象
     * @param payType 给与时不用dialog选择支付类型
     * @return  {boolean}  true 代表已支付， false 代表未支付
     */
    pay(url, data, payType) {
        let _self = this;
        _self._$payData.openid = this._openid;
        _self._$payData.appid = appid;
        return new Promise((res, rej) => {
            let _fn = () => {
                _self.q(url, merge(data, _self._$payData, true)).then((response) => {
                    let _data = response.data;
                    if (!_data.errorCode) {
                        _self.chooseWXPAY(_data).then((result) => {
                            res(result);
                        }).catch((result) => {
                            res(result);
                        });
                    }else{
                        _self._$state.$dialog({
                            dialogObj:{
                                title: '提示',
                                content: _data.msg || '服务异常！',
                                type: 'error',
                                mainBtn: '知道啦',
                                mainFn() { }
                            }
                        });
                        res(null);
                    }
                });
            }
            if (payType) {
                _fn();
            } else {
                _self.dialog().then((item) => {
                    if (item) {
                        _fn();
                    } else {
                        res(false);
                    }
                });
            }
        });
    }
    chooseWXPAY(_data) {
        return new Promise((res) => {
            wx.chooseWXPay({
                // 公众号名称，由商户传入
                appId: appid,
                // 时间戳
                timestamp: _data.timeStamp,
                // 随机串
                nonceStr: _data.nonceStr,
                // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                package: _data.package,
                // 微信签名方式：
                signType: _data.signType, //"MD5",
                // 微信签名
                paySign: _data.sign,
                success: payRes => {
                    //支付成功
                    res(true);
                },
                cancel: cancelRes => {
                    res(false);
                },
                error: errRes => {
                    res(true);
                }
            });
        });
    }
    /**
    * 非微信端支付，跳转到微信端支付
    * @return  {boolean}  true 代表已支付， false 代表未支付
    */
    webPay(url, data) {
        let _self = this;
        _self._$payData.subPayType = 'MWEB';
        return new Promise((res, rej) => {
            _self.q(url, merge(data, _self._$payData)).then((response) => {
                let _result = response.data;
                if (!_result.errorCode) {
                    let _backUrl = _self._backUrl;
                    let _href = null;
                    if (_backUrl) {
                        _href = encodeURIComponent(`${location.origin}${_backUrl}`);
                    } else {
                        _href = encodeURIComponent(`${location.origin}/order_detail?orderId=${data.orderId}`);
                    }
                    location.href = `${_result.mweb_url}&redirect_url=${_href}`;
                    //res(true);
                } else {
                    _self._$state.$dialog({
                        dialogObj:{
                            title: '提示',
                            content: _result.msg || '服务异常！',
                            type: 'error',
                            mainBtn: '知道啦',
                            mainFn() { }
                        }
                    })
                    res(null);
                }
            });
        });
    }
}
