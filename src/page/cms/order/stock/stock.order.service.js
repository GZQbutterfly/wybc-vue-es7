
export default (store) => {
  let _state = store.state;
  let _http = _state.$http;

  let stockOrderUrl = 'api/order_whole/q_orders';

  function q(url, data) {
    return _http({
      data: data,
      url: url,
      method: 'post'
    });
  }

  return {
    stockOrderList(keyword, orderState, page) {
      if (orderState == 0) {
        orderState = null;
      }
      let params = {
        page: page,
        limit: 10,
        orderState: orderState,
      }
      return q(stockOrderUrl, params);
    }
  };
}
