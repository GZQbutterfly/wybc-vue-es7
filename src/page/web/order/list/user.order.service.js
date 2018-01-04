export default (store) => {
    let _state = store.state;
    let _http = _state.$http;

    let codeurl = 'api/order/q_orders';
    let bannerUrl = 'api/q_store_ads';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        getOrderList(data) {
            data.userId = _state.workVO.user.userId;
            data.token = _state.workVO.user.token;
            return q(codeurl, data);
        },
        getOrderBanner() {
            return q(bannerUrl, { posId: 3 });
        }
    };
}
