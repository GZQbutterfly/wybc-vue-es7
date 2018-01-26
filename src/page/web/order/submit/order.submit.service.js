import { merge } from 'lodash';

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let nowifi = null;
    function q(url, data) {
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
         * 查询购物车商品详情
         */
        queryCarOrders(data) {
            return q('api/shopcart/q_muti_goods', data);
        },

        /**
         * 查询商品信息
         */
        queryGoods(data) {
            return q('api/q_goods', data);
        },

        /**
         * 
         * 查询默认收货地址
         */
        queryDefaultAddress(addrId) {
            let param = {};
            if (addrId) {
                param.addrId = addrId;
            } else {
                param.isDefault = 1;
            }
            return q('api/address/q_address', param);
        },

        /**
         * 提交购物车订单
         */
        submitMutiOrder(data) {
            return q('api/order/a_cart_order', data);
        },

        /**
         * 提交订单
         */
        submitOrder(data) {
            let _wxops = _state.wxops;
            return q('api/order/a_order', data);
        },

        /**
         * 套餐提交订单
         */
        submitPackageOrder(data) {
            let _wxops = _state.wxops;
            return q('api/order/a_package_order', data);
        },

        /**
         * 查询用户券
         */
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

        /**
         * 支付
         */
        pay(data){
            let _pay = _state.$pay;
            return _pay.pay('api/order/pay_order', data);
        },

        /*获取邮费*/
        getFee(){
            return q("api/q_delivery_config",{})
        },
        
        /**
         * 网路状态
         */
        nowifi(fn) {
            nowifi = fn;
        }
    };
};
