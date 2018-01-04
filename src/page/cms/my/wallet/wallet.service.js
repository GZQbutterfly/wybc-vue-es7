
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //提现申请
    let a_api_withdraw =   'api/a_api_withdraw';
    //获取用户钱包余额
    let queryusermoney = 'api/q_api_wallet_by_userId';
    //获取用户店铺信息
    let queryshopInfo = 'api/wd_vip/queryWdInfo';
    //获取实名认证信息
    let queryrealname = 'api/q_real_name';
    //提现cms设置
    let queryWithdrawInfo = 'api/q_withdraw_msg';

    function q(url, data){
        return  _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return{

        //获取用户店铺信息
        queryShopInfo() {
            let data = {
                shopId: _state.workVO.user.userId
            }
            return q(queryshopInfo, data);
        },
        /**
         * 获取用户钱包余额
         */
        queryUserMoney(){
            return q(queryusermoney,{});
        },
        /**
         * 获取实名认证信息
         */
        queryRealName() {
            return q(queryrealname, {});
        },
        /**
         *  提现申请
         */
        setWithdraw(data){
            return q(a_api_withdraw,data);
        },
        /**
         * 提现cms设置
         */
        queryWithdrawInfo(){
            return q(queryWithdrawInfo,{});
        }

    }

}
