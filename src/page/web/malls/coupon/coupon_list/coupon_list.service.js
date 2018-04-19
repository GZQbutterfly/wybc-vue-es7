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
        getUserCoupons(data){
            // data.userId = 757;
            return q("api/activites/q_user_coupons",data);
        }
    }
} 