
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
        getShopcarGoodsesList(pages, limit = 10000) {
            let data = {
                page: pages,
                limit: limit
            };
           return  q(goodesList, data);
                //     return {

                //      "speedStore": [{
                //          "shopId": 113,
                //          "shopName": "滔哥学会精选官方店",
                //          "school": "西南民族大学（航空港校区）",
                //          "shopCarts": [{
                //              "id": 682,
                //              "userId": 863,
                //              "goodsId": 190,
                //              "number": 1,
                //              "createAt": "2018-03-02 18:25:22",
                //              "moneyPrice": 150,
                //              "purchasePrice": 150,
                //              "goodsName": "三笑牙刷",
                //              "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420534183225/三笑牙刷商列表图.jpg",
                //              "isSourceGoodsValid": 1,
                //              "isCampusGoodsValid": 1,
                //              "consuType": 2,
                //              "shopId": 113,
                //              "campusId": 9,
                //              "wdName": "滔哥学会精选官方店",
                //              "maxBuyNum": 99999,
                //              "limitedByOrder": false
                //          }],
                //          "hasShopCoupon": 0
                //      }, {
                //          "shopId": 114,
                //          "shopName": "43534534学惠店",
                //          "school": "西南民族大学（航空港校区）",
                //          "shopCarts": [{
                //              "id": 724,
                //              "userId": 863,
                //              "goodsId": 189,
                //              "number": 1,
                //              "createAt": "2018-03-06 11:43:52",
                //              "moneyPrice": 5400,
                //              "purchasePrice": 5400,
                //              "goodsName": "波波猴坚果礼盒",
                //              "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420534183246jpg/201801/1515578925613.jpg",
                //              "isSourceGoodsValid": 1,
                //              "isCampusGoodsValid": 1,
                //              "consuType": 2,
                //              "shopId": 114,
                //              "campusId": 9,
                //              "wdName": "43534534学惠店",
                //              "maxBuyNum": 99999,
                //              "limitedByOrder": false
                //          }, {
                //                  "id": 724,
                //                  "userId": 863,
                //                  "goodsId": 189,
                //                  "number": 1,
                //                  "createAt": "2018-03-06 11:43:52",
                //                  "moneyPrice": 5400,
                //                  "purchasePrice": 5400,
                //                  "goodsName": "波波猴坚果礼盒",
                //                  "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420534183246jpg/201801/1515578925613.jpg",
                //                  "isSourceGoodsValid": 1,
                //                  "isCampusGoodsValid": 1,
                //                  "consuType": 2,
                //                  "shopId": 114,
                //                  "campusId": 9,
                //                  "wdName": "43534534学惠店",
                //                  "maxBuyNum": 99999,
                //                  "limitedByOrder": false
                //              }],
                //          "hasShopCoupon": 0
                //      }]
                //      ,
                //         "data": [{
                //             "shopId": 113,
                //             "shopName": "滔哥学会精选官方店",
                //             "school": "西南民族大学（航空港校区）",
                //             "shopCarts": [{
                //                 "id": 682,
                //                 "userId": 863,
                //                 "goodsId": 190,
                //                 "number": 1,
                //                 "createAt": "2018-03-02 18:25:22",
                //                 "moneyPrice": 150,
                //                 "purchasePrice": 150,
                //                 "goodsName": "三笑牙刷",
                //                 "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420534183225/三笑牙刷商列表图.jpg",
                //                 "isSourceGoodsValid": 1,
                //                 "isCampusGoodsValid": 1,
                //                 "consuType": 2,
                //                 "shopId": 113,
                //                 "campusId": 9,
                //                 "wdName": "滔哥学会精选官方店",
                //                 "maxBuyNum": 99999,
                //                 "limitedByOrder": false
                //             }],
                //             "hasShopCoupon": 0
                //         }, {
                //             "shopId": 114,
                //             "shopName": "43534534学惠店",
                //             "school": "西南民族大学（航空港校区）",
                //             "shopCarts": [{
                //                 "id": 724,
                //                 "userId": 863,
                //                 "goodsId": 189,
                //                 "number": 1,
                //                 "createAt": "2018-03-06 11:43:52",
                //                 "moneyPrice": 5400,
                //                 "purchasePrice": 5400,
                //                 "goodsName": "波波猴坚果礼盒",
                //                 "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420534183246jpg/201801/1515578925613.jpg",
                //                 "isSourceGoodsValid": 1,
                //                 "isCampusGoodsValid": 0,
                //                 "consuType": 2,
                //                 "shopId": 114,
                //                 "campusId": 9,
                //                 "wdName": "43534534学惠店",
                //                 "maxBuyNum": 99999,
                //                 "limitedByOrder": false
                //             }, {
                //                 "id": 724,
                //                 "userId": 863,
                //                 "goodsId": 189,
                //                 "number": 1,
                //                 "createAt": "2018-03-06 11:43:52",
                //                 "moneyPrice": 5400,
                //                 "purchasePrice": 5400,
                //                 "goodsName": "波波猴坚果礼盒",
                //                 "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420534183246jpg/201801/1515578925613.jpg",
                //                 "isSourceGoodsValid": 1,
                //                 "isCampusGoodsValid": 0,
                //                 "consuType": 2,
                //                 "shopId": 114,
                //                 "campusId": 9,
                //                 "wdName": "43534534学惠店",
                //                 "maxBuyNum": 99999,
                //                 "limitedByOrder": false
                //             }],
                //             "hasShopCoupon": 0
                //         }]
                //  }
            /*[{
                         "shopId": 113,
                         "shopName": "滔哥学会精选官方店",
                         "school": "西南民族大学（航空港校区）",
                         "shopCarts": [{
                             "id": 682,
                             "userId": 863,
                             "goodsId": 190,
                             "number": 1,
                             "createAt": "2018-03-02 18:25:22",
                             "moneyPrice": 150,
                             "purchasePrice": 150,
                             "goodsName": "三笑牙刷",
                             "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420534183225/三笑牙刷商列表图.jpg",
                             "isSourceGoodsValid": 1,
                             "isCampusGoodsValid": 1,
                             "consuType": 2,
                             "shopId": 113,
                             "campusId": 9,
                             "wdName": "滔哥学会精选官方店",
                             "maxBuyNum": 99999,
                             "limitedByOrder": false
                         }],
                         "hasShopCoupon": 0
                     }, {
                         "shopId": 114,
                         "shopName": "43534534学惠店",
                         "school": "西南民族大学（航空港校区）",
                         "shopCarts": [{
                             "id": 724,
                             "userId": 863,
                             "goodsId": 189,
                             "number": 1,
                             "createAt": "2018-03-06 11:43:52",
                             "moneyPrice": 5400,
                             "purchasePrice": 5400,
                             "goodsName": "波波猴坚果礼盒",
                             "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420534183246jpg/201801/1515578925613.jpg",
                             "isSourceGoodsValid": 1,
                             "isCampusGoodsValid": 1,
                             "consuType": 2,
                             "shopId": 114,
                             "campusId": 9,
                             "wdName": "43534534学惠店",
                             "maxBuyNum": 99999,
                             "limitedByOrder": false
                         }, {
                                 "id": 724,
                                 "userId": 863,
                                 "goodsId": 189,
                                 "number": 1,
                                 "createAt": "2018-03-06 11:43:52",
                                 "moneyPrice": 5400,
                                 "purchasePrice": 5400,
                                 "goodsName": "波波猴坚果礼盒",
                                 "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420534183246jpg/201801/1515578925613.jpg",
                                 "isSourceGoodsValid": 1,
                                 "isCampusGoodsValid": 1,
                                 "consuType": 2,
                                 "shopId": 114,
                                 "campusId": 9,
                                 "wdName": "43534534学惠店",
                                 "maxBuyNum": 99999,
                                 "limitedByOrder": false
                             }],
                         "hasShopCoupon": 0
                     }]*/
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
        synchronousShoppingCart(data) {
            return q(synchronousshoppingcart, data);
        },

        /**
         * 批量获取商品信息
         */
        getGoodsLists(goodsIds) {
            let data = {
                goodsIds: goodsIds
            };
            return q(getgoodslists, data);
        },
        /**
         * 批量更改数量
         */
        queryAsyncNum(data){
          return  q("api/shopcart/u_goods_numbers",data);
        },
        //查询快速仓开启状态
        queryStoreState(data) {
            return q("api/q_shopDelivery_state", data)
        },
        //批量查询库存
        queryStore(data){
            return q("api/stock/q_goods_stock",data)
        }
    }
};
