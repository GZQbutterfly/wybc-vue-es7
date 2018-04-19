import { getLocalUserInfo, baseURL, formHttp } from 'common.env';

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //增加配送员认证信息
    let dosave = 'api/a_shoper_delivery_check';
    //查询
    let querydistributorrealname = 'api/q_shoper_delivery_check';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    
    return {
        //增加配送员认证信息
        save(data) {
            return formHttp(dosave, data);
        },
        //获取配送员认证信息
        queryDistributorRealName() {
            return q(querydistributorrealname);
        },
    };

};
