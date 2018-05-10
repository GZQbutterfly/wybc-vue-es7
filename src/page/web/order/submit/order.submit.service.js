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
         * 获取微店信息
         */
        getWdInfo(shopId) {
            return _store.dispatch('CHECK_WD_INFO', { shopId, noset: true });
        },

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
            return q('api/order/a_order', data);
        },

        /**
         * 提交订单(金币购)
         */
        submitGoldOrder(data) {
            return q('api/order/a_gold_order', data);
        },

        /**
         * 套餐提交订单
         */
        submitPackageOrder(data) {
            return q('api/order/a_package_order', data);
        },
        submitTimeLimitBuyOrder(data) {
            return q('api/order/a_limit_time_order', data);
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
        pay(data) {
            let _pay = _state.$pay;
            _pay._backUrl = '/user_order?listValue=0';
            return _pay.pay('api/order/pay_order', data);
        },

        /*获取邮费_校外*/
        getFee() {
            return q("api/q_delivery_config")
        },

        /*获取邮费_校内地址*/
        getFee_in() {
            return q("api/q_inside_delivery_config")
        },

        /*获取邮费_金币购_校外地址*/
        getFee_gold() {
            return q("api/q_gold_delivery_config");
        },

        /*获取邮费_金币购_校内地址*/
        getFee_in_gold() {
            return q("api/q_inside_gold_delivery_config");
        },
        /*获取邮费_限时购_校外地址*/
        getFee_timeLimitBuy() {
            return q("api/q_limit_time_outside_delivery");
        },
        /*获取邮费_限时购_校内地址*/
        getFee_in_timeLimitBuy() {
            return q("api/q_limit_time_inside_delivery");
        },
        /*查询金币数*/
        queryUserRoll() {
            return q('api/wallet/q_gold_wallet');
        },
        async getCouponList(data) {
            let _result = (await q("api/activites/q_order_coupons", data)).data;
            return _result;
        },
        async getDisCouponMoney(data) {
            return a;
        },
        queryGoodsStock(data) {
            return q('api/stock/q_sg_goods_stock', data);
        },
        // 获取快速仓配送费
        /**
         * 
         * "shipFee": "600",
         * //校外地址邮费（单位为分）
         * "freeShipFee": "6000"		//满减金额 （单位为分）
         */
        queryFastDeliveryShip() {
            return q('api/q_ks_delivery_config');
        },
        /**
         * 网路状态
         */
        nowifi(fn) {
            nowifi = fn;
        }
    };
};
