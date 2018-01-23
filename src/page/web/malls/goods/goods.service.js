
export default (store) => {
    let q_goods = 'api/goods/q_goods';
    let _http = store.state.$http;
    let addGoods = 'api/shopcart/a_cart_goods';
    //api/shopcart/a_cart_goods

    let skuLimit = 'api/cart/q_carts_sku_config';
    let minimumConsution = 'api/goods/q_minimum_consumption';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        goodsInfo(data) {
            return q(q_goods,data);
        },
        addGoods(options) {
            let user = store.state.workVO.user;
            return q(addGoods, {
                userId: user.userId,
                token: user.token,
                number: options.number,
                goodsId: options.goodsId,
                channel: 'wd',
                shopId: options.shopId
            })
        },
        skuLimit() {
            return q(skuLimit, {})
        },
        queryWdInfo(shopId) {
            return q("api/wd_vip/queryWdInfo", { shopId: shopId });
        },
        getWdInfo(data) {
            return q("api/q_wdInfo_by_userId", data);
        },
        getMinimumConsumption() {
            return q(minimumConsution, null);
        }
    }
}
