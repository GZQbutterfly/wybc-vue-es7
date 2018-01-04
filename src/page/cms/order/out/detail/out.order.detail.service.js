export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let user = localStorage._user && JSON.parse(localStorage._user);// _state.workVO.user;
    //获取订单详情
    let orderinfourl = 'api/order_out/q_order';
    //抛单到上级 (拒绝备货)
    let throwOrderUrl = 'api/order_out/throw_order';
    //获取上级信息
    const upInfo = 'api/wd_vip/q_up_wdinfo';
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
        getOrderInfo(orderId, outState) {
            let data = {
                orderId: orderId,
                outState: outState,
            }
            return q(orderinfourl, data);
        },

        /**
         * 拒绝备货=抛单
         */
        throwOrder(orderId) {
            let data = {
                orderId: orderId,
            }
            return q(throwOrderUrl, data);
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
