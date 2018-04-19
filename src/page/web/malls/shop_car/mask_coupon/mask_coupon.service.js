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
        getCarCoupon(data) {
            return q("api/activites/q_cart_coupons", data);
        },
        queryCouponInfo(data){
            return q("api/activites/q_goods_couponInfo", data);
        }
    }
} 