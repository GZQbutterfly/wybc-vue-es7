// 提交订单页面（预提交订单）
import {Component} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import {get} from 'lodash';
import {getZoneData} from 'common.env';

import {AddressDialogComponent} from './address/address.dialog.component';

import {Address} from '../../../sys/address/address';

import submitService from './order.submit.service';
import './order.submit.scss';

// ==>
/**
 * 直接购买 goods   实物  虚拟
 * 购物车结算 car      实物
 */
@Component({
    template: require('./order.submit.html'),
    components: {
        'address-dialog': AddressDialogComponent,
        'address-operation': Address
    }
})
export class OrderSubmit extends BaseVue {
    showNowifi = false;
    orderSrouce = 'car'; //订单来源（商品goods，购物车car）
    goodsType = 'entity'; // 商品类型（entity实物， empty虚拟物品（不能加入购物车，只能直接购物））
    orderList = [];
    entityModel = true; // 判断是否实物商品
    goodsId;
    number;

    //最小消费额
    minimumConsumption = -1;

    orderTotal = {
        price: 0, //总价格
        diffPrice: 0, // 差价（-现金卷）
        roll: 0, //总现金卷
        transportPrice: 0, //总配送费
        discount: 0, // 总折扣
        pay: 0 //支付总价
    };
    orderAddress = {
        name: '',
        address: '',
        phone: '',
        addrId: ''
    };
    leaveMsg = []; // 虚拟商品的用户表单格式json
    selectAddressFlag = false;
    showDialogAddress = false;
    showAddAddress = false;
    payResult = {}; // 支付结果
    _$service;

    //套餐
    packageId;
    packageData;
    packageNumb;
    canBuy = true;
    //关闭支付
    choosePayShow = false;
    orderId; //订单号
    data() {
        return {};
    }
    mounted() {
        this.$nextTick(() => {
            this.initPage();
        })
    }
    closeFn() { //取消支付
        this.choosePayShow = false;
    }
    initPage() {
        if (sessionStorage.____addressBack) {
            // 地址修改回调
            sessionStorage.removeItem('____addressBack');
            this.dialogSelectAddress();
        }
        //get query
        //type
        this.orderSrouce = this.$route.query.orderSrouce;
        //购物车
        let cartIds = this.$route.query.cartId;
        //直接购买
        this.goodsType = this.$route.query.goodsType;
        this.goodsId = this.$route.query.goodsId;
        this.number = this.$route.query.number;
        this.orderList = [];
        //console.log('购买方式', this.orderSrouce);

        // 注册服务
        this._$service = submitService(this.$store);
        this._$service.nowifi((flag) => {
            this.showNowifi = true;
        });
        // 实物地址  虚拟手机号码
        if (this.orderSrouce === 'car') {
            //for 购物车
            this.entityModel = true;
            this._$service.queryCarOrders({shopCartIds: cartIds}).then((res) => {
                this.orderList = get(res, 'data.data') || {};
                //console.log('购物车所有商品', this.orderList)
                this.parseOrderList();
                this.queryDefaultAddress();
            });
        } else if (this.orderSrouce === 'package') {
            //for 套餐
            this.packageId = this.$route.query.packageId;
            this.packageNumb = this.$route.query.packageNumb.split(",");
            this.entityModel = true;
            this.doPackageEverything();
            this.queryDefaultAddress();
        } else {
            //for 直接购买
            // goodsId : 111
            // number : 3
            //let _num = 1;
            let _parm = {
                goodsId: this.goodsId
            };
            if (this.goodsType == 'entity') {
                this.entityModel = true;
                this.queryDefaultAddress();
            } else {
                this.entityModel = false;
            }
            let wdInfo = JSON.parse(localStorage.wdVipInfo);
            console.log(wdInfo);
            this._$service.queryOrder(_parm).then((res) => {
                let _result = res.data.data;
                _result.number = this.number;
                let obj = {
                    "shopId": wdInfo.infoId,
                    "shopName": wdInfo.wdName,
                    "shopCarts": [_result]
                }
                this.orderList.push(obj);
                this.parseOrderList();
                _result.leaveMsg && (this.leaveMsg = JSON.parse(_result.leaveMsg));
            });
        }
        // this.updateMinimumConsumption();
    }

