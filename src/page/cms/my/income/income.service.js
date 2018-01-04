
export default (store) => {
    let _state = store.state;
    let _http = _state.$http;

    let queryincomelist = 'api/q_api_income';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        /**
         * 获取收益数据
         * @param data
         */
        queryIncomeList(data){
            return q(queryincomelist,data);
        }
    };
}
