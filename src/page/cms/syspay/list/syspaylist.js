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
    getLocalUserInfo
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

    mounted() {
        this.isWx = isWeiXin();
        this.query = this.$route.query;
        this.toPath = this.query.toPath;
        this.orderPayType = this.query.orderPayType;
        this._$service = service(this.$store, this.payOrderUrl);
        if (this.query.wallet != null) {
            this.wallet = this.query.wallet;
        }
        let _self = this;
        this.$nextTick(async () => {
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
            this.payOrderWallet();
        }
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

    payOrderAli(url) {
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
        location.href = baseURL + url + '?' + qs.stringify(_data) + '&_pay=alipay';
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
                        _self.$router.replace({path:"cms_stock_order",query:{listValue:2}});
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