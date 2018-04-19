
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let checkStateUrl = 'api/check_fast_delivery_state';
    let queryDeliverUrl = 'api/q_shop_deliveryInfo';
    let submitUrl = 'api/u_shop_deliveryInfo';
    let getCodeUrl = 'api/shop_deli_get_code';
    let checkPhoneUrl = 'api/check_shopDeliv_phone';


    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    return {

        //检测该店主是否填写店长配送信息
        /** */
        async checkFastDeliveryState() {
            let _result = (await q(checkStateUrl)).data;
            if (!_result || _result.errorCode) {
                return  {};
            }
            return _result;
        },
        async queryDeliverierInfo() {
            let _result = (await q(queryDeliverUrl)).data;
            if (!_result || _result.errorCode) {
                return  null;
            }
            return _result;
        },
        getPhoneCode(data) {
            return q(getCodeUrl,data);
        },
        submitDeliverierInfo(param) {
            return q(submitUrl,param);
        },
        checkPhone(data){
            return q(checkPhoneUrl,data);
        }
    };
}
