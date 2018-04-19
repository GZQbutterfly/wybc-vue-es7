import { isNotLogin } from 'common.env';
import getShopCarCount from './getShopCarCount';
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    function addGoods(options) {
        let user = _state.workVO.user;
        return q("api/shopcart/a_cart_goods", {
            userId: user.userId,
            token: user.token,
            number: options.number,
            goodsId: options.goodsId,
            channel: 'wd',
            shopId: options.shopId,
            deliveryType: options.deliveryType
        })
    }
    async function queryStoreState() {
        let wdInfo = await _store.dispatch('CHECK_WD_INFO');
        return q("api/q_shopDelivery_state", { shopId: wdInfo.infoId });
    }
    function queryGoodsStock(data) {
        return q('api/stock/q_all_goods_stock', data);
    }
    return {
        async finishToCar(_$vm, goods, route = "home", deliveryType = 1, cb = null) {
            let _self = _$vm;
            goods.number = 1;
            goods.isSourceGoodsValid = 1;
            goods.isCampusGoodsValid = 1;
            goods.maxBuyNum = 1;
            let _data = {
                goodsId: goods.goodsId,
            };
            let wdInfo = await _store.dispatch('CHECK_WD_INFO');
            if (deliveryType==1){
                let storeState = (await queryStoreState()).data;
                if (storeState.state == 2) {
                    //快速仓未开启
                    let dialog = _self.$store.state.$dialog;
                    let dialogObj = {
                        title: '提示',
                        content: '当前店铺快速仓未开启，不可加入购物车',
                        assistBtn: '',
                        mainBtn: '知道了',
                        type: 'info',
                        assistFn() {
                        },
                        mainFn() {
                        }
                    };
                    dialog({ dialogObj });
                    return;
                } 
            }
            let flag = !isNotLogin();
            if (flag) {
                let opt = {
                    goodsId: goods.goodsId,
                    number: 1,
                    shopId: wdInfo.infoId,
                    deliveryType: deliveryType
                }
                addGoods(opt).then(res => {
                    if (res.data.errorCode) {
                        let _toast = _self.$store.state.$toast;
                        _toast({ title: res.data.msg, success: false });
                        return;
                    }
                    let _toast = _self.$store.state.$toast;
                    _toast({ title: '加入购物车成功', success: true });
                    getShopCarCount(_store).getShopcarGoodsesList();
                    cb && cb();
                });

            } else {
                //本地存储购物车
                let cartCache = JSON.parse(localStorage.getItem("shopcartCache") || null);
                if (cartCache) {
                    cartCache.data.forEach(lists => {
                        cout += lists.commonShopCarts.length + lists.fastShopCarts.length;
                        if (lists.shopId != wdInfo.infoId) {
                            localStorage.removeItem("shopcartCache");
                            cartCache = null;
                        }
                    });
                }
                let cout = 0;
                if (cartCache) {
                    cartCache.data.forEach(lists => {
                        cout += lists.commonShopCarts.length + lists.fastShopCarts.length;
                    });
                    if (cout >= 10) {
                        let dialog = _self.$store.state.$dialog;
                        let dialogObj = {
                            title: '提示',
                            content: '登录后可加入更多，是否登录？',
                            assistBtn: '取消',
                            mainBtn: '确定',
                            type: 'info',
                            assistFn() {

                            },
                            mainFn() {
                                toLogin(_self.$router, {
                                    toPath: route, realTo: route
                                });
                            }
                        };
                        _self.$store.state.$dialog({ dialogObj });
                        return;
                    }
                    goods.deliveryType = deliveryType;
                    let exit = false;
                    if (deliveryType == 1) {
                        for (let i = 0, len = cartCache.data.length; i < len; i++) {
                            for (let j = 0, len1 = cartCache.data[i].fastShopCarts.length; j < len1; j++) {
                                if (cartCache.data[i].fastShopCarts[j].goodsId == goods.goodsId) {
                                    cartCache.data[i].fastShopCarts[j] = goods;
                                    cartCache.data[i].fastShopCarts[j].number += goods.number;
                                    exit = true;
                                    break;
                                }
                                exit = false;
                            }
                        }
                        if (!exit) {
                            cartCache.data[0].fastShopCarts.push(goods);
                        }
                    } else {
                        for (let i = 0, len = cartCache.data.length; i < len; i++) {
                            for (let j = 0, len1 = cartCache.data[i].commonShopCarts.length; j < len1; j++) {
                                if (cartCache.data[i].commonShopCarts[j].goodsId == goods.goodsId) {
                                    cartCache.data[i].commonShopCarts[j] = goods;
                                    cartCache.data[i].commonShopCarts[j].number += goods.number;
                                    exit = true;
                                    break;
                                }
                                exit = false;
                            }
                            if (!exit) {
                                cartCache.data[0].commonShopCarts.push(goods);
                            }
                        }
                    }
                } else {

                    cartCache = {
                        data: [{
                            shopId: wdInfo.infoId,
                            shopName: wdInfo.wdName,
                            commonShopCarts: [],
                            fastShopCarts: [],
                            hasShopCoupon: 0,
                            deliveryType: 0,
                            ksOpen: false
                        }]
                    }
                    goods.deliveryType = deliveryType;
                    if (deliveryType == 1) {
                        cartCache = {
                            data: [{
                                shopId: wdInfo.infoId,
                                shopName: wdInfo.wdName,
                                commonShopCarts: [],
                                fastShopCarts: [goods],
                                hasShopCoupon: 0,
                                deliveryType: 1,
                                ksOpen: false
                            }]
                        }
                    } else {
                        cartCache = {
                            data: [{
                                shopId: wdInfo.infoId,
                                shopName: wdInfo.wdName,
                                commonShopCarts: [goods],
                                fastShopCarts: [],
                                hasShopCoupon: 0,
                                deliveryType: 0,
                                ksOpen: false
                            }]
                        }
                    }

                }
                localStorage.setItem("shopcartCache", JSON.stringify(cartCache));
                let _toast = _self.$store.state.$toast;
                _toast({ title: '加入购物车成功' });
                getShopCarCount(_store).getShopcarGoodsesList();
                cb && cb();
            }

        }
    }
}