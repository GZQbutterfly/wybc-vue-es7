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
            return q(classfyList, { shopId: _query });
        },
        homeAd(data) {
            return q(adUrl, data)
        },
        getActiveImg() {
            return q(activeBanner, {})
        },
        getShopInfo(shopId) {
            return q(wdInfo, { shopId: shopId });
        },
        getWdInfo(data) {
            return q("api/q_wdInfo_by_userId", data);
        },
        records(data) {
            return q("api/a_shopId_by_openId", data);
        },
        queryTopNotice() {
            return q('api/wd_vip/q_notice_user', {});
        },
        /**
         * 登陆用户检测是否已经领取过新手大礼包
         */
        queryCheckHasGift() {
            return q('api/activites/check_has_gifts');
        },
        checksGiftAvalid() {
            return q('api/activites/check_first_gifts_avalid')
        },
        /**
        * 拆新手礼包
        * @param {String} code 
        */
        async takeGiftPack(couponId) {
            return q('api/activites/get_gifts', { couponId });
            // return {
            //     data: {
            //         "gifts": [
            //             {
            //                 "couponId": 1,					//优惠券Id
            //                 "couponName": "新手大礼包",    //优惠券名称
            //                 "moneyPrice": 1500,        //优惠券面值
            //                 "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //                 "expiryDate": "2018-09-01",    //有效期
            //                 "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //                 "valid": 0,                    //0:作废   1:有效
            //                 "couponType": 0				//0:所有商品通用  1:部分商品可用
            //             },
            //             {
            //                 "couponId": 1,					//优惠券Id
            //                 "couponName": "新手大礼包",    //优惠券名称
            //                 "moneyPrice": 1500,        //优惠券面值
            //                 "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //                 "expiryDate": "2018-09-01",    //有效期
            //                 "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //                 "valid": 0,                    //0:作废   1:有效
            //                 "couponType": 0				//0:所有商品通用  1:部分商品可用
            //             },
            //         ]    //false:已经领取过; true:  还没有领取过
            //     }
            // }
        },
        /**
         * 领取优惠券
         */
        async takeCounpon(couponId, shopId) {
            return q('api/activites/user_get_coupon', { couponId, shopId });
            // return {
            //     data: {
            //         "gifts": [
            //             {
            //                 "couponId": 1,					//优惠券Id
            //                 "couponName": "优惠券名称",    //优惠券名称
            //                 "moneyPrice": 1500,        //优惠券面值
            //                 "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //                 "expiryDate": "2018-09-01",    //有效期
            //                 "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //                 "valid": 0,                    //0:作废   1:有效
            //                 "couponType": 0				//0:所有商品通用  1:部分商品可用
            //             },
            //             {
            //                 "couponId": 1,					//优惠券Id
            //                 "couponName": "优惠券名称",    //优惠券名称
            //                 "moneyPrice": 1500,        //优惠券面值
            //                 "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //                 "expiryDate": "2018-09-01",    //有效期
            //                 "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //                 "valid": 0,                    //0:作废   1:有效
            //                 "couponType": 0				//0:所有商品通用  1:部分商品可用
            //             },
            //         ]    //false:已经领取过; true:  还没有领取过
            //     }
            // }
        }

    }
};
