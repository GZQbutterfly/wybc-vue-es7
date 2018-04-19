export default (store) => {
    let _state = store.state;
    let _http = _state.$http;
    let _cache = _state.cache;
    let _key = 'my_spread';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    // ==>
    return {
        //
        async queryInviteCode() {
            let _code = _cache[_key + '_code'];
            if (!_code) {
                let _result = (await q('api/wd_vip/myInviteCode')).data;
                if (_result && !_result.errorCode) {
                    _code = _result;
                    _cache[_key + '_code'] = _code;
                }
            }
            return _code;
        },
        queryCurrentLevel(data) {
            return q('api/wd_vip/myGrade', data).then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return {};
                } else {
                    return _result;
                }
            });
        },
    };
};
