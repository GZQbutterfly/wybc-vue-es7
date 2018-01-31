import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { get } from 'lodash';
import { getZoneData } from 'common.env';
import { AddressDialogComponent } from './address/address.dialog.component';
import { Address } from '../../../sys/address/address';
import submitService from './order.submit.service';
import './order.submit.scss';

@Component({
    template: require('./order.submit.html'),
    components: {
        'address-dialog': AddressDialogComponent,
        'address-operation': Address
    }
})

export class OrderSubmit extends BaseVue {
    _$service;
    showNowifi = false;         //是否显示网络状态

    //公共
    orderSrouce = 'car';        //订单来源(商品goods,购物车car,套餐package)
    goodsType = 'entity';       //商品类型(实物entity,虚物empty)
    goodsList = [];             //订单内商品数据列表
    canBuy = true;              //订单是否能提交
    minimumConsumption = -1;    //最底消费额
    orderTotal = {              //订单汇总
        price: 0,               //总价格
        diffPrice: 0,           //差价(现金卷)
        roll: 0,                //总现金卷
        transportPrice: 0,      //总配送费
        discount: 0,            //总折扣
        pay: 0                  //支付总价
    };

    //地址相关
    selectAddressFlag = false;  //是否选择收货地址
    showDialogAddress = false;  //是否显示地址
    showAddAddress = false;     //是否显示增加地址
    chooseAddressState = 4;     //选择地址的状态(1.未选择 2.选择校外地址 3.选择校内非微店所属校区地址 4.选择校内地址，即微店所属校区内地址)
    isInsideSchool = 1;         //是否为学校地址(1.是 0.否)
    schoolName = '';            //校区名
    orderAddress = {            //收货地址汇总
        name: '',
        address: '',
        phone: '',
        addrId: ''
    };

    //运费相关
    noShipFee = false;          //是否需要支付运费
    shipFee = 0;                //运费金额
    dissatisfyPrice = 0;        //包邮金额(配送范围外的包邮金额)

    //直接购买相关
    goodsId;                    //商品ID
    number;                     //商品数量
    wdInfo = {};                //保存缓存里的微店信息,用于直接购买显示店信息
    leaveMsg = [];              //虚物 物流 json

    //套餐购买相关
    packageId;                  //套餐ID
    packageData;                //套餐商品ID数组
    packageNumb;                //套餐商品数量

    mounted() {
        let _self = this;
        _self.wdInfo = JSON.parse(localStorage.wdVipInfo);
        document.title = "提交订单";
        _self.$nextTick(() => {
            _self.getFee();
            _self.initPage();
        })
    }

    destroyed() {
        sessionStorage.removeItem('____addressBack');
    }

    /**
     * 获取运费相关信息
     */
    async getFee() {
        let _self = this;
        let _result = await submitService(_self.$store).getFee();
        _self.dissatisfyPrice = _result.data.freeShipFee;
        _self.shipFee = _result.data.outSchoolShipFee;
    }

    /**
     * 初始化
     */
    async initPage() {
        let _self = this;
        if (sessionStorage.____addressBack) {
            sessionStorage.removeItem('____addressBack');
            _self.dialogSelectAddress();
        }
        _self.orderSrouce = _self.$route.query.orderSrouce;
        let cartIds = _self.$route.query.cartId;
        _self.goodsType = _self.$route.query.goodsType;
        _self.goodsId = _self.$route.query.goodsId;
        _self.number = _self.$route.query.number;
        _self.goodsList = [];
        // 注册服务
        _self._$service = submitService(_self.$store);
        _self._$service.nowifi((flag) => {
            _self.showNowifi = true;
        });
        if (_self.orderSrouce === 'car') {
            //for 购物车
            _self.goodsType = 'entity';
            _self._$service.queryCarOrders({ shopCartIds: cartIds }).then(async (res) => {
                _self.goodsList = get(res, 'data.data') || {};
                await _self.queryDefaultAddress();
                _self.parseGoodsList();
            });
        } else if (_self.orderSrouce === 'package') {
            //for 套餐
            _self.packageId = _self.$route.query.packageId;
            _self.packageNumb = _self.$route.query.packageNumb.split(",");
            _self.goodsType = 'entity';
            _self.doPackageEverything();
            await _self.queryDefaultAddress();
        } else {
            //for 直接购买
            let query = {
                goodsId: _self.goodsId
            };
            if (_self.goodsType == 'entity') {
                await _self.queryDefaultAddress();
            }
            let res = await _self._$service.queryGoods(query);
            let res2 = await _self._$service.getWdInfo(_self.wdInfo.infoId);

            let _result = res.data.data;
            let _wdInfo = res2.data.wdVipInfo;
            _result.number = _self.number;
            let obj = {
                "shopId": _wdInfo.infoId,
                "shopName": _wdInfo.wdName,
                "school": _wdInfo.school,
                "shopCarts": [_result]
            }
            _self.goodsList.push(obj);
            _self.parseGoodsList();
            _result.leaveMsg && (_self.leaveMsg = JSON.parse(_result.leaveMsg));
        }
        // this.updateMinimumConsumption();
    }

