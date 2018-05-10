
export default (store) => {
    let _state = store.state;
    let _http = _state.$http;

    let queryteamlist = 'api/wd_vip/q_sub_wd';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        /**
         * 查询某个等级的下级数据
         */
        queryTeamList() {
            let data = {
                userId: _state.workVO.user.userId,
                token: _state.workVO.user.token,
                page:1,
                limit:10000
            }
            return q(queryteamlist, data);
        },
    };
}
