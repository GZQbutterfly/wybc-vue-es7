export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //获取实名认证信息
    let queryrealname = 'api/q_real_name';
    //查询配送员认证信息
    let querydistributorrealname = 'api/q_shoper_delivery_check';

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
        },
        
        //获取配送员认证信息
        queryDistributorRealName() {
            return q(querydistributorrealname);
        },

    }
}