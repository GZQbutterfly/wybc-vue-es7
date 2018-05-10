import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import orderDetailService from './order.detail.service';
import {
    toLogin,
    getZoneData
} from 'common.env';
require('./order.detail.scss');

@Component({
    template: require('./order.detail.html')
})

export class OrderDetail extends BaseVue {
    orderInfo = {
        orders: {
            address: ""
        }
    };
    orderStateName = '';
    orderLeaveMsg = {};
    orderId = '';
    combinOrderNo = '';
    _$service;
    //设置和格式化后的事件字符串
    formatDate = '';
    leftTime;
    timer;
    //底部删除并退款
    showDelWithRefund = false;
    //底部toast
    showToast = false;
    //底部显示实付还是需付
    showTypeAndRefund = false;
    totalPrice = 0;
    shipFee = 0;
    totalCommonPrice = 0;
    totalGold = 0;
    totalRoll = 0;
    totalDisCountMoney = 0;
    useRoll = false;
    timeLimit = false;
    orderPayType = 0;

    mounted() {
        document.title = "我的订单";
        //注册服务
        this._$service = orderDetailService(this.$store);
        this.$nextTick(() => {
            //订单编号
            this.combinOrderNo = this.$route.query.combinOrderNo;
            if (!localStorage._user && this.combinOrderNo) {
                toLogin(this.$router, {
                    toPath: '/order_detail?combinOrderNo=' + this.combinOrderNo
                })
                return;
            }
            //加载数据
            this.page_reload();
        });
    }

    /**
     * 重加载
     */
    page_reload() {
        console.log('重加载')
        let _self = this;
        _self.totalPrice = 0;
        _self.shipFee = 0;
        if (this.orderId) {
            this._$service.getOrderInfo(this.combinOrderNo).then((res) => {
                if (res.data.errorCode) {
                    return;
                }
                this.orderInfo = this.changeRes(res.data);
                this.msg();
            })
        } else {
            this._$service.getCombinInfo(this.combinOrderNo).then((res) => {
                if (res.data.errorCode) {
                    return;
                }
                this.orderInfo = this.changeRes(res.data);
                this.msg();

            })
        }
    }

    msg() {
        let _self = this;
        this.formatDate = '-- ';
        this.leftTime = this.orderInfo.leftTime || 0;
        this.timer && clearInterval(this.timer);
        //待支付
        if (this.orderInfo.orders.orderState == 1 && this.leftTime > 0) {
            this.timer = setInterval(() => {
                if (_self.leftTime > 0) {
                    _self.formatDate = _self.setFormatDate(_self.leftTime);
                    _self.leftTime = _self.leftTime - 1000;
                } else {
                    _self.formatDate = '0秒';
                    clearInterval(_self.timer);
                    _self.page_reload();
                }
            }, 1000);
        }
        let _orderAddress = this.orderInfo.orders.address;
        //获取收货地址
        let _address = {
            province: _orderAddress.province,
            city: _orderAddress.city,
            district: _orderAddress.district,
            campus: _orderAddress.campus,
            dormitory: _orderAddress.dormitory,
            sex: _orderAddress.sex
        };
        if (_orderAddress.campus != null) {
            // _address = getZoneData(_address);
            this.orderInfo._address = _address.campus + _address.dormitory + _orderAddress.address;
        } else if (_orderAddress.province != null) {
            // _address = getZoneData(_address);
            this.orderInfo._address = _address.province + _address.city + _address.district + _orderAddress.address;
        }
        this.orderInfo.sex = _address.sex;
        //虚物获取买家留言
        this.orderInfo.gsType === 2 && this.getUserLeaveMsg();
        //判断是否设置显示底部toast
        this.showToast = ([1, 4].indexOf(_self.orderInfo.orders.orderState) != -1);
        this.showDelWithRefund = (this.orderInfo.orders.orderState == 2 && this.orderInfo.isDelete == 1);
        this.showDelWithRefund && (this.showToast = true);
        //底部显示实付还是需付
        this.showTypeAndRefund = (this.orderInfo.orders.orderState == 1 || (this.orderInfo.orders.orderState == 6 && this.orderInfo.orders.closeReason != 3));
    }