    /**
     * 实物商品进入商品默认加载该用户的默认的地址
     */
    queryDefaultAddress(addrId) {
        let _orderAddress = {};
        this._$service.queryDefaultAddress(addrId).then((res) => {
            let _result = res.data;
            if (!_result.errorCode) {
                if (_result) {
                    _orderAddress.address = _result.address;
                    _orderAddress.name = _result.name;
                    _orderAddress.phone = _result.phone;
                    _orderAddress.addrId = _result.addrId;
                    this.selectAddressFlag = true;
                    getZoneData(_result).then((info) => {
                        _orderAddress.addressInfo = info;
                        this.orderAddress = _orderAddress;
                    });
                } else {
                    this.orderAddress = {};
                    this.selectAddressFlag = false;
                }
            }
        })
    }
    /**
     * 处理套餐相关
     */
    doPackageEverything() {
        this._$service.queryPackage(this.packageId).then((res) => {
            this.packageData = res.data.data;
            console.log('套餐数据', this.packageData)
            console.log('商品数量', this.packageNumb);
            //计算数据
            //判断套餐失效 (下架,库存)
            //计算订单价格

            //预处理
            //套餐类型
            let packageType = this.packageData[0].packageType;
            //活动最低消费
            let minMoney = this.packageData[0].minMoney;
            if (packageType == 1) {
                minMoney = 0;
            }
            //套餐的原始总价
            let totalMoney = 0;
            //优惠的价格
            let redirectMoney = 0;
            //处理各个商品
            let len = this.packageData.length;
            for (let i = 0; i < len; i++) {
                let _item = this.packageData[i];
                //处理判断订单失效
                if (this.canBuy) {
                    if (this.packageNumb[i] != 0) {
                        if (packageType == 1) {
                            //固定套餐判断所有
                            if (_item.state != 1) {
                                this.canBuy = false;
                            } else if (_item.amout < this.packageNumb[i]) {
                                this.canBuy = false;
                            }
                        } else if (packageType == 2) {
                            //自选套餐判断主商品
                            if (_item.packageGsType == 1) {
                                if (_item.state != 1) {
                                    this.canBuy = false;
                                } else if (_item.amout < this.packageNumb[i]) {
                                    this.canBuy = false;
                                }
                            }
                        }
                    }
                }
                //计算套餐订单的原始总价
                totalMoney += _item.gsMoneyPrice * this.packageNumb[i];
            }
            //计算达到最低消费的优惠
            if (totalMoney > minMoney) {
                for (let i = 0; i < len; i++) {
                    let _item = this.packageData[i];
                    if (_item.redirect == 2) {
                        redirectMoney += (_item.purchasePrice - _item.moneyPrice) * this.packageNumb[i];
                    }
                }
                console.log('达到最小消费,优惠' + (
                redirectMoney / 100).toFixed(2));
            }
            //转换成页面上显示的数据
            let _orderTotal = this.orderTotal;
            for (let i = 0; i < len; i++) {
                let _item = this.packageData[i];
                //数量为0的不显示
                if (this.packageNumb[i] > 0) {
                    let showRoll = _item.consuType == 3;
                    let moneyRoll = _item.gsMoneyRoll; //'0' || 1 => '0' , 0 || 1 => 1
                    let moneyPrice = _item.gsMoneyPrice;
                    let purchasePrice = _item.gsPurchasePrice;
                    if (redirectMoney && _item.redirect == 2) {
                        if (moneyRoll) {
                            showRoll = true;
                        } else {
                            showRoll = false;
                            purchasePrice = _item.moneyPrice;
                        }
                    }
                    let item = {
                        coverImg: _item.img,
                        goodsName: _item.name,
                        showRoll: showRoll,
                        moneyRoll: moneyRoll,
                        moneyPrice: moneyPrice,
                        purchasePrice: purchasePrice,
                        number: this.packageNumb[i]
                    };
                    //处理整合数据
                    if (item.showRoll) {
                        _orderTotal.showRoll = true; //显示券抵扣
                        _orderTotal.roll += (item.moneyRoll * item.number) || 0; //抵扣了券数
                        _orderTotal.diffPrice += ((item.purchasePrice - item.moneyPrice) * item.number) || 0; //券抵扣币数
                    }
                    _orderTotal.price += (item.purchasePrice * item.number) || 0; //原价

                    this.orderList.push(item);
                }
            }
            console.log('处理后的套餐数据', this.orderList);
            //处理整合数据
            _orderTotal.discount = 0; //折扣价
            _orderTotal.transportPrice = 0; // 配送费
            _orderTotal.pay = _orderTotal.price - _orderTotal.diffPrice - _orderTotal.transportPrice - _orderTotal.discount;
            //检查
            this.checkPackageCanBuy();
        });
    }
    /**
     * 检测套餐订单是否能购买
     */
    checkPackageCanBuy() {
        if (!this.canBuy) {
            let dialogObj = {
                title: '提示',
                content: '非常抱歉，当前套餐已失效，暂无法购买！',
                type: 'info',
                assistBtn: '',
                mainBtn: '知道啦',
                assistFn() {},
                mainFn() {}
            };
            this.$store.state.$dialog({dialogObj});
        }
        return this.canBuy;
    }
    /**
     * 弹出选择地址
     */
    dialogSelectAddress() {
        this.showDialogAddress = true;
    }
    /**
     * 关闭地址
     */
    closeDialogAddess() {
        let _orderAddress = this.orderAddress;
        this.showDialogAddress = false;
        sessionStorage.removeItem('____addressBack');
        this.queryDefaultAddress(_orderAddress.addrId);
    }
    /**
     * 弹出新增地址面板
     */
    dialogCrateAddress() {
        this.showAddAddress = true;
    }
    /**
     * 关闭新增地址面板
     */
    closeCrateAddress() {
        this.showAddAddress = false;
    }

