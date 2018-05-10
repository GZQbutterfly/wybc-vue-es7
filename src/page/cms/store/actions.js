export default {
    /**
      * 请求用户进货购物车 实时请求
      * @param {Object} state 
      * @param {Object} params {shopId}
      */
    'QUERY_SHOP_CAR': async function ({ state }, params) {
        let _result = (await state.$http('api/wholecart/q_whole_cart_goodses', params)).data;
        if (!_result || _result.errorCode) {
            return [];
        }
        let _list = _result.data;
        _list.deleteGoods = _result.deleteGoods|| [];
        return _list;
    },
    /**
     * 添加购物车 {goodsId, number}
     */
    'ADD_GOODS_TO_CAR': function ({ state }, params) {
        return state.$http('api/wholecart/a_whole_cart_goods', params);
    },
    /**
     * 增减购物车商品数量
     * @param {*} params  {number, wholeShopCartId, goodsId}
     */
    'UPD_GOODS_NUMBER_IN_CAR': function ({ state }, params) {
        return state.$http('api/wholecart/u_whole_goods_number', params);
    },
    /**
    * 批量增减购物车商品数量
    * @param {*} list  {car}
    */
    'BACTH_UPD_GOODS_NUMBER_IN_CAR': function ({ state }, list) {
        let nums = [];
        let carIds = [];
        let gIds = [];
        for (let i = 0, len = list.length; i < len; i++) {
            let _item = list[i];
            nums.push(_item.number);
            carIds.push(_item.id);
            gIds.push(_item.goodsId);
        }
        return state.$http('api/wholecart/u_whole_goods_number', {
            number: nums.join(','),
            wholeShopCartId: carIds.join(','),
            goodsId: gIds.join(',')
        });
    },
    /**
     * 删除购物车商品 
     * @param {*} params {wholeShopCartIds}
     */
    'CLEAN_SHOP_CAR': function ({ state }, params) {
        return state.$http('api/wholecart/d_whole_cart_goodses', params)
    }
};