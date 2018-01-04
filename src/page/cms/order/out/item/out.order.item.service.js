
export default (_store) => {
	let _state = _store.state;
	let _http = _state.$http;

	let cancelUrl = 'api/order/cancel_order';
	let sureReciveUrl = 'api/order/confirm_receipt';
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
		cancelOrder(params) {
			return q(cancelUrl, params);
		},
		sureRecive(params) {
			return q(sureReciveUrl, params);
		},/**
         * 拒绝备货=抛单
         */
        throwOrder(orderId) {
            let data = {
                orderId: orderId
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
