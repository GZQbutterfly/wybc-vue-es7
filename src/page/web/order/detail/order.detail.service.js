import axios from 'axios';

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;


    //获取订单详情
    let orderinfourl = 'api/order/q_order';
    //确认收货
    let receipturl = 'api/order/confirm_receipt';
    //删除并退款
    let refundurl = 'api/order/d_order_with_refund';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        /**
         * 查询订单详情
         */
        getOrderInfo(orderNo) {
            let user = _state.workVO.user;
            let data = {
                // userId: user.id,
                // token: user.token,
                orderId: orderNo
            }
            return q(orderinfourl, data);
        },
        //组合订单详情
        getCombinInfo(combin) {
            return q("api/order/q_combin_order", { combinOrderNo: combin })
        },
        /**
        *支付
        **/
        pay(data) {
            let _pay = _state.$pay;
            return _pay.pay('api/order/pay_order', data);
        },
        /**
         * 确认收货
         */
        confirmReceipt(orderNo) {
            let user = _state.workVO.user;
            let data = {
                // userId: user.id,
                // token: user.token,
                orderId: orderNo
            }
            return q(receipturl, data);
        },

        /**
         * 删除并退款
         */
        dOrderWithRefund(orderNo) {
            let user = _state.workVO.user;
            let data = {
                // userId: user.id,
                token: user.token,
                // orderId: orderNo
            }
            return q(refundurl, data);
        },

    }
}
