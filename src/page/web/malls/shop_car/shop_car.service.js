
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    let goodesList = 'api/shopcart/q_cart_goodses';
    let recommendGoodes = 'api/q_api_shopcar_recommend';
    let deleteGoodes = 'api/shopcart/d_cart_goodses';
    let changeNumber = 'api/shopcart/u_goods_number';
    let synchronousshoppingcart = 'api/shopcart/a_cart_goodses';
    let minimumConsution = 'api/goods/q_minimum_consumption';
    let getgoodslists = 'api/q_multi_goods';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post',
        });
    }

    return {

        /**
         * 获取分类推荐商品
         */
        getShopcarRecommend() {
            return q(recommendGoodes);
        },

        /**
         * 获取购物车列表
         */
        getShopcarGoodsesList(pages,limit = 5) {
            let data = {
                page: pages,
                limit: limit
            };
            return q(goodesList, data);
        },

        /**
         * 修改购物车商品数量
         */
        changeShopcarNumber(opt) {
            let data = {
                number: opt.num,
                shopCartId: opt.shopCartId,
                goodsId: opt.goodsId
            };
            return q(changeNumber, data);
        },

        /**
         * 删除购物车商品
         */
        deleteShopcar(opt) {
            let data = {
                shopCartIds: opt.shopCartIds
            };
            return q(deleteGoodes, data);
        },

        /**
         * 同步购物车
         */
        synchronousShoppingCart(options) {
            let data = {
                numbers: options.number,
                goodsIds: options.goodsId,
                shopIds: options.shopIds
            };
            return q(synchronousshoppingcart, data);
        },

        /**
         * 获取最低购买金额
         */
        getMinimumConsumption(){
            return q(minimumConsution);
        },

        /**
         * 批量获取商品信息
         */
        getGoodsLists(goodsIds){
            let data = {
                goodsIds: goodsIds
            };
            return q(getgoodslists, data);
        }
    }
};
