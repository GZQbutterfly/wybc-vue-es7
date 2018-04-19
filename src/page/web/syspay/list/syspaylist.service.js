
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
    
    return {
        payOrder(data){
            return q('api/order/pay_order',data);
        },
        getRebateGold(data){
            return q("api/wallet/q_gold_by_Order",data);
        }
    };
}
