/**
 * RMB订单 支持配送方式 快速仓配送
 * 
 * 金币购 不支持配送方式  
 */
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { get, isEmpty } from 'lodash';
import { getZoneData, timeout } from 'common.env';
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
        pay: 0,                 //支付总价
        goldPrice: 0,            // 金币
        goldShow: false
    };
    userGoldNum = 0;                //用户拥有金币数
    //地址相关
    selectAddressFlag = false;  //是否选择收货地址
    showDialogAddress = false;  //是否显示地址
    showAddAddress = false;     //是否显示增加地址
    chooseAddressState = 1;     //选择地址的状态(1.未选择 2.选择校外地址 3.选择校内非微店所属校区地址 4.选择校内地址，即微店所属校区内地址)
    isInsideSchool = 1;         //是否为学校地址(1.是 0.否)
    schoolName = '';            //校区名
    orderAddress = {            //收货地址汇总
        name: '',
        address: '',
        phone: '',
        addrId: ''
    };

    //运费相关
    shipFee = 0;                //实际支付运费
    showShipFeeFlag = true;     //跟邮费和免邮金额是否都以为零有关
    shipFee_outArea = 0;        //运费金额(运送区域外)
    dissatisfyPrice_outArea = 0;//包邮金额(配送范围外的包邮金额)
    shipFee_inArea = 0;         //运费金额(运送区域内)
    dissatisfyPrice_inArea = 0; //包邮金额(配送范围内的包邮金额)

    //直接购买相关
    goodsId;                    //商品ID
    number;                     //商品数量
    wdInfo = {};                //保存缓存里的微店信息,用于直接购买显示店信息
    leaveMsg = [];              //虚物 物流 json

    //套餐购买相关
    packageId;                  //套餐ID
    packageData;                //套餐商品ID数组
    packageNumb;                //套餐商品数量

    goodsLoadOverFlag = false;  //防止订单信息未加载完 前就点击提交订单
    orderSubmitFlag = false;    //防止多次提交  
    //优惠券显示
    couponShow = false;
    //优惠券价格
    couponMoney = 0;
    disCouponMoney = 0;
    userCouponId = 0;
    //标识 0rmb  1rmb+金币
    orderPayType = 0;
    userCouponShow = false;

    deliveryWays = ['', '快速仓配送', '普通配送', '第三方快递']; //配送状态 0 ：非快速仓（分仓），1：快速仓 ，（2：众包，3：物流，查询的时候不用它俩）
    deliveryWay = '普通配送';
    deliveryArrives = ['', '预计30分钟送达', '预计2小时送达', '预计2-5天送达',];
    deliveryArrive = '预计2小时送达';


    currentShop = {};

    deliveryNum = 0; // 配送库存

    moneyBuyFlag = false;
    periodId = 0; //限时购分场Id
    periodIdBuyFlag = false;//限时购商品显示
    dicCountTimeMoney = 0;
    mounted() {
        let _self = this;
      
        document.title = "提交订单";
        // 注册服务
        _self._$service = submitService(_self.$store);
        _self.$nextTick(async () => {
            _self.wdInfo = await this.$store.dispatch('CHECK_WD_INFO');
            // _self.getFee();
            _self.initPage(); 
        })
    }

    destroyed() {
        // sessionStorage.removeItem('____addressBack');
    }

    /**
     * 获取运费相关信息
     */
    async getFee(cb) {
        let _self = this;
        let _result = (await _self._$service.getFee()).data;
        _self.dissatisfyPrice_outArea = _result.freeShipFee;
        _self.defaultPrice_outArea = _self.dissatisfyPrice_outArea;
        _self.shipFee_outArea = _result.shipFee;
        let _result_in = (await _self._$service.getFee_in()).data;
        _self.dissatisfyPrice_inArea = _result_in.freeShipFee;
        _self.defaultPrice_inArea = _self.dissatisfyPrice_inArea;
        _self.shipFee_inArea = _result_in.shipFee;
        // let goldNum = await _self._$service.queryUserRoll();
        // this.userGoldNum = goldNum.data.amountGold;
        this.getCouponMoney();
        cb && cb();
    }

    /**
     * 获取运费相关信息(金币购)
     */
    async getFee_gold(cb) {
        let _self = this;
        let _result = (await _self._$service.getFee_gold()).data;
        _self.dissatisfyPrice_outArea = _result.freeShipFee;
        _self.defaultPrice_outArea = _self.dissatisfyPrice_outArea;
        _self.shipFee_outArea = _result.shipFee;
        let _result_in = (await _self._$service.getFee_in_gold()).data;
        _self.dissatisfyPrice_inArea = _result_in.freeShipFee;
        _self.defaultPrice_inArea = _self.dissatisfyPrice_inArea;
        _self.shipFee_inArea = _result_in.shipFee;
        let goldNum = await _self._$service.queryUserRoll();
        this.userGoldNum = goldNum.data.amountGold;
        cb && cb();
    }
    /**
     * 获取限时购运费
     */
    async getFee_timeLimitBuy(cb){
        let _self = this;
        let _result = (await _self._$service.getFee_timeLimitBuy()).data;
        _self.dissatisfyPrice_outArea = _result.freeShipFee;
        _self.defaultPrice_outArea = _self.dissatisfyPrice_outArea;
        _self.shipFee_outArea = _result.shipFee;
        let _result_in = (await _self._$service.getFee_in_timeLimitBuy()).data;
        _self.dissatisfyPrice_inArea = _result_in.freeShipFee;
        _self.defaultPrice_inArea = _self.dissatisfyPrice_inArea;
        _self.shipFee_inArea = _result_in.shipFee;
        // let goldNum = await _self._$service.queryUserRoll();
        // this.userGoldNum = goldNum.data.amountGold;
        cb && cb();
    }
    /**
     * 获取优惠券价格
     */
    getCouponMoney() {
        let id = this.$route.query.id;
        if (id) {
            let couponDetail = JSON.parse(sessionStorage.getItem("couponDetail"));
            this.couponShow = true;
            this.userCouponId = id;
            this.couponMoney = couponDetail.moneyPrice;
            this.disCouponMoney = couponDetail.deductionMoney
        } else {
            this.couponShow = false;
            this.couponMoney = 0;
            this.disCouponMoney = 0;
        }
    }
    firstParseGoods = true;
    activated() {
        // debugger;
        this.getCouponMoney();
        !this.firstParseGoods && this.parseGoodsList();
    }
    /**
     * 初始化
     */
    async initPage() {
        let isGoldBuy = false;
        let _self = this;
        let _query = _self.$route.query;
        _self.orderSrouce = _query.orderSrouce;
        let cartIds = _query.cartId;
        _self.goodsType = _query.goodsType;
        _self.goodsId = _query.goodsId;
        _self.number = _query.number;
        _self.periodId = _query.periodId;
        _self.goodsList = [];
        // _self._$service.nowifi((flag) => {
        //     _self.showNowifi = true;
        // });
        if (_query.from == 'money_gold_buy') {
            this.moneyBuyFlag = true;
        }
        else if (_query.periodId) {
            this.periodIdBuyFlag = true;
        }

        this.initDeliveryWay();

        if (this.defaultWay == 1) {
            this.fastShipFeeObj = (await this._$service.queryFastDeliveryShip()).data;
        }

        // 请求商品信息
        if (_self.orderSrouce === 'car') {
            //for 购物车
            _self.goodsType = 'entity';
            let _result = (await _self._$service.queryCarOrders({ shopCartIds: cartIds })).data;

            _self.wdInfo = await _self._$service.getWdInfo(_result.data[0].shopId);
            // _self.wdInfo = res2.wdVipInfo;
            _result.data.forEach(item => {
                if (item.commonShopCarts.length) {
                    item.shopCarts = item.commonShopCarts;
                }
                if (item.fastShopCarts.length) {
                    item.shopCarts = item.fastShopCarts;
                }
            })
            _self.goodsList = get(_result, 'data') || {};
            await _self.getFee(function () {
                _self.parseGoodsList();
            });
        } else if (_self.orderSrouce === 'package') {
            //for 套餐
            _self.packageId = _self.$route.query.packageId;
            _self.packageNumb = _self.$route.query.packageNumb.split(",");
            _self.goodsType = 'entity';
            await _self.getFee(function () {
                _self.doPackageEverything();
            });
        } else {
            //for 直接购买
            let query = {
                goodsId: _self.goodsId
            };
            let res = (await _self._$service.queryGoods(query)).data;
            let wdInfo= await _self._$service.getWdInfo(_self.wdInfo.infoId);

            let cb = function () {
                let _result = res.data;
                let _wdInfo = wdInfo;
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
            //邮费
            if (_self.goodsType == 'entity') {
                if (res.data.consuType == 3 && !_self.periodIdBuyFlag) {
                    await _self.getFee_gold(cb);
                } else if (_self.periodIdBuyFlag){
                    await _self.getFee_timeLimitBuy(cb);
                } else {
                    await _self.getFee(cb);
                }
            }

            this.deliveryNum = _query.deliveryNum || 0;
        }

        // 请求默认地址
        if (['car', 'package'].includes(_self.orderSrouce) || _self.goodsType == 'entity') {
            await _self.queryDefaultAddress();
        }


    }

    /**
     * 初始化配送方式
     */
    initDeliveryWay() {
        let _query = this.$route.query;

        // console.log('fastFlag: ', _query); 
        if (_query.fastFlag && !['false', '0'].includes(_query.fastFlag)) {
            // 快速仓标识 -> 快速仓配送
            this.defaultWay = 1;
        } else {
            this.defaultWay = 2;
        }
    }
    addressObj = {};
    /**
     * 实物商品进入商品默认加载该用户的默认的地址
     */
    async queryDefaultAddress(addrId) {
        let _self = this;
        let _orderAddress = {};
        let _result = (await _self._$service.queryDefaultAddress(addrId)).data;
        if (!_result.errorCode) {
            _self.isInsideSchool = _result.isInsideSchool;
            // TODO  快速订单
            if (!this.moneyBuyFlag) {
                if ([1, 2].includes(this.defaultWay) && _result && _result.campus != this.wdInfo.school) {
                    // 众包配送 快速仓配送时，默认地址不在该店铺所在校区地址时，清除默认地址显示
                    return;
                }
            }
            if (_result) {
                _orderAddress.address = _result.address;
                _orderAddress.name = _result.name;
                _orderAddress.phone = _result.phone;
                _orderAddress.addrId = _result.addrId;
                _orderAddress.sex = _result.sex;
                if (_result.campus) {
                    _orderAddress.addressInfo = {
                        campus: _result.campus,
                        dormitory: _result.dormitory
                    }
                } else {
                    _orderAddress.addressInfo = await getZoneData(_result);
                }
                _self.orderAddress = _orderAddress;
                _self.orderAddress.__result = _result;
            } else {
                _self.orderAddress = {};
            }
            
            _self.checkDeliveryWay();
            // 计算邮费
            _self.diffDeliveryMoney();
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
            _self.goodsLoadOverFlag = true;
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
        if (this.wdInfo) {
            this.showDialogAddress = true;
        }
    }

    /**
     * 关闭地址
     */
    closeDialogAddess() {
        let _orderAddress = this.orderAddress;
        this.showDialogAddress = false;
        sessionStorage.removeItem('____addressBack');
        this.checkDeliveryWay();
      //  this.queryDefaultAddress(_orderAddress.addrId);
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
        let id = this.$route.query.id;
        if (!_self.goodsLoadOverFlag) {
            setTimeout(function () {
                _self.submitOrder();
            });
            return;
        }
        if (_self.orderSubmitFlag) {
            return;
        }
        _self.orderSubmitFlag = true;
        let _data = {
            addrId: _self.orderAddress.addrId,
            leaveMsg: 'null',
            numbers: [],
            goods: [],
            shopId: _self.wdInfo.infoId,
        };
        if (!this.orderTotal.goldShow && !_self.periodId) {
            _data.deliveryType = this.defaultWay == 1 ? 1 : 0  //配送状态 0 ：非快速仓（分仓），1：快速仓 ，（2：众包，3：物流，查询的时候不用它俩）
        }
        if (_self.periodId) {
            _data.periodId = _self.periodId;
        }
        //是否用券
        if (id) {
            _data.userCouponId = id;
        }
        if (_self.orderSrouce == 'package') {
            //订单失效检测
            if (!_self.checkPackageCanBuy()) {
                _self.orderSubmitFlag = false;
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
                // _data.hasShopCoupon = _self.goodsList.hasShopCoupon;
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
                    // console.log(_self.goodsList[0].shopCarts[0])
                    if (_self.goodsList[0].shopCarts[0].consuType == 3) {
                        //抵扣的金币
                        _data.gold = _self.orderTotal.goldPrice;
                        _result = _self._$service.submitGoldOrder(_data);
                    } else if (_self.periodId) {  //限时购
                        _result = _self._$service.submitTimeLimitBuyOrder(_data);
                    }
                    else {
                        _result = _self._$service.submitOrder(_data);
                    }
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

                        if (_self.goodsList[0].consuType == 3) {
                            //抵扣的金币
                            _data.gold = _self.orderTotal.goldPrice;

                            _result = _self._$service.submitGoldOrder(_data);

                        } else {

                            _result = _self._$service.submitOrder(_data);

                        }
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
                        if (_self.periodId) {     //限时购
                            _self.timeLimitBuyError(_result);
                        } else {
                            _self.pareSubmittedBackError(_result).then((msg) => {  //非限时购
                                let dialogObj = {
                                    title: '提示',
                                    content: msg,
                                    type: 'info',
                                    assistBtn: '',
                                    mainBtn: '知道啦',
                                    assistFn() { },
                                    mainFn() {
                                        _self.submittedBackSureAlter(_result);
                                    }
                                };
                                _self.$store.state.$dialog({ dialogObj });
                            });
                        }
                        obj.close();
                    } else {
                        let _param = {
                            combinOrderNo: _result.combinOrderNo,
                            orderId: _result.orderId,
                            totalMoney:_result.totalMoney,
                            orderPayType:_self.orderPayType
                        };
                        _self.$router.push({path:'pay_list',query:_param});

                        // let orderPayType = {
                        //     combinOrderNo: _result.combinOrderNo,
                        //     orderPayType: _self.orderPayType
                        // }
                        // _self._$service.pay(_param).then((res) => {
                        //     if (res !== null) {
                        //         _self.payCallBack(res, orderPayType);
                        //     }
                        //     obj.close();
                        // }).catch(() => {
                        //     obj.close();
                        // });
                    }
                });
            }
        }
        _self.orderSubmitFlag = false;
    }
    /**
     * 订单提交后限时购 报错 信息 处理
     * @param {*} result 
     */
    timeLimitBuyError(result) {
        let _self = this;
        let dialogObj = {
            title: '提示',
            content: result.msg,
            type: 'info',
            assistBtn: '',
            mainBtn: '知道啦',
            assistFn() { },
            mainFn() {
                if (result.errorCode == 230) {   //230活动结束 231卖完 232库存不足
                    _self.$router.push({ path: "home" });
                } else if (result.errorCode == 231 ) {
                    _self.$router.push({ path: "money_timelimit_list" });
                }
                else {
                   _self.$router.back();
                }
            }
        };
        _self.$store.state.$dialog({ dialogObj });
    }
    /**
     * 订单提交后 报错 信息 处理
     * @param {*} result 
     */
    submittedBackSureAlter(result) {
        let _self = this;
        // 库存不足时， 给与提示后，用户点击后 返回商品
        // 143		分仓库存不足
        // 144		快速仓库存不足
        // 145      快速仓未开启
        if (!this.moneyBuyFlag && [143, 144, 145].includes(result.errorCode)) {
            if (_self.orderSrouce == "goods" && [145].includes(result.errorCode)){
                _self.$router.push({path:"home"});
            }else{
                _self.$router.back();
            }    
        }
    }

    /**
     * 提交订单后错误信息 预处理
     */
    async pareSubmittedBackError(result) {
        let _msg = result.msg || '';
        if (this.moneyBuyFlag || ![143, 144].includes(result.errorCode)) {
            return _msg;
        }
        switch (this.orderSrouce) {
            case 'car':
                // 多sku
                // console.log('多sku 配送方式 ');
                if (this.defaultWay == 1) {
                    //快速订单
                    _msg = '部分商品快速仓库存不足，如果需购买更多商品，可以继续在普通订单中下单!';
                } else {
                    _msg = '部分商品库存不足，请重新提交!';
                }
                break;
            case 'goods':
                // 单sku
                // console.log('单sku 配送方式 ');
                if (this.defaultWay == 1) {
                    let _res = (await this._$service.queryGoodsStock({ goodsId: this.goodsList[0].goodsId, deliveryType: 0 })).data || 0;
                    //快速订单  单个商品快速仓不足时，返回其分仓库存数量 
                    if (_res) {
                        _msg = '当前商品快速仓库存不足，如果需购买更多商品，可以继续在普通订单中下单，当前分仓库存：' + _res + '件!';
                    } else {
                        _msg = '当前商品快速仓库存不足，请重新提交!';
                    }
                } else {
                    _msg = '当前商品库存不足，请重新提交!';
                }
                break;
            default:
        }
        return _msg;
    }

    /**
     * 支付结束回调
     */
    payCallBack(res, _param) {
        // 取消支付 => 待支付订单 , 支付成功 => 所有订单
        let _self = this;
        if (res) {
            sessionStorage.setItem("combinOrderNo", JSON.stringify(_param));
            this.$router.replace({ path: 'user_order' });
        } else {
            // sessionStorage.setItem("combinOrderNo", JSON.stringify(_param));
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
    async parseGoodsList() {

        let _self = this;

        let list = _self.goodsList;
        let _orderTotal = _self.orderTotal;
        _orderTotal.price = 0;
        _orderTotal.pay = 0;
        _orderTotal.goldPrice = 0;
        _self.dicCountTimeMoney = 0;
        let disMoney = 0;
        // _self.userGoldNum = 666; //test
        if (_self.goodsType == 'entity') {
            //实物
            for (let i = 0, len = list.length; i < len; i++) {

                for (let j = 0, len1 = list[i].shopCarts.length; j < len1; j++) {
                    let item = list[i].shopCarts[j];
                    let _num = item.number;
                    _orderTotal.price += (item.purchasePrice * _num) || 0;
                    if (item.consuType == 3 && !_self.periodIdBuyFlag) {
                        _self.orderPayType = 1;
                        _orderTotal.goldShow = true;
                        // console.log(111, _self.userGoldNum);
                        if (_self.userGoldNum >= item.goldPrice * item.number) {
                            _orderTotal.goldPrice += (item.goldPrice * item.number) || 0;
                            disMoney += item.number * (item.purchasePrice - item.moneyPrice) || 0;
                        } else {
                            let disNum = 0;
                            disNum = Math.floor(_self.userGoldNum / item.goldPrice);
                            _orderTotal.goldPrice += (item.goldPrice * disNum) || 0;
                            disMoney += disNum * (item.purchasePrice - item.moneyPrice) || 0;
                        }
                    } else if (_self.periodIdBuyFlag) {
                        _self.dicCountTimeMoney += (item.purchasePrice - item.moneyPrice) * _num;
                        disMoney += _self.dicCountTimeMoney;
                        _self.orderPayType = 2;
                    } else {
                        _self.orderPayType = 0;
                    }
                }
            }
            //优惠券抵扣
            if (_orderTotal.price - _self.disCouponMoney == 0) {
                _self.disCouponMoney = _self.disCouponMoney - 1;
                _orderTotal.pay = 1;
            } else {
                _orderTotal.pay = _orderTotal.price - disMoney - _self.disCouponMoney;
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
        _self.goodsLoadOverFlag = true;
        if (_self.periodId) {
            _self.userCouponShow = true;
        } else {
            _self.setCouponShow(list);
        }

        _self.diffDeliveryMoney();
        // 第一次执行后设置为false；
        _self.firstParseGoods = false;
    }

    /**
     * 计算配送费
     */
    diffDeliveryMoney() {
        let _self = this;
        let _orderTotal = _self.orderTotal;
        console.log('diffDeliveryMoney orderTotal: ', _orderTotal);
        //初始化设置为免运费
        _self.shipFee = 0;
        //初始化设置为未选择收货地址
        _self.chooseAddressState = 1;
        //初始化设置为显示邮费提示
        // _self.showShipFeeFlag = true;
        if (_self.orderAddress && _self.orderAddress.addressInfo) {
            //选择地址
            if (_self.isInsideSchool == 1) {
                //校内地址
                let inSameSchool = true;
                let _schoolName = get(_self.orderAddress, 'addressInfo.campus');
                let _goodsList = _self.goodsList;
                for (let i = 0, len = _goodsList.length; i < len; i++) {
                    let _item = _goodsList[i];
                    _self.schoolName = _item.school;
                    if (_schoolName != _item.school) {
                        inSameSchool = false;
                        break;
                    }
                }
                // debugger;
                if (inSameSchool) {
                    //相同校区
                    _self.chooseAddressState = 4;
                    //收运费
                    if (_self.defaultWay == 1) {
                        // 快速订单
                        _self.shipFee_inArea = _self.fastShipFeeObj.shipFee;
                        _self.dissatisfyPrice_inArea = _self.fastShipFeeObj.freeShipFee;
                        if (_orderTotal.price < _self.fastShipFeeObj.freeShipFee) {
                            _self.shipFee = _self.shipFee_inArea;
                        }
                    } else {
                        // 重置默认配送费
                        _self.dissatisfyPrice_inArea = _self.defaultPrice_inArea;
                        if (_orderTotal.price < _self.dissatisfyPrice_inArea) {
                            _self.shipFee = _self.shipFee_inArea;
                        }
                    }
                } else {
                    //不同校区
                    _self.chooseAddressState = 3;
                    if (_self.defaultWay == 1) {
                        // 快速订单                         
                        _self.shipFee_outArea = _self.fastShipFeeObj.shipFee;
                        _self.dissatisfyPrice_outArea = _self.fastShipFeeObj.freeShipFee;
                        if (_orderTotal.price < _self.fastShipFeeObj.freeShipFee) {
                            _self.shipFee = _self.shipFee_outArea;
                        }
                    } else {
                        // 重置默认配送费
                        _self.dissatisfyPrice_outArea = _self.defaultPrice_outArea;
                        if (_orderTotal.price < _self.dissatisfyPrice_outArea) {
                            _self.shipFee = _self.shipFee_outArea;
                        }
                    }
                }
            } else {
                //校外地址
                _self.chooseAddressState = 2;
                if (_self.defaultWay == 1) {
                    // 快速订单
                    _self.shipFee_outArea = _self.fastShipFeeObj.shipFee;
                    _self.dissatisfyPrice_outArea = _self.fastShipFeeObj.freeShipFee;
                    if (_orderTotal.price < _self.fastShipFeeObj.freeShipFee) {
                        _self.shipFee = _self.shipFee_outArea;
                    }
                } else {
                    // 重置默认配送费
                    _self.dissatisfyPrice_inArea = _self.defaultPrice_outArea;
                    if (_orderTotal.price < _self.dissatisfyPrice_outArea) {
                        _self.shipFee = _self.shipFee_outArea;
                    }
                }
            }
            if (_self.shipFee) {
                _orderTotal.pay += (+_self.shipFee) || 0;
            }
        }
    }


    defaultWay = 0;
    checkDeliveryWay() {

        if (this.moneyBuyFlag) {
            this.checkAddressInfo();
            return;
        }


        // console.log('路由信息： ', this.$route, this.$router);
        if (sessionStorage.____addressBack) {
            sessionStorage.removeItem('____addressBack');
            this.dialogSelectAddress();
        }

        let result = this.orderAddress.__result;

        // console.log('地址信息： ', result);

        if (this.defaultWay == 1) {
            // 快速订单  配送
            if (result && result.campus != this.wdInfo.school) {
                this.selectAddressFlag = false;
                this.orderAddress = {};
                this.chooseAddressState = 1;
                // return;
            }
        } else {
            if (result && result.campus != this.wdInfo.school) {
                // 校外地址 或 其他校区
                this.defaultWay = 3;
            } else {
                this.defaultWay = 2;
            }
        }
        this.deliveryWay = this.deliveryWays[this.defaultWay];
        this.deliveryArrive = this.deliveryArrives[this.defaultWay];
        this.checkAddressInfo();
    }


    checkAddressInfo() {
        if (this.orderAddress && this.orderAddress.addressInfo) {
            this.selectAddressFlag = true;
            this.addressObj = this.orderAddress;
        } else {
            this.selectAddressFlag = false;
            this.addressObj = {};
        }
    }


    /**
     * 优惠券显示
     */
    async setCouponShow(goodsList) {
        let _self = this;
        let _data = {
            totalPrice: 0,
            goodsIdList: [],
            priceList: [],
            shopIdStr: []
        }
        goodsList.forEach(item => {
            _data.shopIdStr.push(item.shopId);
            item.shopCarts.forEach(v => {
                _data.goodsIdList.push(v.goodsId);
                _data.priceList.push(v.purchasePrice * v.number);
                _data.totalPrice += v.purchasePrice * v.number
            })
        });
        let _query = {
            totalPrice: _data.totalPrice,
            goodsIdListStr: _data.goodsIdList.join(","),
            priceListStr: _data.priceList.join(","),
            shopIdStr: _data.shopIdStr.join(","),
            couponState: 0,
            limit: 10,
            page: 1
        }
        let _result = await this._$service.getCouponList(_query);
        if (!_result.errorCode) {
            if (_result.data && _result.data.length != 0) {
                _self.userCouponShow = false;
            } else {
                _self.userCouponShow = true;
            }
        }else{
            _self.userCouponShow = true;
        }
        // console.log(_result,1111111)
    }
    /**
     * 地址选择回调
     */
    async selectAddress(item) {
        if (!this.orderTotal.goldShow) {
            if (item.isInsideSchool != 1 || item.campus != this.wdInfo.school) {
                if (this.defaultWay == 1) {
                    // 快速仓配送 不能切换其他非店铺所在校区地址                
                    return;
                } else {
                    // 校外地址
                    let flag = await this.alertDialog({
                        content: '您所填写的地址不在' + this.wdInfo.school + '校区配送范围以内，商品将通过第三方快递发货，预计1天后发货',
                        type: 'info',
                        assistBtn: '我再想想',
                        mainBtn: '确认'
                    });
                    if (!flag) {
                        return;
                    }
                }
            }
        }
        let _self = this;
        _self.selectAddressFlag = true;
        _self.orderAddress = item;
        _self.orderAddress.__result = item;
        _self.addressObj = _self.orderAddress;
        _self.isInsideSchool = item.isInsideSchool;
        _self.closeDialogAddess();
        _self.parseGoodsList();
      //  _self.diffDeliveryMoney();
       
     
    }

    /**
     * 虚拟商品填写表单信息
     */
    changeInput(item, event) {
        item.value = event.target.value;
    }
    /**
     * 使用优惠券
     */
    goCouponDetail() {
        let _self = this;
        let _data = {
            totalPrice: 0,
            goodsIdList: [],
            priceList: [],
            shopIdStr: []
        }
        this.goodsList.forEach(item => {
            _data.shopIdStr.push(item.shopId);
            item.shopCarts.forEach(v => {
                _data.goodsIdList.push(v.goodsId);
                _data.priceList.push(v.purchasePrice * v.number);
                _data.totalPrice += v.purchasePrice * v.number
            })
        })
        sessionStorage.setItem("couponParam", JSON.stringify(_data));
        // console.log(_data,11111111);
        let _query = {}, _param = this.$route.query;
        if (this.orderSrouce == "goods") {
            _query = {
                goodsId: _param.goodsId,
                goodsType: _param.goodsType,
                number: _param.number,
                orderSrouce: _param.orderSrouce,
                id: _param.id
            }
        } else {
            _query = {
                cartId: _param.cartId,
                orderSrouce: _param.orderSrouce,
                id: _param.id
            }
        }
        this.$router.push({ path: "order_coupon", query: _query });
    }

    /**
     * 没有网络点击按钮重新加载回调
     */
    callBack() {
        this.showNowifi = false;
    }

    alertDialog(opts) {
        return new Promise((reslove) => {
            this._$dialog({
                dialogObj: {
                    title: '提示',
                    content: '',
                    type: 'info',
                    assistBtn: '',
                    mainBtn: 'ok',
                    assistFn() {
                        reslove(false);
                    },
                    mainFn() {
                        reslove(true);
                    },
                    ...opts
                }
            })
        });
    }

}
