export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    
    //获取订单详情
    let orderinfourl = 'api/order_out/q_ks_order_detail';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        /**
         * 查询订单详情
         */
        getOrderInfo(data) {
            return q(orderinfourl, data);
        },
    }
}
