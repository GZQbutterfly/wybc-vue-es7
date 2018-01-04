export default (store) => {
    let _http = store.state.$http;

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    // ==>
    return {
        //
        queryInviteCode() {
            return q('api/wd_vip/myInviteCode');
        },
        queryCurrentLevel(data) {
            return q('api/wd_vip/myGrade', data).then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return {};
                } else {
                    return _result;
                }
            });
        },
    };
};
