export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;


    //获取订单详情
    let orderinfourl = 'api/order/q_order_delivery_log';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        orderDelivery(data) { return q(orderinfourl, data) }
    }

}