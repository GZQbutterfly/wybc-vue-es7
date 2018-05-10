import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './syspaylist.service';
import {
    wxAppid,
    isWeiXin,
    getAuthUser,
    qs,
    baseURL,
    getLocalUserInfo,
    isNativeiOS,
    isNativeAndroid
} from 'common.env';

const wx = require('weixin-js-sdk');

import './syspaylist.scss';


@Component({
    template: require('./syspaylist.html'),
})


export class SysPayList extends BaseVue {

    toPath;

    isWx = true;

    selectPayType = 'WX';

    query = {};

    _$service;

    orderPayType = null;

    contentVisit = true;

    isNative = false;
    mounted() {
        document.title = "支付方式";
        this.isWx = isWeiXin();
        this.query = this.$route.query;
        this.submitType = this.query.submitType;
        this.toPath = this.query.toPath;
        this.isNative = (isNativeAndroid()||isNativeiOS());
        this.orderPayType = this.query.orderPayType;
        this._$service = service(this.$store);
    }

    chooseWxPay() {
        this.selectPayType = 'WX';
    }

    chooseAliPay() {
        this.selectPayType = 'ALI';
    }

    payOrder() {
        if (this.selectPayType == "WX") {
            if (this.isWx) {
                this.payOrderWxJS();
            } else {
                this.payOrderWXH5();
            }
        } else if (this.selectPayType == "ALI") {
            this.payOrderAli();
        } 
    }

    payOrderAli(url) {
        if (this.isNative) {
            this.payOrderNativeAli();
        }else{
            let _self = this;
            let user = getLocalUserInfo();
            let _data = {
                payType: 'ALI',
                subPayType: "QUICK_WAP_WAY",
                userId: user.userId,
                token: user.token,
                combinOrderNo: this.query.combinOrderNo,
                orderId: this.query.orderId
            }
            location.href = baseURL + 'api/order/pay_order' + '?' + qs.stringify(_data) + '&_pay=alipay';
        }
    }

    payOrderNativeAli(){
        let _param = {
            combinOrderNo: this.query.combinOrderNo,
            payType: 'ALI',
            subPayType: 'QUICK_MSECURITY_PAY',
        }
        let _self = this;
        this._$service.payOrder(_param)
        .then(res=>{
            if (!res.data||res.data.errorCode) {
                let dialogObj = {
                    title: '提示',
                    content: res.data.msg ? res.data.msg : '系统错误',
                    assistBtn: '',
                    type: 'info',
                    mainBtn: '确定',
                    assistFn() {},
                    mainFn() {
                        _self.$router.replace({path:"home"});
                    }
                }
                _self.$store.state.$dialog({
                    dialogObj
                });
            }else{
                res.paymodel = 'alipay';
                window.wybcJSBridge.api.iOSPay(res,function(reciveData){
                    console.log('调用原生支付')
                });
            }
        })
    }

    payOrderWxJS() {
        let _param = {
            combinOrderNo: this.query.combinOrderNo,
            payType: 'WX',
            subPayType: 'JSAPI',
            openid: getAuthUser().openid,
            appid: wxAppid,
        }
        
        let loadding = this.$store.state.$loadding();
        let _self = this;
        this._$service.payOrder(_param)
            .then(res => {
                let _data = res.data;
                if (!_data || _data.errorCode) {
                    let dialogObj = {
                        title: '提示',
                        content: _data.msg ? _data.msg : '系统错误',
                        assistBtn: '',
                        type: 'info',
                        mainBtn: '确定',
                        assistFn() {},
                        mainFn() {
                            loadding.close();
                            _self.$router.replace({ path: "home" });
                          
                        }
                    }
                    _self.$store.state.$dialog({
                        dialogObj
                    });
                    return;
                }
                wx.chooseWXPay({
                    // 公众号名称，由商户传入
                    appId: _data.appId,
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
                        if (_self.orderPayType != null) {
                            _self.rebateGold();
                        } else {
                            _self.$router.replace({
                                path: "user_order",
                                query: {
                                    listValue: 0
                                }
                            });
                        }
                        loadding.close();
                    },
                    cancel: cancelRes => {
                        _self.$router.replace({
                            path: "user_order",
                            query: {
                                listValue: 1
                            }
                        });
                        loadding.close();
                    },
                    error: errRes => {
                        _self.$router.replace({
                            path: "user_order",
                            query: {
                                listValue: 1
                            }
                        });
                        loadding.close();
                    }
                });
            });
    }

    payOrderWXH5() {
        let _param = {
            combinOrderNo: this.query.combinOrderNo,
            payType: 'WX',
            subPayType: 'MWEB',
            openid: getAuthUser().openid,
            appid: wxAppid,
        }

        let _self = this;
        this._$service.payOrder(_param)
            .then(res => {
                let _result = res.data;
                if (!_result.errorCode) {
                    let _backUrl = _self.toPath;
                    let _href = null;
                    if (_backUrl) {
                        _href = encodeURIComponent(`${location.origin}${_backUrl}`);
                    } else {
                        _href = encodeURIComponent(`${location.origin}/user_order`);
                    }
                    location.href = `${_result.mweb_url}&redirect_url=${_href}`;
                } else {
                    _self._$state.$dialog({
                        dialogObj: {
                            title: '提示',
                            content: _result.msg || '服务异常！',
                            type: 'error',
                            mainBtn: '知道啦',
                            mainFn() {}
                        }
                    })
                }
            });
    }

    rebateGold() {
        let _params = {
            combinOrderNo: this.query.combinOrderNo,
            orderPayType: this.orderPayType,
        }
        let _self = this;
        this._$service.getRebateGold(_params)
            .then(res => {
                if (!res || !res.data || res.data.gold == 0) {
                    _self.$router.push({
                        path: "user_order",
                        query: {
                            listValue: 0
                        }
                    });
                } else {
                    let dialogObj = {
                        title: '提示',
                        content: '恭喜您下单成功，获得' + res.data.gold + '金币',
                        assistBtn: '',
                        type: 'success',
                        mainBtn: '确定',
                        assistFn() {},
                        mainFn() {
                            _self.$router.push({
                                path: "user_order",
                                query: {
                                    listValue: 0
                                }
                            });
                        }
                    };
                    _self.contentVisit = false;
                    _self.$store.state.$dialog({
                        dialogObj
                    });
                }
            })
    }

}