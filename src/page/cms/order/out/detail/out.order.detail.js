import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import orderDetailService from './out.order.detail.service';
import { getLocalUserInfo, toWEB } from 'common.env';



import './out.order.detail.scss';

@Component({
    template: require('./out.order.detail.html')
})


export class OutOrderDetail extends BaseVue {

     _$service ;
     orderId;
     outState;
    timerID;
    orderTimer = {
        int_hour: 0,
        int_minute: 0,
        int_second: 0
    };

    orderInfo = {};

    //当前店铺折扣
    curShopBuyDisct = 100;

    goodsInfo = {};

    commi = {};

    mounted() {
        //订单编号
        this.orderId = this.$route.query.orderId || 0;
        this.outState = this.$route.query.outState || 0;
        let self = this;
        self._$service = orderDetailService(self.$store);
        self.$nextTick(() => {
            self._$service.getOrderInfo(self.orderId, self.outState)
                .then(res => {
                    if (!res || res.errorCode || !res.data.orderWhole) {
                        let dialogObj = {
                            title: '',
                            content: '订单不存在',
                            type: 'info',
                            mainBtn: '返回',
                            assistFn() {
                            },
                            mainFn() {
                                self.$router.back();
                            }
                        };
                        self.$store.state.$dialog({ dialogObj });
                    } else {
                        self.orderInfo = res.data.orderWhole;
                        self.goodsInfo = res.data.orderGoods;
                        self.commi = res.data.orderCommi;
                        self.curShopBuyDisct = res.data.curShopBuyDisct ? res.data.curShopBuyDisct : 100;
                        if (res.data.orderWhole.acceptTimeLeft > 0) {
                            self.countDown(res.data.orderWhole.acceptTimeLeft);
                        }
                    }
                })
        })

    }

    //1:自己接单 2:上线接单 3:等待自己进货接单 4:等待上线接单
    orderState(type) {
        let userId = getLocalUserInfo().userId;
        if (type == 1) {
            return this.orderInfo && this.orderInfo.acceptStatus && (this.orderInfo.shopId == userId);
        } else if (type == 2) {
            return this.orderInfo && this.orderInfo.acceptStatus && (this.orderInfo.shopId != userId);
        } else if (type == 3) {
            return this.orderInfo && !this.orderInfo.acceptStatus && (this.orderInfo.shopId == userId);
        } else if (type == 4) {
            return this.orderInfo && !this.orderInfo.acceptStatus && (this.orderInfo.shopId != userId);
        } else {
            return false;
        }
    }

    toGoodsDetail(goodsId) {
        let self = this;
        this._$service.upShopInfo(getLocalUserInfo().userId)
            .then(res => {
                if (res && !res.errorCode) {
                    if (res.data && res.data.infoId) {
                        let dialogObj = {
                            title: '',
                            content: '即将进入您的当前进货店铺：' + res.data.wdName,
                            assistBtn: '取消',
                            mainBtn: '确定',
                            type: 'info',
                            assistFn() {

                            },
                            mainFn() {
                                self.$router.push({
                                    path: 'cms_purchase_goods_detail',
                                    query: {
                                        goodsId: goodsId,
                                        shopId: res.data.infoId
                                    }
                                });
                            }
                        };
                        self.$store.state.$dialog({ dialogObj });
                    }
                }
            })
    }

    isTichengOrder() {
        let userId = getLocalUserInfo().userId;
        return this.orderInfo && (this.orderInfo.shopId != userId);
    }