    checkOrder() {}
    /**
     * 提交订单
     */
    submitOrder() {
        let own = localStorage.ownShop;
        if (own && own == 1) {
            let dialogObj = {
                title: '',
                content: '您是店主，不能购买自己店铺的商品!',
                assistBtn: '',
                type: 'info',
                mainBtn: '知道啦',
                assistFn() {},
                mainFn() {}
            };
            this.$store.state.$dialog({dialogObj});
            return;
        }
        let _self = this;
        let _orderTotal = this.orderTotal;
        let orderAddress = _self.orderAddress;
        let orderList = _self.orderList;
        let wdInfo = JSON.parse(localStorage.wdVipInfo);
        let _data = {
            addrId: orderAddress.addrId,
            leaveMsg: 'null',
            numbers: [],
            goods: [],
            shopId: wdInfo.infoId
        };

        //订单失效检测
        if (this.orderSrouce == 'package') {
            if (!this.checkPackageCanBuy()) {
                return;
            }
        }
        //检查订单提交格式(地址等)以及用户券是否足够
        if (((this.orderSrouce == 'goods') && this.goodsType != 'entity') || this.isAddress()) {
            let obj = _self.$store.state.$loadding();
            let _result = null;
            if (_self.orderSrouce == 'car') {
                // 购物车
                // _data.shopCartIds = [];
                // for (let i = 0, len = orderList.length; i < len; i++) {
                //     _data.shopCartIds.push(orderList[i].id);
                // }
                _data.shopCartIds = _self.$route.query.cartId; //_data.cartIds.join(',');
                _result = _self._$service.submitMutiOrder(_data);
            } else if (_self.orderSrouce === 'package') {
                // 套餐
                _data.packageId = this.packageId;
                _data.goods = [];
                let len = this.packageData.length;
                for (let i = 0; i < len; i++) {
                    //数量为0不push
                    if (this.packageNumb[i] != 0) {
                        _data.numbers.push(this.packageNumb[i]);
                        _data.goods.push(this.packageData[i].goodsId);
                    }
                }
                _data.numbers = _data.numbers.join(',');
                _data.goods = _data.goods.join(',');
                // _data.leaveMsg = null;
                console.log('数量:', _data.numbers, '商品编号', _data.goods);
                _result = _self._$service.submitPackageOrder(_data);
            } else {
                _data.number = _self.number;
                if (_self.goodsType === 'entity') {
                    // 直接购买 + 实物
                    _data.goodsId = orderList[0].shopCarts[0].goodsId;
                    _result = _self._$service.submitOrder(_data);
                } else {
                    // 直接购买 + 虚拟
                    let _leaveMsg = {};
                    let _check = true;
                    for (let l = 0, len = _self.leaveMsg.length; l < len; l++) {
                        let _item = _self.leaveMsg[l];
                        if (!_item.value) {
                            _check = false;
                            break;
                        }
                        _leaveMsg[_item.name] = _item.value;
                    }
                    if (_check) {
                        _data.leaveMsg = JSON.stringify(_leaveMsg);
                        _data.goodsId = orderList[0].id;
                        _result = _self._$service.submitOrder(_data);
                    } else {
                        // show tip
                        let dialogObj = {
                            title: '',
                            content: '请填写留言信息!',
                            assistBtn: '',
                            type: 'info',
                            mainBtn: '知道啦',
                            assistFn() {},
                            mainFn() {}
                        };
                        _self.$store.state.$dialog({dialogObj});
                        obj.close();
                    }
                }
            }
            if (_result) {
                _result.then((res) => {

                    let _result = res.data;
                    if (_result.errorCode) {
                        let dialogObj = {
                            title: '订单支付',
                            content: _result.msg, // || '订单不存在'
                            type: 'info',
                            assistBtn: '',
                            mainBtn: '知道啦',
                            assistFn() {},
                            mainFn() {}
                        };
                        _self.$store.state.$dialog({dialogObj});
                        obj.close();
                    } else {
                        _self.payResult.orderId = _result.orderId;
                        let _param = {
                            combinOrderNo: _result.combinOrderNo,
                            orderId: _result.orderId
                        };
                        _self._$service.pay(_param).then((res) => {
                            if (res !== null) {
                                _self.payCallBack(res);
                            }
                            obj.close();
                        }).catch(() => {
                            obj.close();
                        });
                    }
                });
            }
        }
    }
    payCallBack(res) {
        // 取消支付 走订单， 支付成功，失败走订单详情
        let _self = this;
        if (res) {
            //console.log('已支付');
            this.$router.replace({path: 'user_order'});
        } else {
            //console.log('未支付');
            this.$router.replace({
                path: 'user_order',
                query: {
                    listValue: '1'
                }
            });
        }
    }
    /**
     * 实物商品提交订单时判断地址没有填写并给与提示
     */
    isAddress() {
        let _self = this;
        let orderAddress = _self.orderAddress;
        if (!orderAddress.addrId) {
            let dialogObj = {
                title: '提示',
                content: '请选择收货地址！',
                type: 'info',
                assistBtn: '',
                mainBtn: 'ok',
                assistFn() {},
                mainFn() {}
            };
            _self.$store.state.$dialog({dialogObj});
            return false;
        }
        return true;
    }
    /**
     * 虚拟商品保存时对未填写的表单进行dialog提示
     */
    emptyInputDialog() {
        let _self = this;
        let orderAddress = _self.orderAddress;
        if (!orderAddress.addrId) {
            let dialogObj = {
                title: '提示',
                content: '请填写带*号的文本框！',
                type: 'info',
                assistBtn: '',
                mainBtn: 'ok',
                assistFn() {},
                mainFn() {}
            };
            _self.$store.state.$dialog({dialogObj});
            return false;
        }
        return true;
    }
    /**
     * 处理订单数据
     */
    parseOrderList() {
        let list = this.orderList;
        let _orderTotal = this.orderTotal;
        if (this.entityModel) {
            // 实物
            for (let i = 0, len = list.length; i < len; i++) {
                for (let j = 0, len1 = list[i].shopCarts.length; j < len1; j++) {
                    let item = list[i].shopCarts[j];
                    let _num = item.number; // 数量
                    _orderTotal.price += (item.purchasePrice * _num) || 0; //原价
                    _orderTotal.transportPrice += item.transportPrice || 0; // 配送费
                }

            }
            _orderTotal.pay = _orderTotal.price + _orderTotal.transportPrice;
        } else {
            //虚拟
            for (let i = 0, len = list.length; i < len; i++) {
                let _item = list[i];
                let _num = _item.number;
                _orderTotal.purchasePrice = _item.purchasePrice * _num;
                _orderTotal.moneyPrice = _item.moneyPrice * _num;
            }
            _orderTotal.pay = _orderTotal.purchasePrice;
        }
    }
    /**
     * 地址选择回调
     * @param item
     */
    selectAddress(item) {
        this.selectAddressFlag = true;
        this.orderAddress = item;
        this.closeDialogAddess();
    }
    /**
     * 虚拟商品填写表单信息
     * @param item
     * @param event
     */
    changeInput(item, event) {
        item.value = event.target.value;
        console.log(this.leaveMsg);
    }
    // 没有网络点击按钮重新加载回调
    callBack() {
        this.showNowifi = false;
    }
    destroyed() {
        sessionStorage.removeItem('____addressBack');
    }

    //更新最低消费额
    // updateMinimumConsumption() {
    //     if (this.minimumConsumption != -1) {//无需更新
    //         return;
    //     } else {
    //         let self = this;
    //         this._$service.getMinimumConsumption()
    //             .then(res => {
    //                 if (res && !res.errCode && res.data) {
    //                     self.minimumConsumption = res.data.minimumConsumption;
    //                 }
    //             })
    //     }
    // }
}
