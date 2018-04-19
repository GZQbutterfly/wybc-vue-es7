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
     getCouponList(data){
         return q("api/activites/q_wd_order_coupons",data);
     }
    }
} 