    /**
     * 实物商品进入商品默认加载该用户的默认的地址
     */
    async queryDefaultAddress(addrId) {
        let _self = this;
        let _orderAddress = {};
        let _result = (await _self._$service.queryDefaultAddress(addrId)).data;
        if (!_result.errorCode) {
            _self.isInsideSchool = _result.isInsideSchool;
            if (_result) {
                _orderAddress.address = _result.address;
                _orderAddress.name = _result.name;
                _orderAddress.phone = _result.phone;
                _orderAddress.addrId = _result.addrId;
                _self.selectAddressFlag = true;
                if (_result.campus) {
                    _orderAddress.addressInfo = {
                        campus: _result.campus,
                        dormitory: _result.dormitory
                    }
                } else {
                    _orderAddress.addressInfo = await getZoneData(_result);
                }
                _self.orderAddress = _orderAddress;
            } else {
                _self.orderAddress = {};
                _self.selectAddressFlag = false;
            }
        }
    }

    /**
     * 处理套餐相关
     */
    doPackageEverything() {
        this._$service.queryPackage(this.packageId).then((res) => {
            this.packageData = res.data.data;
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
            }
            //转换成页面上显示的数据
            let _orderTotal = this.orderTotal;
            for (let i = 0; i < len; i++) {
                let _item = this.packageData[i];
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
                        _orderTotal.showRoll = true;                                                            //显示券抵扣
                        _orderTotal.roll += (item.moneyRoll * item.number) || 0;                                //抵扣了券数
                        _orderTotal.diffPrice += ((item.purchasePrice - item.moneyPrice) * item.number) || 0;   //券抵扣币数
                    }
                    _orderTotal.price += (item.purchasePrice * item.number) || 0;       //原价
                    this.goodsList.push(item);
                }
            }
            _orderTotal.discount = 0;       //折扣价
            _orderTotal.transportPrice = 0; //配送费
            _orderTotal.pay = _orderTotal.price - _orderTotal.diffPrice - _orderTotal.transportPrice - _orderTotal.discount;
            this.checkPackageCanBuy();      //检查
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
                assistFn() { },
                mainFn() { }
            };
            this.$store.state.$dialog({ dialogObj });
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
     * 关闭新增地址面板
     */
    closeCrateAddress() {
        this.showAddAddress = false;
    }

    /**
     * 提交订单
     */
    submitOrder() {
        let _self = this;
        let _data = {
            addrId: _self.orderAddress.addrId,
            leaveMsg: 'null',
            numbers: [],
            goods: [],
            shopId: _self.wdInfo.infoId
        };
        if (_self.orderSrouce == 'package') {
            //订单失效检测
            if (!_self.checkPackageCanBuy()) {
                return;
            }
        }
        //检查订单提交格式(地址等)以及用户券是否足够
        if (((_self.orderSrouce == 'goods') && _self.goodsType != 'entity') || _self.isAddress()) {
            let obj = _self.$store.state.$loadding();
            let _result = null;
            if (_self.orderSrouce == 'car') {
                // 购物车
                _data.shopCartIds = _self.$route.query.cartId;
                _result = _self._$service.submitMutiOrder(_data);
            } else if (_self.orderSrouce === 'package') {
                // 套餐
                _data.packageId = _self.packageId;
                _data.goods = [];
                let len = _self.packageData.length;
                for (let i = 0; i < len; i++) {
                    if (_self.packageNumb[i] != 0) {
                        _data.numbers.push(_self.packageNumb[i]);
                        _data.goods.push(_self.packageData[i].goodsId);
                    }
                }
                _data.numbers = _data.numbers.join(',');
                _data.goods = _data.goods.join(',');
                _result = _self._$service.submitPackageOrder(_data);
            } else {
                // 直接购买
                _data.number = _self.number;
                if (_self.goodsType === 'entity') {
                    // 实物
                    _data.goodsId = _self.goodsList[0].shopCarts[0].goodsId;
                    _result = _self._$service.submitOrder(_data);
                } else {
                    // 虚拟
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
                        _data.goodsId = _self.goodsList[0].id;
                        _result = _self._$service.submitOrder(_data);
                    } else {
                        let dialogObj = {
                            title: '',
                            content: '请填写留言信息!',
                            assistBtn: '',
                            type: 'info',
                            mainBtn: '知道啦',
                            assistFn() { },
                            mainFn() { }
                        };
                        _self.$store.state.$dialog({ dialogObj });
                        obj.close();
                    }
                }
            }
            //处理提交订单之后
            if (_result) {
                _result.then((res) => {
                    let _result = res.data;
                    if (_result.errorCode) {
                        let dialogObj = {
                            title: '提示',
                            content: _result.msg,
                            type: 'info',
                            assistBtn: '',
                            mainBtn: '知道啦',
                            assistFn() { },
                            mainFn() { }
                        };
                        _self.$store.state.$dialog({ dialogObj });
                        obj.close();
                    } else {
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

    /**
     * 支付结束回调
     */
    payCallBack(res) {
        // 取消支付 => 待支付订单 , 支付成功 => 所有订单
        let _self = this;
        if (res) {
            this.$router.replace({ path: 'user_order' });
        } else {
            let query = {
                listValue: '1'
            };
            this.$router.replace({ path: 'user_order', query: query });
        }
    }

    /**
     * 实物提交订单没有填写地址提示
     */
    isAddress() {
        let _self = this;
        if (!_self._self.orderAddress.addrId) {
            let dialogObj = {
                title: '提示',
                content: '请选择收货地址！',
                type: 'info',
                assistBtn: '',
                mainBtn: 'ok',
                assistFn() { },
                mainFn() { }
            };
            _self.$store.state.$dialog({ dialogObj });
            return false;
        }
        return true;
    }

    /**
     * 处理订单数据
     */
    parseGoodsList() {
        let _self = this;
        let list = _self.goodsList;
        let _orderTotal = _self.orderTotal;
        _orderTotal.price = 0;
        _orderTotal.pay = 0;
        if (_self.goodsType == 'entity') {
            //实物
            for (let i = 0, len = list.length; i < len; i++) {
                for (let j = 0, len1 = list[i].shopCarts.length; j < len1; j++) {
                    let item = list[i].shopCarts[j];
                    let _num = item.number;
                    _orderTotal.price += (item.purchasePrice * _num) || 0;
                }
            }
            _orderTotal.pay = _orderTotal.price;
            if(_self.selectAddressFlag){
                //选择地址
                if (_self.isInsideSchool == 1) {
                    //校内地址
                    let inSameSchool = true;
                    let value = _self.orderAddress.addressInfo.campus;
                    _self.goodsList.forEach(item => {
                        _self.schoolName = item.school;
                        if(value != item.school){
                            inSameSchool = false;
                        }
                    });
                    if(inSameSchool){
                        //相同校区
                        _self.chooseAddressState = 4;
                        //免运费
                        _self.noShipFee = true;
                    }else{
                        //不同校区
                        _self.chooseAddressState = 3;
                        if (_orderTotal.price >= _self.dissatisfyPrice) {
                            //免运费
                            _self.noShipFee = true;
                        }
                        else {
                            //收运费
                            _self.noShipFee = false;
                            _orderTotal.pay += Number(_self.shipFee);
                        }
                    }
                }else {
                    //校外地址
                    _self.chooseAddressState = 2;
                    if (_orderTotal.price >= _self.dissatisfyPrice) {
                        //免运费
                        _self.noShipFee = true;
                    }
                    else {
                        //收运费
                        _self.noShipFee = false;
                        _orderTotal.pay += Number(_self.shipFee);
                    }
                }
            }else{
                //未选择收货地址
                _self.chooseAddressState = 1;
                //界面显示免运费
                _self.noShipFee = true;
            }
        } else {
            //虚物
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
     */
    selectAddress(item) {
        let _self = this;
        _self.selectAddressFlag = true;
        _self.orderAddress = item;
        _self.isInsideSchool = item.isInsideSchool;
        _self.parseGoodsList();
        _self.closeDialogAddess();
    }

    /**
     * 虚拟商品填写表单信息
     */
    changeInput(item, event) {
        item.value = event.target.value;
    }

    /**
     * 没有网络点击按钮重新加载回调
     */
    callBack() {
        this.showNowifi = false;
    }

    /**
     * 更新最低消费额
     */
    updateMinimumConsumption() {
        if (this.minimumConsumption != -1) {
            return;
        } else {
            let self = this;
            this._$service.getMinimumConsumption()
                .then(res => {
                    if (res && !res.errCode && res.data) {
                        self.minimumConsumption = res.data.minimumConsumption;
                    }
                })
        }
    }
}
