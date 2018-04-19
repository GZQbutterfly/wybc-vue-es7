import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './distributor_detail_service';
import { timeout } from 'common.env';
import './distributor_detail.scss';
import { Tip } from './tip/tip';
@Component({
    template: require('./distributor_detail.html'),
    components: {
        'tip': Tip
    }
})
export class DistributorDetail extends BaseVue {
    deliveryInfo = { delivery: { deliveryMoney: 0 }, orders: [] };
    _$service;
    robData = {};
    tipShow = false;
    tipFirst = false;
    phonenumber = '';
    deliveryState = 0;
    mounted() {
        this._$service = service(this.$store);
        document.title = "配送订单详情";
        this.$nextTick(() => {
            this.initPage();
        });
    }

    initPage() {
        let _query = this.$route.query;
        let _self = this;
        this._$service.queryDeliveryOrderDetail(_query).then(res => {
            let _result = res.data;
            if (_result.errorCode) {
                let dialogObj = {
                    title: '提示',
                    content: _result.msg,
                    assistBtn: '',
                    mainBtn: '确定',
                    type: 'error',
                    assistFn() {

                    },
                    mainFn() {

                    }
                }
                _self.$store.state.$dialog({ dialogObj });
                return;
            }
            if (_result.orders[0].consuType == 3) {
                let _moneyPrice = _result.orders[0].number * _result.orders[0].goldPrice;
                if (_moneyPrice > _result.orders[0].totalGold) {
                    let _number = _result.orders[0].totalGold / _result.orders[0].goldPrice; //使用金币抵扣的数量
                    let _obj = JSON.parse(JSON.stringify(_result.orders[0]));
                    _obj.number = _result.orders[0].number - _number;
                    _obj.consuType = 2;
                    _obj.moneyPrice = _obj.purchasePrice;
                    _result.orders[0].number = _number;
                    _result.orders.push(_obj);
                }
                _self.deliveryInfo = _result;    
            }
            else {
                _self.deliveryInfo = _result;
            }


            _self.deliveryState = _result.delivery.deliveryState;
            // _self.deliveryInfo.delivery.deliveryState = 9;//test
        });
    }
    alertTip() {
        this.tipFirst = true;
        this.tipShow = !this.tipShow;
        this.$router.push({ path: "delivery_order" })
    }
    /**
     * 接单
     */
    reciveOrders(combinOrderNo) {
        let _self = this;
        this._$service.receivedOrderResult({ combinOrderNo }).then(res => {
            let _result = res.data;
            if (_result.errorCode) {
                let dialogObj = {
                    title: '提示',
                    content: _result.msg,
                    assistBtn: '',
                    mainBtn: '确定',
                    type: 'error',
                    assistFn() {

                    },
                    mainFn() {
                        _self.$router.push({ path: "delivery_order" })
                    }
                }
                _self.$store.state.$dialog({ dialogObj });
                return;
            }
            _self.tipFirst = true;
            _self.tipShow = !this.tipShow;
            _self.robData = _result;
        })
    }
    /**
    * 得到订单状态全名称
     "deliveryState" : 2,				
     //配送状态	 配送状态（0：支付成功，1：备货中（不用显示该状态）、2：抢单中、3：抢单失败、2：抢单成功、5：仓储中心分拣中、
     6：配送店长待取货、7：店长配送中、8：订单待调度（不用显示该状态）、9：分仓配送中、10：店长取消当前配送、11：配送完成）
    */
    getOrderStateName() {
        let _state = this.deliveryInfo.delivery.deliveryState;
        switch (_state) {
            case 0:
            case 1:
            case 2:
                return '等待配送店长抢单......';
            case 3:
            case 4:
            case 5:
                return '仓库中心分拣中......';
            case 6:
                return "等待配送店长取货......";
            case 7:
                return "配送店长正在配送.......";
            case 8:
                return '订单已取消，转由分仓配送......';
            case 9:
                return "分仓配送中.......";
            case 10:
                return '订单已取消，转由分仓配送......';
            case 11:
                return "店长配送员确认订单已送达！";
        }
    }
    /**
     * 取货
     */
    getGoods(combinOrderNo) {
        let _self = this;
        let dialogObj = {
            title: '提示',
            content: "是否确认取货？",
            assistBtn: '取消',
            mainBtn: '确定',
            type: 'info',
            assistFn() {
            },
            mainFn() {
                _self._$service.updatedDeliverOrderState({ combinOrderNo }).then(res => {
                    let _result = res.data;
                    if (_result.errorCode) {
                        let dialogObj = {
                            title: '提示',
                            content: _result.msg,
                            assistBtn: '',
                            mainBtn: '确定',
                            type: 'error',
                            assistFn() {
                            },
                            mainFn() {
                            }
                        }
                        _self.$store.state.$dialog({ dialogObj });
                        return;
                    }
                    _self.initPage();
                })

            }
        }
        _self.$store.state.$dialog({ dialogObj });


    }
    /**
     * 更新
     */
    reload() {
        this.tipFirst = false;
        this.tipShow = false;
        this.initPage();
    }
    /**
     * 联系商家
     */
    contactMerchant(phone) {
        let _self = this;
        _self.phonenumber = phone;
        if (_self.phonenumber) {
            timeout(() => {
                _self.$refs.callRef.click();
            }, 10);
        } else {
            let dialogObj = {
                title: '提示',
                type: 'info',
                content: '订单仓库分拣中，即将为你分配仓库配送员送货至你手中...',
                mainBtn: '知道啦',
                mainFn() {
                    //_self.callBusiness(item);
                }
            }
            _self.$store.state.$dialog({ dialogObj });
            _self.phonenumber = '';
        }
    }
    /**
    * 联系买家
    */
    contactBuyer(phone) {
        let _self = this;
        _self.phonenumber = phone;
        if (_self.phonenumber) {
            timeout(() => {
                _self.$refs.callRef.click();
            }, 10);
        } else {

            let dialogObj = {
                title: '提示',
                type: 'error',
                content: '无法联系买家！',
                mainBtn: '确定',
                mainFn() {
                    //_self.callBusiness(item);
                }
            }
            _self.$store.state.$dialog({ dialogObj });
            _self.phonenumber = '';
        }
    }
    /**
     * 确认送达
     */
    confirm(combinOrderNo) {
        let _self = this;
        let dialogObj = {
            title: '提示',
            content: "是否确认送达？",
            assistBtn: '取消',
            mainBtn: '确定',
            type: 'info',
            assistFn() {
            },
            mainFn() {
                _self._$service.confirmationOfDelivery({ combinOrderNo }).then(res => {
                    let _result = res.data;
                    if (_result.errorCode) {
                        let dialogObj = {
                            title: '提示',
                            type: 'error',
                            content: _result.msg,
                            mainBtn: '确定',
                            mainFn() {

                            }
                        }
                        _self.$store.state.$dialog({ dialogObj });
                    } else {
                        _self.initPage();
                    }
                })
            }
        }
        _self.$store.state.$dialog({ dialogObj });
    }
    /**
     *刷新
     */
    refresh(done) {
        this.tipFirst = false;
        this.tipShow = false;
        setTimeout(() => {
            this.initPage();
            done(true);
        }, 300);
    }
}