

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    let classfyList = 'api/goods/q_classifys_icon';  //分类图标列表
    let classfyGoodsList = 'api/q_claid_goods_by_fz';
    let classifyAdImg = 'api/goods/q_classifyAd_by_claid';
    let adUrl = 'api/q_store_ads';//首页广告
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
        getClassfyGoodsList(opt) {
            return q(classfyGoodsList, {
                classifyId: opt.classifyId,
                page: opt.page,
                limit: opt.limit,
            })
        },
        getClassifyAdImg(id) {
            return q(classifyAdImg, {
                classifyId: id,
                channel: 'store'
            })
        },
        homeAd() {
            return q(adUrl, {
                posId: 1,
                channel: 'store'
            })
        },
        getDiscountPrice(data) {
            return q("api/wd_vip/q_disc_goods", data);
        },
        getWdInfo(data) {
            return q("api/q_wdInfo_by_userId", data);
        },
        getUpWdInfo(shopId) {
            return q("api/wd_vip/queryWdInfo", { shopId: shopId });
        }
    }
};
