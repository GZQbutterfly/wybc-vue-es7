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
        getCMSCouponList(data) {
            data.type =1;
            return q('api/activites/q_user_coupons', data);
        }
    };
}
