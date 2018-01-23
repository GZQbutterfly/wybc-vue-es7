// ==>
import { merge } from 'lodash';
/**
 * 1, 商品直接购买（单sku）
 *    01),积分兑换，直接扣除积分
 *
 *
 *    02),现金卷兑换，直接扣除现金卷
 *
 *    03),rmb购买，提交to支付面板，to支付结果
 *
 * 2，购物车结算（多sku）
 *
 *    01),rmb购买，提交to支付面板，to支付结果
 *
 *    02),rmb+现金卷购买，提交to支付面板，to支付结果
 *
 *
 */
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let nowifi = null;
    //;
    function q(url, data) {
        console.log('提交请求data', data)
        return _http({
            data: data,
            url: url,
            method: 'post'
        }).catch(() => {
             nowifi && nowifi(true);
        });
    }
    return {
        /**
         * 查询购物车商品详情（bacth query）
         */
        queryCarOrders(data) {
            return q('api/shopcart/q_muti_goods', data);
        },
        /**
         * 查询商品信息
         * @param data
         */
        queryOrder(data) {
            // gsNo : sp00000014								//商品编号
            // number : 3										//非必填，填了之后moneyPrice 为分销折扣价
            return q('api/goods/q_goods', data);
        },
        queryDefaultAddress(addrId) {
            let param = {};
            if (addrId) {
                param.addrId = addrId;
            } else {
                param.isDefault = 1;
            }
            return q('api/address/q_address', param);
        },
        // 13.提交购物车订单
        // url:api/order/a_cart_order
        // method:post
        submitMutiOrder(data) {
            return q('api/order/a_cart_order', data);
        },

        /**
         * 提交订单
         * @param data
         */
        submitOrder(data) {
            let _wxops = _state.wxops;
            return q('api/order/a_order', data);
        },
        /**
         * 套餐提交订单
         * @param data
         */
        submitPackageOrder(data) {
            let _wxops = _state.wxops;
            return q('api/order/a_package_order', data);
        },
        //查询用户券
        queryMoney() {
            return q('api/wallet/q_wallet');
        },
        /**
         * 查询套餐
         */
        queryPackage(packageId) {
            let data = {
                id: packageId
            }
            return q('api/package/q_packageGoods_by_id', data);
        },
        pay(data){
            let _pay = _state.$pay;
            return _pay.pay('api/order/pay_order', data);
        },
        /*获取邮费*/
        getFee(){
            return q("api/q_delivery_config",{})
        },
        nowifi(fn) {
            nowifi = fn;
        }
    };
};
