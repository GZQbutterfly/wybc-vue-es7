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
        async queryInviteCode() {
            let _result = (await q('api/wd_vip/myInviteCode')).data;              
            return _result;
        },
    }
}