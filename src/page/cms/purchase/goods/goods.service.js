
export default (store) => {
    let q_goods = 'api/goods/q_goods';
    let _http = store.state.$http;
    let addGoods = 'api/wholecart/a_whole_cart_goods';
    let goodesList =  'api/cart/q_cart_goodses';
    let skuLimit = 'api/cart/q_carts_sku_config';
    let grade = "api/wd_vip/priceOfGoods";
    //获取上级信息
    const upInfo = 'api/wd_vip/q_up_wdinfo';
    let getleastbuymoney = 'api/wd_vip/q_least_buy';
    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        goodsInfo(gsNo) {
            return q(q_goods, { goodsId: gsNo });
        },
        addGoods(options) {
            let user = store.state.workVO.user;
            return q(addGoods, {
                userId:user.userId,
                token:user.token,
                number: options.number,
                goodsId: options.goodsId
            })
        },
        getShopcarGoodsesList() {
            return q(goodesList, {
                page: 1,
                limit: 10
            })
        },
        // skuLimit(){
        //     return q(skuLimit,{})
        // },
        getGradeMsg(data) {
            return q(grade, data)
        },
        getWdInfo(data) {
            return q("api/q_wdInfo_by_userId", data);
        },
        getUpWdInfo(shopId) {
            return q("api/wd_vip/queryWdInfo", { shopId: shopId });
        },
        /**
         * 上级店信息
         */
        upShopInfo(userId) {
            return q(upInfo, {
                infoId: userId,
            });
        },
        //最低购买金额
        getLeastBuyMoney() {
            let data = {
                infoId: store.state.workVO.user.userId
            }
            return q(getleastbuymoney, data);
        },
    }
}
