
export default (_store) => {
	let _state = _store.state;
	let _http = _state.$http;

	let cancelUrl = 'api/order/cancel_order';
	let sureReciveUrl = 'api/order/confirm_receipt';

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
		},
		pay(params) {
			let _pay = _state.$pay;
			return _pay.pay('api/order/pay_order', params);
		}
	}
}