    /* 转换数据格式，为多店而生 */
    changeRes(res) {
        let _self = this;
        if (_self.orderId) {
            res = {
                leftTime: res.leftTime,
                leftDay: res.leftDays,
                orderGoods: [res.orderGoods],
                orders: [res.order],
                logis: res.logis,
                delivery: res.delivery
            }
        }
        _self.useRoll = false;
        _self.timeLimit = false;
        _self.totalGold = 0;
        _self.totalRoll = 0;
        _self.totalCommonPrice = 0;
        _self.totalDisCountMoney = 0;
        _self.orderPayType = 0; //金币购标识
        res.orders.forEach(v => {
            _self.totalPrice += Number(v.totalMoney);
            _self.shipFee += Number(v.shipFee);
            if (v.consuType == 3 && v.periodId == 0) {
                _self.totalGold += Number(v.totalGold);
                _self.orderPayType = 1;
            }
            if (v.periodId > 0) {
                _self.timeLimit = true;
                _self.orderPayType = 2;
            }
            if (v.couponMoney != null) {
                _self.useRoll = true;
                _self.totalRoll += Number(v.couponMoney)  || 0;
            }

        })
     
     
        res.orderGoods.forEach(v => {
            _self.totalCommonPrice += Number(v.purchasePrice * v.number);
      
            _self.totalDisCountMoney += Number(v.purchasePrice * v.number - v.moneyPrice * v.number);
        })
        let a = {
            leftTime: res.leftTime,
            orders: res.orders[0],
            leftDay: res.leftDay,
            shop: [],
            logis: [],
            delivery: res.delivery
        };
        if (res.logis) {
            a.logis.push(res.logis);
        } else {
            a.logis = '';
        }
        let c = [];
        res.orders.forEach((item, index) => {
            let b = {
                shopId: item.shopId,
                shopName: item.shopName,
                shopGoods: [],
                periodId: item.periodId
            };
            if (c.length == 0) {
                b.shopGoods.push(res.orderGoods[index]);
                c.push(b);
                return;
            };
            let ind = find(c, b.shopId);
            if (ind != -1) {
                c[ind].shopGoods.push(res.orderGoods[index]);
            } else {
                b.shopGoods.push(res.orderGoods[index]);
                c.push(b);
            }
        });
        a.shop = c;
        return a;

        function find(a, b) {
            for (let i = 0; i < a.length; i++) {
                if (a[i].shopId == b) {
                    return i;
                }
            }
            return -1;
        }

    }

    /**
     * 得到格式化后的时间字符串
     * @param time      毫秒数
     * @param formatLen 格式位数
     */
    setFormatDate(time, formatLen = 4) {
        let format = [{
            step: 1000,
            mark: '秒',
        }, {
            step: 60,
            mark: '分',
        }, {
            step: 60,
            mark: '小时',
        }, {
            step: 24,
            mark: '天',
        }, {
            step: 7,
            mark: '周',
        }];
        let getFormat = (time, i = -1) => {
            time = Math.floor(time / format[++i].step);
            if (!time) {
                return '';
            }
            if (formatLen - 1 == i) {
                return time + format[i].mark;
            } else {
                return getFormat(time, i) + (time % format[i + 1].step) + format[i].mark;
            }
        };
        return getFormat(time);
    }

    /**
     * 得到订单状态全名称
     */
    getOrderStateName() {
        return [
            '',
            '等待买家付款',
            '等待商家发货',
            '商家发货中',
            '商家已发货',
            '交易完成',
            '交易关闭'
        ][this.orderInfo.orders.orderState] + (
            (this.orderInfo.orders.orderState === 6) ?
            ' (' + ['', '买家取消', '支付超时', '订单异常'][this.orderInfo.orders.closeReason] + ')' :
            '');
    }

    /**
     * 物流状态
     */
    getOrderLogisState() {
        let _state = this.orderInfo.delivery.deliveryState;
        switch (_state) {
            case 0:
            case 1:
            case 2:
                return "用户完成支付,订单即将发货";
            case 3:
                return "订单发货，并由分仓配送";
            case 4:
                return "订单发货，并分配店长配送员为你配送";
            case 5:
                return "订单包裹分拣中";
            case 6:
                return "分拣完成，配送店长待取货";
            case 7:
                return "已取货，订单配送中";
            case 9:
                return "已经为您指派分仓配送员，分仓配送中";
            case 8:
            case 10:
                return "配送店长取消本次配送，即将转交分仓配送";
            case 11:
                return "订单已送达，交易完成";

        }
    }

    // /**
    //  * 当前商品是否显示退款
    //  */
    // CanRefund(refundStatus) {
    //     return this.showRefund && refundStatus!=undefined;
    // }

    /**
     * 得到订单退款处理状态
     */
    // getRefundStatus(refundStatus) {
    //     return ['申请退款', '退款申请中', '退款关闭', '退款失败'][refundStatus];
    // }

    /**
     * 虚物 买家留言
     */
    getUserLeaveMsg() {
        this.orderLeaveMsg = JSON.parse(this.orderInfo.orders.leaveMsg);
        console.log('虚物留言', this.orderLeaveMsg)
    }

