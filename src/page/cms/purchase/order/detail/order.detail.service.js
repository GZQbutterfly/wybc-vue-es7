
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let user = localStorage._user&&JSON.parse(localStorage._user);// _state.workVO.user;
    //获取订单详情
    let orderinfourl = 'api/order_whole/q_order';
    //确认收货
    let receipturl = 'api/order/confirm_receipt';
    //删除并退款
    let refundurl= 'api/order/d_order_with_refund';
    //获取上级信息
    const upInfo = 'api/wd_vip/q_up_wdinfo';

    function q(url, data){
        return  _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return{

        /**
         * 查询订单详情
         */
        getOrderInfo(orderNo){
            let data = {
                // userId: user.id,
                // token: user.token,
                orderId: orderNo
            }
            return q(orderinfourl,data);
        },
        getCombin(combinOrderNo){
             return q("api/order_whole/q_combin_order", { combinOrderNo: combinOrderNo})
         },
        /**
         * 确认收货
         */
        confirmReceipt(orderNo){
            let data = {
                // userId: user.id,
                // token: user.token,
                orderId: orderNo
            }
            return q(receipturl,data);
        },
        //支付
        pay(data) {
            let _pay = _state.$pay;
            console.log(_pay);
            _pay._backUrl = '/cms/#/cmsStockOrder?listValue=0';
            return _pay.pay('api/order_whole/pay_order', data);
        },
        /**
         * 删除并退款
         */
        dOrderWithRefund(orderNo){
            let data = {
                // userId: user.id,
                // token: user.token,
                orderId: orderNo
            }
            return q(refundurl,data);
        },
        /**
         * 上级店信息
         */
        upShopInfo(userId) {
            return q(upInfo, {
                infoId: userId,
            });
        }

    }
}
