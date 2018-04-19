import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isArray } from 'lodash';

import NavTop from '../../../../commons/vue_plugins/components/nav_top/nav_top.vue';


import getShopCarCount from '../shop_car/getShopCarCount';

import { NumberPicker } from './picker/num.picker';

import { MoneyPicker } from './picker/money/money.picker';
import { GoodsComponent } from '../goods_detail_component/goods_detail_component';
import { isNotLogin, toLogin, appendParams } from 'common.env';


// 预加载订单页面数据
require.ensure([], require => { }, 'web/order/order');

import './goods.detail.scss';
import goodsService from './goods.service';
@Component({
    template: require('./goods.detail.html'),
    components: {
        navtop: NavTop,
        numpicker: NumberPicker,
        MoneyPicker,
        "goods-component": GoodsComponent
    }
})

export class GoodsDetail extends BaseVue {
    goods = "";
    show2Car = false;
    showgoPay = false;
    timeObj = {
        int_day: 0,
        int_hour: 0,
        int_second: 0,
        int_minute: 0,
        showTime: false
    };
    consumptionType = 1;//消费类型1.rmb 2.gold
    timerID;
    bannerImg = [];
    hasBannerVideo = false;
    coverVideoOptions = {};
    shopkeeper = {};
    playerOptions = {
        fluid: true,
    };
    shopId;
    moneyBuyFlag = false;// 金币购 
    showMoneyBuyNum = false;// 金币选择数量
    amountGold = 0;

    _$service;
    created() {
        this._$service = goodsService(this.$store);

        getShopCarCount(this.$store).getShopcarGoodsesList();
        this.getGoodsMsg();

    }


    mounted() {
        let _query = this.$route.query;
        let isLogin = isNotLogin();
        this.$nextTick(() => {
            document.title = "商品详情";
            if (_query.from === 'money_gold_buy') {
                // 金币购 页面跳转而来
                this.moneyBuyFlag = true;
                this.queryAmountGold();
                this.consumptionType = 2;
            } else {
                let isLogin = isNotLogin();
                if (!isLogin) {
                    this.queryGoodsCoupons();
                }
                this.consumptionType = 1;
            }
        });

    }

    queryAmountGold() {
        this._$service.queryAmountGold().then((res) => {
            let _result = res.data;
            if (!_result || _result.errorCode) {
                this.amountGold = 0;
            } else {
                this.amountGold = _result.amountGold;
            }
        });
    }

    counponList = [];
    counponObj = {};
    queryGoodsCoupons() {
        let _self = this;
        this._$service.queryGoodsCoupons(this.$route.query.goodsId).then((data) => {
            _self.counponObj = data;
        });
    }

    toCounponDetail() {
        this.$router.push({ path: 'mask_coupon', query: { goodsId: this.$route.query.goodsId } });
    }