    /**
     * 确认收货
     */
    confirmReceipt() {
        let _self = this;
        new Promise((res, rej) => {
            let dialogObj = {
                title: '确认收货',
                content: '确认收货后,订单交易完成。钱款将立即到达商家账号。',
                assistBtn: '取消',
                mainBtn: '确认收货',
                assistFn() {
                    res(false);
                },
                mainFn() {
                    _self._$service.confirmReceipt(_self.orderId).then((confirm) => {
                        console.log('收货结果:', confirm)
                        new Promise((res, rej) => {
                            let dialogObj = {
                                title: '确认收货',
                                content: '确认收货' + (
                                    confirm.data.success ?
                                    '成功' :
                                    '失败') + '!',
                                type: confirm.data.success ?
                                    'success' :
                                    'error',
                                assistBtn: '',
                                mainBtn: '确认',
                                assistFn() {},
                                mainFn() {
                                    res(true);
                                    confirm.data.success && _self.page_reload();
                                }
                            }
                            _self.$store.state.$dialog({
                                dialogObj
                            });
                        });
                    });
                    res(true);
                }
            };
            _self.$store.state.$dialog({
                dialogObj
            });
        });
    }

    refresh(done) {
        let _this = this;
        _this.totalPrice = 0;
        _this.shipFee = 0;
        setTimeout(() => {
            _this.page_reload();
            done();
        }, 500);
    }

    infinite(done) {
        setTimeout(() => {
            done(true);
        }, 500);
    }

    /**
     * 支付
     */
    goPay() {
        let _parm = {
            combinOrderNo: this.orderInfo.orders.combinOrderNo,
            orderId: this.orderInfo.orders.orderId
        }
        let orderPayType = {
            combinOrderNo: this.orderInfo.orders.combinOrderNo,
            orderPayType: this.orderPayType,
          
        }

        let _param = {
            combinOrderNo: this.orderInfo.orders.combinOrderNo,
            orderId: this.orderInfo.orders.orderId,
            totalMoney:  this.totalPrice + this.shipFee,
            orderPayType: this.orderPayType
        }
        this.$router.push({path:'pay_list',query:_param});
    }

    /**
     * 商品的申请退款
     */
    refund(orderGoodsId) {
        this.$router.push({
            path: 'refund',
            query: {
                orderId: this.orderId,
                orderGoodsId: orderGoodsId
            }
        });
    }

    /**
     * 订单的删除并退款
     */
    delOrder(subOrderNo) {
        let _self = this;
        this._$service.dOrderWithRefund(this.orderId).then((ress) => {
            console.log('删除并退款:', ress)
            new Promise((res, rej) => {
                let dialogObj = {
                    title: '退款提示',
                    content: '删除并退款' + (
                        ress.data.success ?
                        '成功' :
                        '失败') + '!',
                    type: ress.data.success ?
                        'success' :
                        'error',
                    assistBtn: '',
                    mainBtn: '确认',
                    assistFn() {},
                    mainFn() {
                        res(true);
                        ress.data.success && _self.page_reload();
                    }
                }
                _self.$store.state.$dialog({
                    dialogObj
                });
            });
        });
    }

    goShop(shopId) {
        this.$router.push({
            path: "home",
            query: {
                shopId: shopId
            }
        });
    }
    toDetail(item, shopId, periodId) {
        let _self = this;
        if (periodId) {
            let _data = {
                goodsId: item.goodsId,
                periodId: periodId
            }
            this._$service.queryLimitPeriod(_data).then(res => {
                if (res.data.errorCode || !res.data) {
                    let dialogObj = {
                        title: '提示',
                        content: '当前商品限时购活动已结束！',
                        assistBtn: '',
                        mainBtn: '确定',
                        type: "info",
                        assistFn() {},
                        mainFn() {}
                    }
                    _self.$store.state.$dialog({
                        dialogObj
                    });
                } else {
                    this.$router.push({
                        path: "money_timelimit_detail",
                        query: {
                            goodsId: item.goodsId,
                            shopId: shopId,
                            periodId: res.data.periodId
                        }
                    });
                }
            })
        } else {
            let flag = this.orderInfo.orders.deliveryType == 1 ? true : false;
            this.$router.push({
                path: "goods_detail",
                query: {
                    goodsId: item.goodsId,
                    shopId: shopId,
                    from: item.consuType == 3 ? "money_gold_buy" : "",
                    isAgent: flag
                }
            });
        }
    }
    /**
     * 查看配送详情
     */
    toDelivery() {
        this.$router.push({
            path: 'web_order_delivery',
            query: {
                combinOrderNo: this.combinOrderNo,
                orderId: this.orderId
            }
        });
    }
}