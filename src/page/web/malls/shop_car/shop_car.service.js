
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;


    let goodesList = 'api/shopcart/q_cart_goodses';
    let recommendGoodes = 'api/q_api_shopcar_recommend';

    let deleteGoodes = 'api/shopcart/d_cart_goodses';
    let changeNumber = 'api/shopcart/u_goods_number';
    let synchronousShoppingCart = 'api/shopcart/a_cart_goodses';
    let minimumConsution = 'api/goods/q_minimum_consumption';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post',
        });
    }

    return {
        //获取分类推荐商品
        getShopcarRecommend() {
            return q(recommendGoodes, {});
        },
        //获取购物车列表
        getShopcarGoodsesList(pages) {
            let user = _state.workVO.user;
            return q(goodesList, {
                // userId: user.userId,
                // token: user.token,
                page: pages,
                limit: 5
            })
        },
        //修改购物车商品数量

        changeShopcarNumber(opt) {
            let user = _state.workVO.user;
            return q(changeNumber, {
                // userId: user.userId,
                // token: user.token,
                number: opt.num,
                shopCartId: opt.shopCartId,
                goodsId: opt.goodsId
            })
        },
        //删除购物车商品
        deleteShopcar(opt) {
            let user = _state.workVO.user;
            return q(deleteGoodes, {
                // userId: user.userId,
                // token: user.token,
                shopCartIds: opt.shopCartIds
            })
        },
        //同步购物车
        synchronousShoppingCart(options) {
            let user = _state.workVO.user;
            return q(synchronousShoppingCart, {
                // userId: user.userId,
                // token: user.token,
                numbers: options.number,
                goodsIds: options.goodsId,
                shopIds: options.shopIds

            })
        },
        getMinimumConsumption(){
            return q(minimumConsution,null);
        },
        getGoodsLists(goodsIds){
            return q("api/goods/q_multi_goods", { goodsIds: goodsIds});
        }
    }

};
