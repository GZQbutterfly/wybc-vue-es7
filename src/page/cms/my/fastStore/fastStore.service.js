
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let changeStateUrl = 'api/change_fast_delivery_state';


    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    // ==>
    return {

        //检测该店主是否填写店长配送信息
        /** */
        changeState(data) {
           return  q(changeStateUrl,data);
        },
        checkFastDeliveryState(){
            return q('api/check_fast_delivery_state');
        }
    };
}
