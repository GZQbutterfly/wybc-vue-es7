
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let recommendGoodes = 'api/q_api_order_recommend';

    let goodesList = 'api/wholecart/q_whole_cart_goodses';
    let deleteGoodes = 'api/wholecart/d_whole_cart_goodses';
    let changeNumber = 'api/wholecart/u_whole_goods_number';
    let synchronousShoppingCart = 'api/wholecart/a_whole_cart_goodses';
    let getleastbuymoney = 'api/wd_vip/q_least_buy';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        //最低购买金额
        getLeastBuyMoney(){
            let data = {
                infoId: _state.workVO.user.userId
            }
            return q(getleastbuymoney, data);
        },

        //获取分类推荐商品
        getShopcarRecommend() {
            return q(recommendGoodes, {});
        },
        //获取购物车列表
        getShopcarGoodsesList(pages) {
            let user = _state.workVO.user;
            return q(goodesList, {
                // userId:user.userId,
                // token:user.token,
                page: pages,
                limit: 10
            })
        },
        //修改购物车商品数量

        changeShopcarNumber(opt) {
            let user = _state.workVO.user;
            return q(changeNumber, {
                // userId: user.userId,
                // token: user.token,
                number: opt.num,
                wholeShopCartId: opt.cartId,
                goodsId:opt.goodsId
            })
        },
        //删除购物车商品
        deleteShopcar(opt) {
            let user = _state.workVO.user;
            return q(deleteGoodes, {
                // userId: user.userId,
                // token: user.token,
                wholeShopCartIds: opt.cartId
            })
        },
        //同步购物车
        synchronousShoppingCart(options) {
            let user = _state.workVO.user;
            return q(synchronousShoppingCart, {
                // userId: user.userId,
                // token: user.token,
                numbers: options.number,
                goodsIds: options.goodsId
            })
        },
        getDiscountPrice(data) {
            return q("api/wd_vip/q_disc_goods", data);
        }
    }


};
