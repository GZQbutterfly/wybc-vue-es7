export default (store) => {
    let _state = store.state;
    let q = _state.$http;
    return {
        /**
         * 所有分类商品
         * @param {*} data 
         */
        queryClassifyGoodsList(data) {
            return q('api/q_all_claid_goods', data)
        },
        /**
         * 分类菜单
         * @param {*} data 
         */
        queryClassyfyList(data) {
            return q('api/goods/q_classifys_icon', data);
        },
        //最低购买金额
        queryLeastBuyMoney() {
            let data = {
                infoId: _state.workVO.user.userId
            }
            return q('api/wd_vip/q_least_buy', data);
        },
        /**
        * 查询进货券
        * @param {*} data 
        */
        queryGoodsCounpon(data) {
            return q('api/q_all_pur_coupons', data);
        }
    };
}