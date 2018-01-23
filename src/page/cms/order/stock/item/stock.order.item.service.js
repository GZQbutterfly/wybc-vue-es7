
export default (_store) => {
	let _state = _store.state;
	let _user = _state.workVO.user;
	let _http = _state.$http;
	let host = _state.host;
	let cancelUrl = 'api/order_whole/cancel_order';
	let sureReciveUrl = 'api/order/confirm_receipt';

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
		sureRecive(params){
			return q(sureReciveUrl,params);
		},
		//支付
		pay(data) {
			let _pay = _state.$pay;
			_pay._backUrl = '/cms#/cms_stock_order?listValue=0';
			return _pay.pay('api/order_whole/pay_order', data);
		},/**
		* 上级店信息
		*/
	   upShopInfo(userId) {
		   return q(upInfo, {
			   infoId: userId,
		   });
	   }
	}
}
