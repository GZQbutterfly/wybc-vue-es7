export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //获取实名认证信息
    let queryrealname = 'api/q_real_name';
    //获取配送员实名认证
    let querydistributorrealname = 'api/q_shoper_delivery_check';
    //获取用户店铺信息
    let queryshopInfo = 'api/wd_vip/queryWdInfo';
    //获取用户钱包余额
    let queryusermoney = 'api/q_api_wallet_by_userId';
    //获取系统消息列表
    let querysystemmsg = 'api/wd_vip/q_notice_wd';
    //获取用户收益数据
    let querymyincome = 'api/q_api_income';
    //获取banner数据
    let querybannerdata = 'api/q_store_ads';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        //获取实名认证信息
        queryRealName() {
            let data = {
                shopId: _state.workVO.user.userId
            }
            return q(queryrealname, data);
        },
        //获取配送员认证信息
        queryDistributorRealName() {
            let data = {
                shopId: _state.workVO.user.userId
            }
            return q(querydistributorrealname, data);
        },
        //获取用户钱包余额
        queryUserMoney() {
            let data = {
                shopId: _state.workVO.user.userId
            }
            return q(queryusermoney, data);
        },
        //获取用户等级信息
        queryShopInfo() {
            // let data = {
            //     shopId: _state.workVO.user.userId
            // }
            return _store.dispatch('CHECK_MY_WD_INFO');//q(queryshopInfo, data);
        },
        //获取系统消息列表
        querySystemMsg() {
            return q(querysystemmsg, {});
        },
        queryMessageNum() {
            return q('api/wd_vip/q_wd_msgnum', { infoId: _state.workVO.user.userId });
        },
        //获取用户收益数据
        queryMyIncome() {
            let data = {
                page: 1,
                limit: 1,
                shopId: _state.workVO.user.userId
            }
            return q(querymyincome, data);
        },
        //获取banner数据
        queryBannerData() {
            let data = {
                posId: 2,
                channel: 'store'
            }
            return q(querybannerdata, data);
        },
        //快速仓开启状态
        queryShopDeliveryState() {
            return q('api/q_shopDelivery_state');
        },
        checkFastDeliveryState() {
            return q('api/check_fast_delivery_state');
        },
        getRedRidusNum(){
            return q("api/wd_vip/q_wd_new_msg",{
                shopId: _state.workVO.user.userId
            })
        }
    }
};
