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
        queryCoupon(query){
            return q('api/activites/q_single_coupon',query);
        },
        getGoodsList(data){
            return q('api/activites/q_goods_byCouponId',data);
        }
    }
};
