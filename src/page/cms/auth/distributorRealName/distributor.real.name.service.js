export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //获取实名认证信息
    let queryrealname = 'api/q_real_name';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        //获取实名认证信息
        queryRealName() {
            return q(queryrealname);
        }
    }
}