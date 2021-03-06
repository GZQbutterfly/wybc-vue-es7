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
        getCouponList(url, query) {
            query.type = 1;
            return q(url, query);
        }
    }
};
