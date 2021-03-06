export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //获取邀请码信息
    let queryinvitationcode = 'api/wd_vip/hasInvited';
    //随机得到一个有效的邀请码
    let queryrandomcode = 'api/wd_vip/noInvited';
    //查询用户是否已经开店
    let queryuserhasshop = 'api/wd_vip/ifHasWd';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        /**
         * 获取邀请码信息
         */
        queryInvitationCode(incode) {
            return q(queryinvitationcode, { invitationCode: incode });
        },

        /**
         * 查询用户是否已经开店
         */
        queryUserHasShop() {
            return q(queryuserhasshop, {});
        },

        /**
         * 获取邀请关系中上级邀请码
         */
        queryParentCode(data){
            return q('api/wd_vip/q_invited_user_info',data);
        },
        /**
         * 随机得到一个有效的邀请码
         */
        queryRandomCode(query) {
            let data = {
                campusName: query.school,
                campusId: query.campusId
            }
            return q(queryrandomcode, data);
        }

    }

}
