

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    let classfyList = 'api/directSale/q_shop_direct_sale_classify';  //分类图标列表
    let classfyGoodsList = 'api/directSale/q_shop_direct_sale_goods';
    let classifyAdImg = 'api/goods/q_classifyAd_by_claid';
    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    return {
        //分类商品列表
        classfyList() {
            return q(classfyList, {});
        },
        getClassfyGoodsList(data) {
            return q(classfyGoodsList, data)
        },
        getClassifyAdImg(id) {
            return q(classifyAdImg, {
                classifyId: id,
                channel: 'wd'
            })
        }
    }
};
