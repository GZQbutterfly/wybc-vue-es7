import { isArray } from 'lodash';

export default (store) => {
    let q_goods = 'api/q_goods';
    let _http = store.state.$http;
    let addGoods = 'api/shopcart/a_cart_goods';
    //api/shopcart/a_cart_goods

    let skuLimit = 'api/cart/q_carts_sku_config';
    let minimumConsution = 'api/goods/q_minimum_consumption';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        goodsInfo(data) {
            return q(q_goods, data);
        },
        addGoods(options) {
            let user = store.state.workVO.user;
            return q(addGoods, {
                userId: user.userId,
                token: user.token,
                number: options.number,
                goodsId: options.goodsId,
                channel: 'wd',
                shopId: options.shopId,
                deliveryType: options.deliveryType
            })
        },
        skuLimit() {
            return q(skuLimit, {})
        },
        getWdInfo(data) {
            return q("api/q_wdInfo_by_userId", data);
        },
        getMinimumConsumption() {
            return q(minimumConsution, null);
        },
        // 获取服务 用户金币钱包额度
        queryAmountGold() {
            return q('api/wallet/q_gold_wallet');
        },
        async queryGoodsCoupons(goodsId) {
            let _result = (await q('api/activites/q_goods_coupon', { goodsId })).data;
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
        shareDone(data){
            return q('api/day_task/a_share_goods', data);
        },
        //查询仓库库存
        queryGoodsStock(data){
            return q("api/stock/q_all_goods_stock",data);
        },
        //查询快速仓开启状态
        queryStoreState(data){
            return q("api/q_shopDelivery_state",data)
        }
    }
}
