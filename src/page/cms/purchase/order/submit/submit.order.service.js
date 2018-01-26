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
         */
        queryOrder(data) {
            return q('api/q_goods', data);
        },

        /**
         * 查询默认地址
         */
        queryDefaultAddress(id) {
            let param = {};
            if (id) {
                param.id = id;
            } else {
                param.isDefault = 1;
            }
            return q('api/address/q_address', param);
        },
        
        /**
         * 提交购物车订单
         */
        submitMutiOrder(data) {
            return q('api/order_whole/a_cart_order', data);
        },

        /**
         * 提交订单
         */
        submitOrder(data) {
            return q('api/order_whole/a_order', data);
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
         * 支付
         */
        pay(data) {
            let _pay = _state.$pay;
            _pay._backUrl = '/cms#/cms_stock_order?listValue=0';
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

        /**
         * 网络状态
         */
        nowifi(fn) {
            nowifi = fn;
        },

        /**
         * 查询商品折扣合计
         */
        getDiscountPrice(data) {
            return q("api/wd_vip/q_disc_goods", data);
        },

        /**
         * 
         * 获取微店信息
         */
        getWdInfo(shopId) {
            return q("api/wd_vip/queryWdInfo", { shopId: shopId });
        }, 

        /**
         * 获取邮费
         */
        getFee() {
            return q("api/q_whole_delivery_config", {})
        }
    };
}
