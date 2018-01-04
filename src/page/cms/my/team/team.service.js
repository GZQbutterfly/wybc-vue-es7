export default (store) => {
    let _state = store.state;
    let _http = _state.$http;

    let queryteamdata = 'api/wd_vip/q_my_team';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        queryTeamData() {
            let data = {
                infoId: _state.workVO.user.userId,
                token: _state.workVO.user.token,
            }
            return q(queryteamdata, data);
        },
    };
}
