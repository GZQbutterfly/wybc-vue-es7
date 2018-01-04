import { Component} from 'vue-property-decorator';
import BaseVue  from 'base.vue';
import orderDetailService from './order.detail.service';
import { toLogin, getZoneData ,getLocalUserInfo} from 'common.env';


// import { hptPayDialog } from '../../../../commons/pay/hptDialog';
require('./order.detail.scss');

@Component({
    template: require('./order.detail.html')
})

export class CmsPurchaseOrderDetail extends BaseVue {
    orderInfo = {};
    orderStateName = '';
    orderLeaveMsg = {};
    orderId;
    combinOrderNo;
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
    totalPrice  = 0;
    mounted() {
        document.title = "订单详情";
        //订单编号
        this.orderId = this.$route.query.orderId;
        this.combinOrderNo = this.$route.query.combinOrderNo;
        // 判断登录
        if (!localStorage._user && this.orderId) {
            toLogin(this.$router, { toPath: '/cms_purchase_order_detail?orderNo=' + this.orderId })
            return;
        }
        if (!localStorage._user && this.combinOrderNo) {
            toLogin(this.$router, { toPath: '/cms_purchase_order_detail?combinOrderNo=' + this.combinOrderNo })
            return;
        }
        //注册服务
        this._$service = orderDetailService(this.$store);
        //加载数据
        this.page_reload();
    }

    /**
     * 重加载
     */
    page_reload() {
        console.log('重加载')
        let _self = this;
        if (this.orderId) {
            this._$service.getOrderInfo(this.orderId).then((res) => {
                this.msg(res);
            });
        } else {
            this._$service.getCombin(this.combinOrderNo).then((res) => {
                this.msg(res);
            });
        }
    }

    msg(res) {
        let _self = this;
        let obj = {
        };
        if (!res.data.orderWhole || !res.data.orderGoods) {
            return;
        }

        if (_self.orderId) {
            res.data.orderGoods.moneyPrice = res.data.orderWhole.moneyPrice;
            _self.totalPrice = res.data.orderWhole.totalMoney;
            obj = res.data.orderWhole;
            obj.leftTime = res.data.leftTime;
            obj.goods = [];
            obj.goods.push(res.data.orderGoods);
        } else {
            for (let i = 0, len = res.data.orderWhole.length; i < len; i++) {
                res.data.orderGoods[i].moneyPrice = res.data.orderWhole[i].moneyPrice;
                _self.totalPrice += res.data.orderWhole[i].totalMoney;
            }
            obj = res.data.orderWhole[0];
            obj.leftTime = res.data.leftTime;
            obj.goods = [];
            obj.goods = res.data.orderGoods;
        }
        this.orderInfo = obj;
        console.log('订单详情:', this.orderInfo);
        //设置时间倒计时
        this.formatDate = '-- ';
        this.leftTime = this.orderInfo.leftTime || 0;
        this.timer && clearInterval(this.timer);
        //待支付
        if (this.orderInfo.orderState == 1 && this.leftTime > 0) {
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
            province: this.orderInfo.province,
            city: this.orderInfo.city,
            district: this.orderInfo.district,
        };
        if (this.orderInfo.province != null) {
            _address = getZoneData(_address);
            this.orderInfo._address = _address.province.na + _address.city.na + _address.district.na + this.orderInfo.address;
        }
        //虚物获取买家留言
        this.orderInfo.gsType === 2 && this.getUserLeaveMsg();
        //判断是否设置显示底部toast
        this.showToast = ([1, 4].indexOf(_self.orderInfo.orderState) !== -1);
        this.showDelWithRefund = (this.orderInfo.orderState === 2 && this.orderInfo.isDelete === 1);
        this.showDelWithRefund && (this.showToast = true);
        //判断是否显示退款按钮
        // (this.orderInfo.orderState > 1 && this.orderInfo.orderState < 6) && (this.showRefund = true);
        //判断是否显示物流信息
        this.showOrderNumber = ((this.orderInfo.orderState > 1 && this.orderInfo.orderState !== 6) && this.orderInfo.gsType != 2);
        //底部显示实付还是需付
        this.showTypeAndRefund = (this.orderInfo.orderState === 1 || (this.orderInfo.orderState === 6 && this.orderInfo.closeReason != 3));
    }

