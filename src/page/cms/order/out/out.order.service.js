export default (store) => {
    let _state = store.state;
    let _http = _state.$http;

    let ordersUrl = 'api/order_out/q_orders';
    let quickOrderUrl = 'api/order_out/q_ks_orders';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        shipOrderListIndex( rebateState, page) {
            let params = {
                rebateState: rebateState,
                page: page,
                limit: 10,
            }
            return q(ordersUrl, params);
        },
        queryQuickOrdersData(data){
            return q(quickOrderUrl,data);
        }
    };
}