    refresh(done) {
        let _this = this;
        setTimeout(() => {
            _this.getGoodsMsg();
            done();
        }, 500)
    }
    //获取店信息
    queryWdInfo(shopId) {
        let _this = this;
        let _result = this.$store.dispatch('CHECK_WD_INFO', shopId);
        _result.then((data) => {
            let _wdVipInfo = data;
            if (!_wdVipInfo.wdImg) {
                _wdVipInfo.wdImg = "/static/images/newshop/touxiang.png"
            }
            _this.shopkeeper = {
                wdName: _wdVipInfo.wdName,
                wdImg: _wdVipInfo.wdImg,
                vipGrade: _wdVipInfo.wdVipGrade,
                school: _wdVipInfo.school,
            }
        });
        let cartCache = JSON.parse(localStorage.getItem("shopcartCache"));
        if (cartCache) {
            if (cartCache.data[0].shopId != _this.shopId) {
                localStorage.removeItem("shopcartCache");
                _this.$store.state.shopCar.count = 0;
            }
        }
    }
    async getGoodsMsg() {
        let _this = this;
        _this.shopId = this.$route.query.shopId;
        let wdInfo = (await this.$store.dispatch('CHECK_WD_INFO'));// JSON.parse(sessionStorage.wdVipInfo || null);
        if (!_this.shopId) {
            _this.shopId = wdInfo.infoId;
        }
        if (isArray(_this.shopId)) {
            _this.shopId = _this.shopId[0];
        }
        _this.queryWdInfo(_this.shopId);
        let opt = {
            goodsId: _this.$route.query.goodsId,
            shopId: _this.shopId
        }
        this._$service.goodsInfo(opt)
            .then(res => {
                let _result = res.data;
                if (_this.$route.name != "goods_detail") {
                    return;
                }
                if (_result.errorCode || (_result.data && (_result.data.state != 1 || _result.data.onSaleState != 1))) {
                    let dialogObj = {
                        title: '',
                        content: _result.msg || '该商品已下架或停售',
                        assistBtn: '',
                        mainBtn: '知道了',
                        type: 'info',
                        assistFn() {

                        },
                        mainFn() {
                            window.history.back();
                        }
                    };
                    _this.$store.state.$dialog({ dialogObj });
                    return;
                }
                _this.goods = _result.data;
                if (!_result.data.offTimestamp) {
                    _this.timeObj.showTime = false;
                } else {
                    _this.timeObj.showTime = true;
                    _this.countDown(_result.data.offTimestamp);
                }
                let arr = _result.data.bannerImg.split(",");
                if (_result.data.bannerVideo) {
                    _this.playerOptions = {
                        muted: true,
                        sources: [{
                            type: "video/mp4",
                            src: _result.data.bannerVideo
                        }],
                        poster: arr[0],
                    }
                    let newArr = [];
                    for (let index = 0; index < arr.length; index++) {
                        if (index > 0) {
                            newArr.push(arr[index]);
                        }
                    }
                    _this.hasBannerVideo = true;
                    _this.bannerImg = newArr;
                } else {
                    _this.bannerImg = arr;
                }

                if (_result.data.goodsVideo) {
                    _this.coverVideoOptions = {
                        fluid: true,
                        muted: true,
                        sources: [{
                            type: "video/mp4",
                            src: _result.data.goodsVideo
                        }],
                        poster: _result.data.goodsVideoImg,
                    }
                }
                this.fetchShopData()
                    .then((res) => {
                        let config = {
                            title: res.wdName + ': ' + _this.goods.goodsName,
                            desc: '悄悄告诉你：我发现了一枚好东西，千万不要告诉别人！~',
                            imgUrl: _this.goods.coverImg,
                            link: window.location.href.split('#')[0] + '&shopId=' + res.infoId,
                            success: function (res) {
                                _this.shareSuccessDone(res);
                            }

                        }
                        _this.updateWxShare(config);
                    })
            }).catch(err => {

            });
    }

    /**
     * 分享成功的回调
     */
    shareSuccessDone(res) {
        let data = {
            goodsId: this.$route.query.goodsId
        }
        this._$service.shareDone(data);
    }

    goShopcart() {
        this.$router.push({ path: "shop_car" });
    }
    joinCar(goodsId) {
        let _self = this;
        this.queryStock(0, function () {
            _self.show2Car = true;
        });
    }
    changeShowIt() {
        this.show2Car = false;
        this.showgoPay = false;
    }
    buyNow(goodsId) {
        let _self = this;
        this.queryStock(1, function () {
            if (_self.moneyBuyFlag) {
                _self.showMoneyBuyNum = true;
            } else {
                _self.showgoPay = true;
            }
        });
    }

    closeMoneyDialog() {
        this.showMoneyBuyNum = false;

    }

    numberpckerHide() {
        this.show2Car = this.showgoPay = false;
    }

