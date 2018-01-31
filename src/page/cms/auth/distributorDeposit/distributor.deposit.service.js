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
        
        queryPays() {
            let _datas = [
                {
                    src: '/static/images/minishop/wechat.png',
                    type: 'wxpay',
                    name: '微信支付'
                },
                {
                    src: '/static/images/minishop/zhifub.png',
                    type: 'alipay',
                    name: '支付宝支付',
                    checked: true
                }
            ];
            let datas = null;
            if (isWeiXin()) {
                let wxData = _datas[0];
                wxData.checked = true;
                datas = [wxData];
            } else if (isApp()) {
                datas = _datas;
            } else {
                datas = _datas[1];
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
