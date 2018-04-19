
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
        changePassword(data) {
           return  q('changePasswordUrl',data);
        },
        queryImgCode(data){
            return q('api/c_img_code',data);
        },
        getSecurityCode(data) {
            return q('api/user_pay/s_auth_code', data);
        },
        checkCodeAvible(data){
            return q('api/user_pay/check_phone_verification_code',data);
        }
    };
}
