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

    //是否支持钱包支付
    wallet = true;

    selectPayType = 'WX';

    query = {};

    _$service;

    userMoney = 0;

    walletAvible = true;

    orderPayType = null;

    contentVisit = true;

    isNative = false;

    mounted() {
        this.isWx = isWeiXin();
        this.query = this.$route.query;
        this.toPath = this.query.toPath;
        this.orderPayType = this.query.orderPayType;
        this._$service = service(this.$store, this.payOrderUrl);
        if (this.query.wallet != null) {
            this.wallet = this.query.wallet;
        }

        this.isNative = (isNativeAndroid()||isNativeiOS());
        let _self = this;
        this.$nextTick(async () => {
            document.title = "支付方式";
            let _result = (await _self._$service.queryWallet()).data;
            _self.userMoney = _result.money;
            _self.walletAvible = (_self.userMoney > _self.query.totalMoney);
        })
    }

    chooseWxPay() {
        this.selectPayType = 'WX';
    }

    chooseAliPay() {
        this.selectPayType = 'ALI';
    }

    chooseWallet() {
        if (!this.walletAvible){
            return ;
        }
        this.selectPayType = 'SYS';
    }

    payOrder() {
        if (this.selectPayType == "WX") {
            if (this.isWx) {
                this.payOrderWxJS();
            } else {
                this.payOrderWXH5();
            }
        } else if (this.selectPayType == "ALI") {
            this.payOrderAli(this.payOrderUrl);
        } else if (this.selectPayType == "SYS") {
            let _self = this;
            this._$service.queryPasswordState()
            .then(res=>{
                let _result = res.data;
                if (_result && !_result.errorCode) {
                    if (!_result.status){
                        let dialogObj = {
                            title: '提示',
                            content: '未设置支付密码',
                            assistBtn: '',
                            type: 'info',
                            mainBtn: '设置',
                            assistFn() {},
                            mainFn() {
                                _self.toSetPassword();
                            }
                        }
                        _self.$store.state.$dialog({
                            dialogObj
                        });
                    }else{
                        _self.payOrderWallet();
                    }
                }else {
                    let dialogObj = {
                        title: '提示',
                        content: _result.msg ? _result.msg : '系统错误',
                        assistBtn: '',
                        type: 'info',
                        mainBtn: '确认',
                        assistFn() {},
                        mainFn() {}
                    }
                    _self.$store.state.$dialog({
                        dialogObj
                    });
                }
            })
        }
    }

    toSetPassword(){
        let _stilquery = {
            toPay: true,
            orderSign: this.query.sign,
            orderTotalMoney: this.query.totalMoney,
            combinOrderNo: this.query.combinOrderNo
        }
        this.$router.replace({
            path: 'password',
            query: _stilquery
        });
    }

    payOrderWallet() {
        let _self = this;
        let _query = this.query;
        _query.userMoney = this.userMoney;
        let _param = {
            combinOrderNo: this.query.combinOrderNo,
            payType: 'SYS',
        }
        this._$service.payCMSOrder(_param)
            .then(res => {
                let _data = res.data;
                if (_data && _data.errorCode==250) {
                    let dialogObj = {
                        title: '提示',
                        content:'钱包被锁定',
                        assistBtn: '取消',
                        type: 'info',
                        mainBtn: '找回密码',
                        assistFn() {},
                        mainFn() {
                            _self.toSetPassword();
                        }
                    }
                    _self.$store.state.$dialog({
                        dialogObj
                    });
                }else if (!_data || _data.errorCode) {
                    let dialogObj = {
                        title: '提示',
                        content: _data.msg ? _data.msg : '系统错误',
                        assistBtn: '',
                        type: 'info',
                        mainBtn: '确定',
                        assistFn() {},
                        mainFn() {}
                    }
                    _self.$store.state.$dialog({
                        dialogObj
                    });
                    return;
                } else {
                    let _sign = _data.sign;
                    _query.sign = _sign;
                    this.$router.replace({
                        path: 'sys_pay',
                        query: _query
                    })
                }
            })
    }

    payOrderAli() {
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
            location.href = baseURL + 'api/order_whole/pay_order' + '?' + qs.stringify(_data) + '&_pay=alipay';
        }
        
    }

    payOrderNativeAli(){
        let _param = {
            combinOrderNo: this.query.combinOrderNo,
            payType: 'ALI',
            subPayType: 'QUICK_MSECURITY_PAY',
        }
        let _self = this;
        this._$service.payCMSOrder(_param)
        .then(res=>{
            if (!res.data||res.data.errorCode) {
                let dialogObj = {
                    title: '提示',
                    content: res.data.msg ? res.data.msg : '系统错误',
                    assistBtn: '',
                    type: 'info',
                    mainBtn: '确定',
                    assistFn() {},
                    mainFn() {}
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
        let _self = this;
        this._$service.payCMSOrder(_param)
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
                        mainFn() {}
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
                        _self.$router.replace({path:"cms_stock_order",query:{listValue:0}});
                    },
                    cancel: cancelRes => {
                        _self.$router.replace({path:"cms_stock_order",query:{listValue:1}});
                    },
                    error: errRes => {
                        _self.$router.replace({path:"cms_stock_order",query:{listValue:1}});
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
        this._$service.payCMSOrder(_param)
            .then(res => {
                let _result = res.data;
                if (!_result.errorCode) {
                    let _backUrl = _self.toPath;
                    let _href = null;
                    if (_backUrl) {
                        _href = encodeURIComponent(`${location.origin}${_backUrl}`);
                    } else {
                        _href = encodeURIComponent(`${location.origin}/cms/#/cms_stock_order`);
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
}