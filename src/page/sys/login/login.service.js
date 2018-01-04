// ==>
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
        /**
         * 获取验证码
         * @param data {phone}
         */
        getSecurityCode(data) {
            return q('api/s_auth_code', data);
        },
        /**
         *  登录
         * @param data  {phone, code}
         */
        doLogion(data) {
            return q('api/c_auth_code', data);
        },
        doCacheLogin(data) {
            return q('api/cache_login', data);
        },
        /**
         * 获取微信帐号信息
         * @param data  {code}
         */
        getWecatInfo(data) {
            return q('api/g_wx_user', data)
        },
        setWxBind(data) {
            return q('api/wx_bind', data);
        }
    };
};
