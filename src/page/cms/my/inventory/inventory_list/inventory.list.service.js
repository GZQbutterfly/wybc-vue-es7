

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
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
        addGoods(data) {
            return q('api/wholecart/a_whole_cart_goods', data)
        },
        // api/q_api_goods_stock
        async queryStockList(data) {
            return q('api/q_api_goods_stock', data);
        }, 
         upShopInfo(userId) {
            return q(upInfo, {
                infoId: userId,
            });
        }
    }

}
