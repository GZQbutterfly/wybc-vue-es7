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
        queryUpInfo(data) {
            return q('api/wd_vip/check_if_upGrade', data);

            // return {
            //     data: {
            //         "flag": 1,
            //         // errorCode: 109,
            //         // msg: "处理中  请稍后刷新界面..."
            //     }
            // };

        },
        queryShopSteps() {
            return [
                {
                    name: '缴纳保证金',
                    success: true,
                    isDeposit: true
                },
                {
                    name: '晋级成功',
                    success: true
                }
            ];
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
