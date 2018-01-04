

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //获取客服信息列表
    let getallhelper =   'api/staff/q_staffs';

    function q(url, data){
        return  _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return{

        /**
         * 获取客服信息列表
         */
        queryAllHelper(){
            return q(getallhelper,{});
        },

    }

}
