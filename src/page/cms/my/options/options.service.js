
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    // ==>
    return {
        checkFastDeliveryState(){
            return q('api/check_fast_delivery_state');
        }
    };
}
