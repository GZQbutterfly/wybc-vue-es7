import axios from 'axios';

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //获取提现详情
    let getwithdrawinfo = 'api/q_api_withdraw_by_withdrawId';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        /**
         * 获取提现详情
         */
        getWithdrawInfo(id) {
            let data = {
                withdrawId: id
            }
            return q(getwithdrawinfo, data);
        },

    }

}
