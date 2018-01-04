export default (store) => {
    let _state = store.state;
    let _http = _state.$http;

    let ordersUrl = 'api/order_out/q_orders';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        shipOrderListIndex(keyword, outState, page) {
            let params = {
                keyword: keyword,
                outState: outState,
                page: page,
                limit: 10,
            }
            return q(ordersUrl, params);
        },
    };
}
