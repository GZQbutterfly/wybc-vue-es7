
export default (store) => {
    let q_goods = 'api/q_goods';
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
            return store.dispatch('CHECK_UP_WD_INFO', shopId);
        },
        /**
         * 上级店信息
         */
        upShopInfo(userId) {
            return q(upInfo, {
                infoId: userId,
            });
        },
        async queryGoodsCoupons(goodsId) {
            let _result = (await q('api/activites/q_goods_coupon', { goodsId,type:1 })).data;
            // _result = {
            //     "data":
            //         {

            //             "couponId": 10,					//优惠券种类Id
            //             "couponName": "新手大礼包",    //优惠券名称
            //             "moneyPrice": 1500,        //优惠券面值
            //             "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //             "expiryDate": "2018-09-01",    //有效期
            //             "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //             "goodsLimit": 0,				//0:所有商品通用  1:部分商品可用
            //             "valid": 0,					//失效类型  0:作废  1:已过期
            //             "infoId": 757,					//专用于微店的微店ID
            //             "wdName": "学会店"				//专用微店的微店名
            //         }
            // }
            if (!_result || _result.errorCode || !_result.data) {
                return null;
            }
            return _result.data;
        },
        //最低购买金额
        getLeastBuyMoney() {
            let data = {
                infoId: store.state.workVO.user.userId
            }
            return q(getleastbuymoney, data);
        },
        //查询仓库库存
        queryGoodsStock(data) {
            let shopId = store.state.workVO.user.userId;
            data.shopId = shopId;
            return q("api/stock/q_sg_goods_stock", data);
        },
    }
}
