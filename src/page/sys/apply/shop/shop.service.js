import { merge } from 'lodash';

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //得到邀请码的信息
    let querycodeinfo = 'api/wd_vip/hasInvited';
    //注册店
    let wdregister = 'api/wd_vip/wdRegister';
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
         * 查询用户是否已经开店
         */
        queryUserHasShop() {
            return q(queryuserhasshop, {});
        },

        /**
         * 得到邀请码的信息
         */
        queryCodeInfo(incode) {
            let data = {
                invitationCode: incode
            }
            return q(querycodeinfo, data);
        },

        /**
         * 申请开店
         * @param res 申请开店数据
         */
        wdRegister(res) {
            let data = merge({}, res);
            let reg = /学惠店$/;
            if (!reg.test(data.wdName)) {
                data.wdName += '学惠店';
            }
            data.wxNum == '' && (data.wxNum = 'null');
            return q(wdregister, data);
        },

    }

}
