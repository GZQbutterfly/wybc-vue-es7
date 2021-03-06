export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let user = _state.workVO.user;

    let q_icons = 'api/q_icons'; //余额购
    let recommendations = 'api/q_api_home_recommendations';//爆款推荐
    let classfyList = 'api/goods/q_classifys_icon';  //分类图标列表
    let classfyShop = 'api/goods/q_classifys_home_recommend';//分类商品
    let adUrl = 'api/q_store_ads';//首页广告
    let activeBanner = 'api/package/q_package_imgs';//获取商城活动图片
    let wdInfo = 'api/wd_vip/queryWdInfo';
    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        //余额购模块
        iconsList(_query) {
            return q(q_icons, {
                shopId: _query
            })
        },
        //爆款单品
        recommendations(_query) {
            return q(recommendations, {
                shopId: _query
            })
        },
        //分类商品模块
        classfyShop(data) {
            return q(classfyShop, data);
        },
        //分类商品列表
        classfyList(_query) {
            return q(classfyList, { shopId: _query});
        },
        homeAd(data) {
            return q(adUrl,data)
        },
        getActiveImg() {
            return q(activeBanner, {})
        },
        getShopInfo(shopId) {
            return q(wdInfo, { shopId: shopId });
         },
        queryWdInfo(shopId) {
            return q("api/wd_vip/queryWdInfo", { shopId: shopId });
        },
        getWdInfo(data) {
            return q("api/q_wdInfo_by_userId", data);
        },
        records(data) {
            return q("api/a_shopId_by_openId", data);
        },
        queryTopNotice(){
            return q('api/wd_vip/q_notice_user', {});
        }
    }
};
