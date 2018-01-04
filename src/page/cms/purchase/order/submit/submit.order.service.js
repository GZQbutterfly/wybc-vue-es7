// ==>
import { merge } from 'lodash';

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
            // nowifi && nowifi(true);
        });
    }
    return {
        /**
         * 查询购物车商品详情（bacth query）
         */
        queryCarOrders(data) {
            return q('api/wholecart/q_muti_whole_goods', data);
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
        queryDefaultAddress(id) {
            let param = {};
            if (id) {
                param.id = id;
            } else {
                param.isDefault = 1;
            }
            return q('api/address/q_address', param);
        },
        // 13.提交购物车订单
        // url:api/order/a_cart_order
        // method:post
        submitMutiOrder(data) {
            return q('api/order_whole/a_cart_order', data);
        },
        /**
         * 提交订单
         * @param data
         */
        submitOrder(data) {
            let _wxops = _state.wxops;
            return q('api/order_whole/a_order', data);
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
        //支付
        pay(data) {
            let _pay = _state.$pay;
            console.log(_pay);
            _pay._backUrl = '/cms/#/cmsStockOrder?listValue=0';
            return _pay.pay('api/order_whole/pay_order', data);
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
        nowifi(fn) {
            nowifi = fn;
        },
        getDiscountPrice(data) {
            return q("api/wd_vip/q_disc_goods", data);
        },
        getUpWdInfo(shopId) {
            return q("api/wd_vip/queryWdInfo", { shopId: shopId });
        }
    };
}
