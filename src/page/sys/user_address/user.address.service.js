
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

    // ==>
    return {
        // 8.查询所有物流地址
        queryAddressList() {
            return q('api/address/q_addresses');
        }
    };
}
