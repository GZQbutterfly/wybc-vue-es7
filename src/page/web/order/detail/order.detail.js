import {Component} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import orderDetailService from './order.detail.service';

import {toLogin, getZoneData} from 'common.env';

require('./order.detail.scss');

@Component({template: require('./order.detail.html')})

export class OrderDetail extends BaseVue {
    orderInfo = {
        orders: {}
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
    //你每个商品的退款按钮
    // showRefund: boolean = false;
    //商品显示物流
    showOrderNumber = false;
    //底部显示实付还是需付
    showTypeAndRefund = false;
    totalPrice = 0;
    mounted() {
        document.title = "我的订单";
        //注册服务
        this._$service = orderDetailService(this.$store);
        this.$nextTick(() => {
            //订单编号
            this.orderId = this.$route.query.orderId;
            this.combinOrderNo = this.$route.query.combinOrderNo;
            //判断登录
            if (!localStorage._user && this.orderId) {
                toLogin(this.$router, {
                    toPath: '/order_detail?orderNo=' + this.orderId
                })
                return;
            }
            if (!localStorage._user && this.combinOrderNo) {
                toLogin(this.$router, {
                    toPath: '/order_detail?orderNo=' + this.combinOrderNo
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
        if (this.orderId) {
            this._$service.getOrderInfo(this.orderId).then((res) => {
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
            // this.setFormatDate();
            this.timer = setInterval(() => {
                if (_self.leftTime > 0) {
                    _self.setFormatDate();
                    _self.leftTime = _self.leftTime - 1000;
                } else {
                    _self.formatDate = '0秒';
                    clearInterval(_self.timer);
                    _self.page_reload();
                }
            }, 1000);
        }
        //获取收货地址
        let _address = {
            province: this.orderInfo.orders.province,
            city: this.orderInfo.orders.city,
            district: this.orderInfo.orders.district
        };
        if (this.orderInfo.orders.province != null) {
            // _address = getZoneData(_address);
            this.orderInfo._address = _address.province + _address.city + _address.district + this.orderInfo.orders.address;
        }
        //虚物获取买家留言
        this.orderInfo.gsType === 2 && this.getUserLeaveMsg();
        //判断是否设置显示底部toast
        this.showToast = ([1, 4].indexOf(_self.orderInfo.orders.orderState) !== -1);
        this.showDelWithRefund = (this.orderInfo.orders.orderState === 2 && this.orderInfo.isDelete === 1);
        this.showDelWithRefund && (this.showToast = true);
        //判断是否显示退款按钮
        // (this.orderInfo.orderState > 1 && this.orderInfo.orderState < 6) && (this.showRefund = true);
        //判断是否显示物流信息
        this.showOrderNumber = ((this.orderInfo.orders.orderState > 1 && this.orderInfo.orders.orderState != 6));
        //底部显示实付还是需付
        this.showTypeAndRefund = (this.orderInfo.orders.orderState === 1 || (this.orderInfo.orders.orderState === 6 && this.orderInfo.orders.closeReason != 3));
    }
    /* 转换数据格式，为多店而生 */
    changeRes(res) {
        if (this.orderId) {
            res = {
                leftTime: res.leftTime,
                leftDay: res.leftDays,
                orderGoods: [res.orderGoods],
                orders: [res.order],
                logis: res.logis
            }
        }
        res.orders.forEach(v => {
            this.totalPrice += v.totalMoney;
        })

        let a = {
            leftTime: res.leftTime,
            orders: res.orders[0],
            leftDay: res.leftDay,
            shop: [],
            logis: []
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
                shopGoods: []
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
        // console.log(a);
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
     * @param time
     */
    setFormatDate() {
        let date = '',
            stp = [
                60, 60, 24
            ],
            mark = [
                '秒', '分', '小时'
            ],
            i = 0;
        let time = this.leftTime,
            isMsec = true;
        isMsec && (time /= 1000);
        while (time > 0 && i < 3) {
            date = [
                Math.floor(time % stp[i]),
                time = Math.floor(time / stp[i])
            ][0] + mark[i++] + date;
        }
        time > 0 && (date = time + '天' + date);
        // console.log('剩余时间:',date)
        this.formatDate = date;
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
            (this.orderInfo.orders.orderState === 6)
            ? ' (' + ['', '买家取消', '支付超时', '买家退款', '订单异常'][this.orderInfo.orders.closeReason] + ')'
            : '');
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
                                    confirm.data.success
                                    ? '成功'
                                    : '失败') + '!',
                                type: confirm.data.success
                                    ? 'success'
                                    : 'error',
                                assistBtn: '',
                                mainBtn: '确认',
                                assistFn() {},
                                mainFn() {
                                    res(true);
                                    confirm.data.success && _self.page_reload();
                                }
                            }
                            _self.$store.state.$dialog({ dialogObj });
                        });
                    });
                    res(true);
                }
            };
            _self.$store.state.$dialog({ dialogObj });
        });
    }

    refresh(done) {
        let _this = this;
        _this.totalPrice = 0;
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
        let _this = this;
        let obj = this.$store.state.$loadding();
        console.log(1111)
        let _parm = {
            combinOrderNo: this.orderInfo.orders.combinOrderNo,
            orderId: this.orderInfo.orders.orderId
        }
        this._$service.pay(_parm).then(res => {
            if (res) {
                // this.page_reload();
                _this.$router.push({
                    path: 'user_order',
                    query: {
                        listValue: '0'
                    }
                });
            }
            obj.close();
        })
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
                        ress.data.success
                        ? '成功'
                        : '失败') + '!',
                    type: ress.data.success
                        ? 'success'
                        : 'error',
                    assistBtn: '',
                    mainBtn: '确认',
                    assistFn() {},
                    mainFn() {
                        res(true);
                        ress.data.success && _self.page_reload();
                    }
                }
                _self.$store.state.$dialog({ dialogObj });
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
}
