

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //获取提现列表数据
    let querywithdrawsdata =   'api/q_api_withdraw';

    function q(url, data){
        return  _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return{

        /**
         * 获取提现列表数据
         */
        queryWithdrawsData(){
            return q(querywithdrawsdata,{});
        },

    }

}
