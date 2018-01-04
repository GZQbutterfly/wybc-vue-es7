import { isApp, isWeiXin } from 'common.env';

export default (store) => {
    let _state = store.state;
    let _http = _state.$http;


    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    return {
        queryUpInfo() {
            return q('api/wd_vip/tryToUp');
        },
        queryShopSteps() {
            return new Promise((resolve, reject) => {
                let datas = [
                    {
                        name: '缴纳保证金',
                        success: true,
                        isDeposit: false
                    },
                    // {
                    //     name: '晋级首进货',
                    //     success: false,
                    //     isReach: false
                    // },
                    {
                        name: '晋级成功',
                        success: false
                    }
                ];
                this.queryUpInfo().then((res) => {
                    let _result = res.data;
                    if (!_result.errorCode) {
                        if (_result.ifNeedBail) {
                            datas[0].value = _result.bail;
                        } else {
                            datas[1].value = _result.firstBuy;
                            datas[1].success = true;
                        }
                        resolve(datas);
                    }
                });
            });
        },
        queryPays() {
            let _datas = [
                {
                    src: '/static/images/minishop/zhifub.png',
                    type: 'alipay',
                    name: '支付宝支付',
                    checked: true
                },
                {
                    src: '/static/images/minishop/wechat.png',
                    type: 'wxpay',
                    name: '微信支付'
                }
            ];
            let datas = null;
            if (isWeiXin()) {
                let wxData = _datas[1];
                wxData.checked = true;
                datas = [wxData];
            } else if (isApp()) {
                datas = _datas;
            } else {
                datas = _datas[0];
            }
            return Promise.resolve(datas);
        },
        toPay(data, payType) {
            let _pay = _state.$pay;
            _pay._backUrl = data.url;
            return _pay.pay('api/wd_vip/wd_pay_bail', data, payType);
        }
    };
}