    finish2Car(num, deliveryType, amount) {
        this.goods.number = num;
        let _this = this;
        let flag = !isNotLogin();
        if (flag) {
            let opt = {
                goodsId: _this.goods.goodsId,
                number: num,
                shopId: _this.shopId,
                deliveryType: deliveryType
            }
            this._$service.addGoods(opt).then(res => {
                if (res.data.errorCode) {
                    let _toast = _this.$store.state.$toast;
                    _toast({ title: res.data.msg, success: false });
                    return;
                }
                let _toast = _this.$store.state.$toast;
                _toast({ title: '加入购物车成功', success: true });
                getShopCarCount(_this.$store).getShopcarGoodsesList();
            });

        } else {
            //本地存储购物车
            _this.goods.isSourceGoodsValid = 1;
            _this.goods.isCampusGoodsValid = 1;
            _this.goods.maxBuyNum = _this.fastStockObj.amount;
            let cartCache = JSON.parse(localStorage.getItem("shopcartCache") || null);
            let cout = 0;
            if (cartCache) {
                cartCache.data.forEach(lists => {
                    cout += lists.commonShopCarts.length + lists.fastShopCarts.length;
                });
                if (cout >= 10) {
                    let dialog = _this.$store.state.$dialog;
                    let dialogObj = {
                        title: '提示',
                        content: '登录后可加入更多，是否登录？',
                        assistBtn: '取消',
                        mainBtn: '确定',
                        type: 'info',
                        assistFn() {

                        },
                        mainFn() {
                            toLogin(_this.$router, {
                                toPath: 'goods_detail', realTo: 'goods_detail?goodsId=' + _this.$route.query.goodsId
                            });
                        }
                    };
                    this.$store.state.$dialog({ dialogObj });
                    return;
                }
                _this.goods.deliveryType = deliveryType;
                let exit = false;
                if (deliveryType == 1) {
                    for (let i = 0, len = cartCache.data.length; i < len; i++) {
                        for (let j = 0, len1 = cartCache.data[i].fastShopCarts.length; j < len1; j++) {
                            if (cartCache.data[i].fastShopCarts[j].goodsId == _this.goods.goodsId) {
                                cartCache.data[i].fastShopCarts[j] = _this.goods;
                                cartCache.data[i].fastShopCarts[j].number += _this.goods.number;
                                exit = true;
                                break;
                            }
                            exit = false;
                        }
                    }
                    if (!exit) {
                        cartCache.data[0].fastShopCarts.push(_this.goods);
                    }
                } else {
                    for (let i = 0, len = cartCache.data.length; i < len; i++) {
                        for (let j = 0, len1 = cartCache.data[i].commonShopCarts.length; j < len1; j++) {
                            if (cartCache.data[i].commonShopCarts[j].goodsId == _this.goods.goodsId) {
                                cartCache.data[i].commonShopCarts[j] = _this.goods;
                                cartCache.data[i].commonShopCarts[j].number += _this.goods.number;
                                exit = true;
                                break;
                            }
                            exit = false;
                        }
                        if (!exit) {
                            cartCache.data[0].commonShopCarts.push(_this.goods);
                        }
                    }
                }
            } else {
                let wdInfo = this.shopkeeper;
                cartCache = {
                    data: [{
                        shopId: _this.shopId,
                        shopName: wdInfo.wdName,
                        commonShopCarts: [],
                        fastShopCarts: [],
                        hasShopCoupon: 0,
                        deliveryType: 0,
                        ksOpen: false
                    }]
                }
                _this.goods.deliveryType = deliveryType;
                if (deliveryType == 1) {
                    cartCache = {
                        data: [{
                            shopId: _this.shopId,
                            shopName: wdInfo.wdName,
                            commonShopCarts: [],
                            fastShopCarts: [_this.goods],
                            hasShopCoupon: 0,
                            deliveryType: 1,
                            ksOpen: false
                        }]
                    }
                } else {
                    cartCache = {
                        data: [{
                            shopId: _this.shopId,
                            shopName: wdInfo.wdName,
                            commonShopCarts: [_this.goods],
                            fastShopCarts: [],
                            hasShopCoupon: 0,
                            deliveryType: 0,
                            ksOpen: false
                        }]
                    }
                }

            }
            localStorage.setItem("shopcartCache", JSON.stringify(cartCache));
            let _toast = _this.$store.state.$toast;
            _toast({ title: '加入购物车成功' });
            getShopCarCount(_this.$store).getShopcarGoodsesList();
        }

    }