    /**
     * 得到格式化后的时间字符串
     * @param time
     */
    setFormatDate() {
        let date = '',
            stp = [60, 60, 24],
            mark = ['秒', '分', '小时'],
            i = 0;
        let time = this.leftTime,
            isMsec = true;
        isMsec && (time /= 1000);
        while (time > 0 && i < 3) {
            date = [Math.floor(time % stp[i]), time = Math.floor(time / stp[i])][0] + mark[i++] + date;
        }
        time > 0 && (date = time + '天' + date);
        // console.log('剩余时间:',date)
        this.formatDate = date;
    }

    /**
     * 得到订单状态全名称
     */
    getOrderStateName() {
        return ['', '等待买家付款', '交易完成', '交易关闭'][this.orderInfo.orderState]
            + ((this.orderInfo.orderState == 3) ? ' ('
                + ['', '买家取消', '支付超时', '买家退款', '订单异常'][this.orderInfo.closeReason] + ')' : '');
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
        this.orderLeaveMsg = JSON.parse(this.orderInfo.leaveMsg);
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
                                content: '确认收货' + (confirm.data.success ? '成功' : '失败') + '!',
                                type: confirm.data.success ? 'success' : 'error',
                                assistBtn: '',
                                mainBtn: '确认',
                                assistFn() {
                                },
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
        let _this=this;
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
        // hptPayDialog(this, this.orderId);
        let _this = this;
        let obj = this.$store.state.$loadding();
        let _parm = {
            combinOrderNo: this.orderInfo.combinOrderNo,
            orderId: this.orderInfo.orderId
        }
        this._$service.pay(_parm).then(res => {
            if (res) {
                // this.page_reload();
                _this.$router.push({ path: 'cms_stock_order', query: { listValue: '0' } });
            }
            obj.close();
        })
    }

    /**
     * 商品的申请退款
     */
    refund(orderGoodsId) {
        this.$router.push({ path: 'refund', query: { orderId: this.orderId, orderGoodsId: orderGoodsId } });
    }

    /**
     * 订单的删除并退款
     */
    delOrder(subOrderNo) {
        this._$service.dOrderWithRefund(this.orderId).then((ress) => {
            let _self = this;
            console.log('删除并退款:', ress)
            new Promise((res, rej) => {
                let dialogObj = {
                    title: '退款提示',
                    content: '删除并退款' + (ress.data.success ? '成功' : '失败') + '!',
                    type: ress.data.success ? 'success' : 'error',
                    assistBtn: '',
                    mainBtn: '确认',
                    assistFn() {
                    },
                    mainFn() {
                        res(true);
                        ress.data.success && _self.page_reload();
                    }
                }
                _self.$store.state.$dialog({ dialogObj });
            });
        });
    }

    toGoodsDetail(goodsId,shopId){
        let self = this;
        this._$service.upShopInfo(getLocalUserInfo().userId)
            .then(res => {
                if (res && !res.errorCode) {
                    let order = self.orderInfo;
                    if ((!order.shopId &&order.shopId!=res.data.infoId )|| order.shopId != res.data.infoId) {
                        let dialogObj = {
                            title: '',
                            content: '该店铺不是你的进货人店铺,是否直接进入当前进货人的进货店铺? ' + res.data.wdName,
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
                    }else{
                        self.$router.push({
                            path: 'cms_purchase_goods_detail',
                            query: {
                                goodsId: goodsId,
                                shopId: res.data.infoId
                            }
                        });
                    }
                }
            })
    }

}
