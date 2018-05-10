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
        addGoods(data) {
            return q('api/wholecart/a_whole_cart_goods', data)
        }, 
        getShopCarGoodses() {
            return q('api/wholecart/q_whole_cart_goodses', {
                page: 1,
                limit: 10000
            })
        },
        queryStockLimit(data){
            return q('api/wd_vip/q_least_buy',data);
        }
    }
};
