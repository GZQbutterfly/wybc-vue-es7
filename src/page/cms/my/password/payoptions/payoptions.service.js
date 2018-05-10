
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    
    return {
        queryPasswordState() {
           return  q('api/user_pay/q_wallet_pay_password_status');
        },
        queryLockState() {
            return  q('api/user_pay/check_wallet_pay_is_lock');
         }
    };
}
