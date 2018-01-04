
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let _cache = _state.cache;
    let _key = 'sys.address.zone';

    function q(url, data) {
        return _http({
            data: data,
            url:  url,
            method: 'post'
        });
    }
    // ==>
    return {
        async querySchoolZone(){
            let _list = _cache[_key];
            let _result = null;
            if(!_list){
                _result = (await q('api/q_api_campus_msg')).data;
                if(_result.errorCode){
                    _list = [];
                }
                _list = _result.data;
            }
           return _list;
        },
        // 添加物流地址
        // url:api/a_address
        createAddress(data) {
            return q('api/address/a_address', data);
        },
        // 修改物流地址
        // url:api/u_address
        updateAddress(data) {
            return q('api/address/u_address', data);
        },
        deleteAddress(data) {
            return q('api/address/d_address', data);
        }
    };
}
