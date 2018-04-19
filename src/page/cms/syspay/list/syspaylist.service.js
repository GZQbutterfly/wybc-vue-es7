
/**
 * orderType 1:用户支付订单 2:进货订单
 */
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    
    return {
        queryWallet(data) {
           return  q('api/q_api_wallet_by_userId',data);
        },
        payCMSOrder(data){
            return q('api/order_whole/pay_order',data);
        },
        getRebateGold(data){
            return q("api/wallet/q_gold_by_Order",data);
        },
        queryPasswordState() {
            return  q('api/user_pay/q_wallet_pay_password_status');
         }
    };
}