    countDown(leftchektime) {
        this.timerID && clearInterval(this.timerID);
        let time_distance, _this = this;
        time_distance = leftchektime / 1000;
        this.timerID = setInterval(function () {
            time_distance--;
            if (time_distance > 0) {
                _this.orderTimer.int_hour = Math.floor(time_distance / (60 * 60) % 24);
                _this.orderTimer.int_minute = Math.floor(time_distance / 60 % 60);
                _this.orderTimer.int_second = Math.floor(time_distance % 60);
                //加0
                if (_this.orderTimer.int_hour < 10) {
                    _this.orderTimer.int_hour = "0" + _this.orderTimer.int_hour;
                }
                if (_this.orderTimer.int_minute < 10) {
                    _this.orderTimer.int_minute = "0" + _this.orderTimer.int_minute;
                }
                if (_this.orderTimer.int_second < 10) {
                    _this.orderTimer.int_second = "0" + _this.orderTimer.int_second;
                }
            }
            else {
                _this.orderTimer.int_day = '00';
                _this.orderTimer.int_hour = '00';
                _this.orderTimer.int_minute = '00';
                _this.orderTimer.int_second = '00';
                clearInterval(_this.timerID);

                setTimeout(() => {
                    _this._$service.getOrderInfo(_this.orderId, _this.outState)
                        .then(res => {
                            if (!res || res.errorCode || !res.data.orderWhole) {

                            } else {
                                _this.orderInfo = res.data.orderWhole;
                                _this.goodsInfo = res.data.orderGoods;
                                _this.commi = res.data.orderCommi;
                                _this.curShopBuyDisct = res.data.curShopBuyDisct ? res.data.curShopBuyDisct : 100;
                            }
                        })
                }, 1000)

            }
        }, 1000);
    }

    destroyed() {
        if (this.timerID) {
            clearInterval(this.timerID);
        }
    }

    refuse(orderId) {
        let self = this;
        this._$service.upShopInfo(getLocalUserInfo().userId)
            .then(res => {
                if (res && !res.errorCode) {
                    let dialogObj = {
                        title: '确认拒绝',
                        content: '确认拒绝备货后，订单将会被推送到' + res.data.wdName + '，确认拒绝？',
                        assistBtn: '取消',
                        mainBtn: '确定',
                        assistFn() {

                        },
                        mainFn() {
                            self.sureRefuse(orderId);
                        }
                    };
                    self.$store.state.$dialog({ dialogObj });
                } else {//给个安全的处理方案
                    let dialogObj = {
                        title: '确认拒绝',
                        content: '确认拒绝备货后，订单将会被推送到上级微店，确认拒绝？',
                        assistBtn: '取消',
                        mainBtn: '确定',
                        assistFn() {

                        },
                        mainFn() {
                            self.sureRefuse(orderId);
                        }
                    };
                    self.$store.state.$dialog({ dialogObj });
                }
            })
    }

    sureRefuse(orderId) {
        let self = this;
        this._$service.throwOrder(orderId)
            .then(res => {
                if (!res || res.errcode) {
                    let dialogObj = {
                        title: '',
                        content: '抛单错误:' + res.errcode,
                        type: 'info',
                        mainBtn: '返回',
                        assistFn() {
                        },
                        mainFn() {

                        }
                    };
                    self.$store.state.$dialog({ dialogObj });
                } else {
                    self.$router.back();
                }
            })
    }

    goodsPrice() {
        if (this.isTichengOrder()) {
            return Math.ceil(this.goodsInfo.purchasePrice * this.commi.shopSaleDisct / 100);
        } else {
            return Math.ceil(this.orderInfo.purchasePrice * this.orderInfo.shopSaleDisct / 100);
        }
    }

    stockNow(orderId) {
        this.$router.push({
            path: 'my_inventory_detail',
            query: {
                goodsId: this.goodsInfo.goodsId,
                orderId
            }
        })
    }

    saleTotal() {
        return Math.ceil(this.goodsPrice()) * this.orderInfo.number
    }

    buyTotal() {
        if (this.isTichengOrder()) {
            return this.orderInfo.purchasePrice * this.commi.shopBuyDisct * this.orderInfo.number / 100
        } else if (this.curShopBuyDisct == 100) {
            return this.orderInfo.purchasePrice * this.orderInfo.shopBuyDisct * this.orderInfo.number / 100
        } else {
            return false;
        }
    }

    incomeTotal() {
        if (this.isTichengOrder()) {
            return (this.commi.shopSaleDisct - this.commi.shopBuyDisct) / 100 * this.orderInfo.purchasePrice * this.orderInfo.number;
        } else if (this.curShopBuyDisct == 100) {
            return (this.orderInfo.shopSaleDisct - this.orderInfo.shopBuyDisct) / 100 * this.orderInfo.purchasePrice * this.orderInfo.number * this.orderInfo.punishDisct / 100;
        } else {
            return false;
        }
    }

    incomeTotal1() {
        return (this.orderInfo.shopSaleDisct - this.orderInfo.shopBuyDisct) * this.orderInfo.punishDisct / 100 / 100 * this.orderInfo.purchasePrice * this.orderInfo.number
    }

}
