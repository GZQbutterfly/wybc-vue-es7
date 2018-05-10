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
            query.type = 1;
            return q('api/activites/q_single_coupon',query);
        },
        getGoodsList(data){
            data.type = 1;
            debugger;
            return q('api/activites/q_goods_byCouponId',data);
        }
    }
};