    finishgoPay(num, type, deliveryNum) {
        let gsType = this.goods.gsType, goodsType;
        let goodsId = this.goods.goodsId;
        // TODO: goto gen order
        gsType == 2 ? goodsType = 'empty' : goodsType = 'entity';
        let flag = isNotLogin();
        let fastFlag = false;
        if (type == 1) {
            fastFlag = true;
        } else {
            fastFlag = false;
        }
        let _query = 'order_submit?goodsId=' + goodsId + '&goodsType=' + goodsType + '&orderSrouce=goods' + '&number=' + num + '&fastFlag=' + fastFlag;
        let query = {
            goodsId: goodsId,
            goodsType: goodsType,
            number: num,
            orderSrouce: 'goods',
            fastFlag: fastFlag
        };
        if (this.moneyBuyFlag) {
            query.from = 'money_gold_buy';
            _query = _query + "&from=money_gold_buy";
        }
        if (flag) {
            toLogin(this.$router, { toPath: _query });
            return;
        }
        this.$router.push({ path: 'order_submit', query });
    }

    fastStockObj = {
        amount: 0,
        deliveryType: 1, //快速仓状态 1快速仓 0非快速仓 
        buyType: 1,
        fastStoreState: 1  //快速仓未开启2，1开启
    }
    //库存
    async queryStock(buyType, cb) {
        let isAgent = this.$route.query.isAgent;
        let _self = this;
        let _data = {
            goodsId: this.$route.query.goodsId,
            shopId: this.shopId
            // deliveryType: 1,
        }
           //店长直营
        if (isAgent == true || isAgent=='true') {
            let _shopId = {
                shopId: this.shopId
            }
            let storeState = (await this._$service.queryStoreState(_shopId)).data;
            let fastStockNum = (await this._$service.queryGoodsStock(_data)).data;
            if (!fastStockNum.errorCode) {
                _self.fastStockObj = {
                    amount: fastStockNum.S1 || 0,
                    deliveryType: 1,
                    buyType: buyType,
                    fastStoreState: storeState.state
                }
            }
            cb && cb();
        }
        else { //店铺代理
            _data.deliveryType = 0;
            let ordinaryStockNum = (await this._$service.queryGoodsStock(_data)).data;
            _self.fastStockObj = {
                amount: ordinaryStockNum.S0 || 0,
                deliveryType: 0,
                buyType: buyType,
                fastStoreState: 2
            }
            cb && cb();
        }
     

    }
    //倒计时
    countDown(leftchektime) {
        this.timerID && clearInterval(this.timerID);
        let time_distance, _this = this;
        time_distance = leftchektime / 1000;
        this.timerID = setInterval(function () {
            time_distance--;
            if (time_distance > 0) {
                _this.timeObj.int_day = Math.floor(time_distance / (60 * 60 * 24));

                _this.timeObj.int_hour = Math.floor(time_distance / (60 * 60) % 24);

                _this.timeObj.int_minute = Math.floor(time_distance / 60 % 60);

                _this.timeObj.int_second = Math.floor(time_distance % 60);
                //加0
                if (_this.timeObj.int_hour < 10)
                    _this.timeObj.int_hour = "0" + _this.timeObj.int_hour;
                if (_this.timeObj.int_minute < 10)
                    _this.timeObj.int_minute = "0" + _this.timeObj.int_minute;
                if (_this.timeObj.int_second < 10)
                    _this.timeObj.int_second = "0" + _this.timeObj.int_second;
            }
            else {
                _this.timeObj = {
                    int_day: '00',
                    int_hour: '00',
                    int_minute: '00',
                    int_second: '00',
                    showTime: _this.showTime
                }
                clearInterval(_this.timerID);
                _this.getGoodsMsg();
            }
        }, 1000);
    }
    goHome() {
        this.$router.push({ path: 'home', query: { shopId: this.shopId } })
    }

    destroyed() {
        this.timerID && clearInterval(this.timerID);
    }
}
