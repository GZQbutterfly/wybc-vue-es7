
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
        checkPassword(data) {
           return  q('api/user_pay/check_pay_password',data);
        }
    };
}
