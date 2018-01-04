

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
    // ==>
    return {
        queryOrderMessage(_pageData) {
            //_pageData.infoId = _state.workVO.user.userId;
            return q('api/wd_vip/q_user_msg', _pageData);
        },
        updOrderMessageStatus(data){
            return q('api/wd_vip/r_user_msg', data);
        },
        queryCMSOrderMessage(_pageData) {
            _pageData.infoId = _state.workVO.user.userId;
            return q('api/wd_vip/q_wd_msg', _pageData);
        },
        updCMSOrderMessageStatus(data){
            return q('api/wd_vip/r_wd_msg', data);
        }
    };
}
