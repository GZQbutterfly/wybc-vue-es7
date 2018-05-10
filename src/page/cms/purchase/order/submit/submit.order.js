import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { get } from 'lodash';
import submitService from './submit.order.service';
import './submit.order.scss';
import { AddressDialogComponent } from './address/address.dialog.component';
import { getZoneData ,toWEB} from 'common.env';
import { Address } from '../../../../sys/address/address';

@Component({
    template: require('./submit.order.html'),
    components: {
        'address-dialog': AddressDialogComponent,
        'address-operation': Address
    }
})

export class CmsPurchaseSubmitOrder extends BaseVue {
    _$service;
    showNowifi = false;         //是否显示网路状态

    //公共
    orderSrouce = 'car';        //订单来源(商品goods,购物车car)
    goodsList = [];             //订单商品书记列表
    orderTotal = {              //订单信息汇总
        price: 0,               //总价格
        transportPrice: 0,      //总配送费
        pay: 0                  //支付总价
    };
    stockType_State = 0;        //自储代储状态
    stockType_Value = '';       //自储代储字段值
    payResult = {};             //支付结果
    shopId;                    //提交订单
    //直接购买
    goodsId;                    //商品ID
    number;                     //商品数量
    leaveMsg = [];              //虚物物流详情(json)
    couponShow = false;
    userCouponShow = false;
    couponMoney = 0;
    disCouponMoney = 0;
    //购物车
    combinOrderNo;              //组合订单号
    orderId = 1;                //订单id

    //运费相关
    noShipFee = true;           //是否需要支付运费
    shipFee = 0;                //运费金额
    dissatisfyPrice = 0;        //包邮金额(配送范围外的包邮金额)

    //地址相关
    mySchool = '';              //保存我的店铺的学校
    selectAddressFlag = false;  //是否选择收货地址
    showDialogAddress = false;  //是否显示地址
    showAddAddress = false;     //是否显示增加地址
    chooseAddressState = 4;     //选择地址的状态(1.未选择 2.选择校外地址 3.选择校内非微店所属校区地址 4.选择校内地址，即微店所属校区内地址)
    isInsideSchool = 1;         //是否为学校地址(1.是 0.否)
    orderAddress = {            //收货地址汇总
        name: '',
        address: '',
        phone: '',
        addrId: ''
    };
    firstParseGoods = true;
    mounted() {
        document.title = "提交订单";
        this._$service = submitService(this.$store);
        this._$popup = this.$store.state.$popup;
        this.$nextTick(() => {
            this.getOrderMsg();
        })
    }

    activated() {
        // debugger;
        this.getCouponMoney();
        !this.firstParseGoods && this.refreashPrice();
    }
    /**
    * 获取进货券价格
    */
    getCouponMoney() {
        let id = this.$route.query.id;
        if (id) {
            let couponDetail = JSON.parse(sessionStorage.getItem("CmsCouponDetail"));
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
    /**
     * 获取运费相关
     */
    async getFee() {
        // let _result = await submitService(this.$store).getFee();
        // this.dissatisfyPrice = _result.data.freeShipFee;
        // this.shipFee = _result.data.shipFee;
        this.getCouponMoney();
    }

    /**
     * 获取商品信息
     */
    async getOrderMsg() {
        let _self = this;
        this.orderSrouce = this.$route.query.orderSrouce;
        this.stockType_State = this.$route.query.stockType;
        this.stockType_Value = this.stockType_State == 0 ? "仓储中心代管" : "快速仓自储";
        if (sessionStorage.____addressBack && this.stockType_State == 1) {
            // 地址修改回调
            sessionStorage.removeItem('____addressBack');
            this.dialogSelectAddress();
        }
        if (this.stockType_State == 1) {
            await this.getFee();
        }
        if (this.orderSrouce == 'goods') {
            this.goodsId = this.$route.query.goodsId;
            this.number = this.$route.query.number;
            this._$service.queryOrder({ goodsId: _self.goodsId }).then(res => {
                if (res.data.errorCode) {
                    _self.goodsList = [];
                    return;
                }
                if (res.data.data.state != 1 || res.data.data.onStockState != 1) {
                    let dialogObj = {
                        title: '提示',
                        content: '该商品已下架或停售',
                        assistBtn: '',
                        mainBtn: '确定',
                        type: 'info',
                        assistFn() {
                        },
                        mainFn() {
                            _self.$router.back();
                        }
                    };
                    _self.$store.state.$dialog({ dialogObj });
                    return;
                }
                res.data.data.number = this.number;
                _self.queryUpWdInfo([res.data.data], _self.refreashPrice);
                // _self.refreashPrice();
            })
        } else {
            _self.goodsList = [];
            let opt = {
                wholeShopCartIds: this.$route.query.cartId
            }
            if (_self.stockType_State == 1) {
                opt.ownStore = true;
            } else {
                opt.ownStore = false;
            }
            this._$service.queryCarOrders(opt).then(async (res) => {
                if (res.data.errorCode) {
                    _self.goodsList = [];
                    return;
                }
                res.data.data.forEach(item => {
                    item.stockPrice = item.moneyPrice;
                })
                _self.queryUpWdInfo(res.data.data, _self.refreashPrice);
                // _self.refreashPrice();
            })
        }

        this.firstParseGoods = false;
    }

    /**
     * 获取上一级店的信息
     */
   queryUpWdInfo(data, cb = null) {
        let _self = this;
        if (!data || data.length == 0) {
            return;
        }
        let shopId = _self.$store.state.workVO.user.userId;
        //根据自己的ID获取上一级微店的信息
        _self._$service.getWdInfo(shopId).then(wdVipInfo => {
            let upWdName;
            let wdInfo = wdVipInfo;
            let upWdInfo = wdInfo.upWdInfo;
            _self.mySchool = wdInfo.school;
            _self.shopId = upWdInfo;
            if (wdInfo.state == 3 || upWdInfo == 0) {
                upWdName = "学惠精选官方商城";
                _self.getGoodsLists(data, upWdName, shopId, cb);

            } else {
                _self._$service.getWdInfo(upWdInfo).then(result => {
                    let wdInfo = result;
                    upWdName = wdInfo.wdName;
                    _self.getGoodsLists(data, upWdName, shopId, cb);
                })
            }
        })
    }

    /**
     * 设置goods
     */
    async getGoodsLists(res, upWdName, shopId, cb = null) {
        if (this.stockType_State == 1) {
            // 自储订单
            await this.queryDefaultAddress();
        }
       
        let obj = {
            "shopName": "学惠精选官方商城",//upWdName
            "res": res
        }
        this.goodsList.push(obj);
        cb && cb();
    }
    /**
     * 去进货券列表
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
            _data.shopIdStr.push(_self.shopId);
            item.res.forEach(v => {
                _data.goodsIdList.push(v.goodsId);
                _data.priceList.push(v.stockPrice * v.number);
                _data.totalPrice += v.stockPrice * v.number
            })
        })
        sessionStorage.setItem("cmsCouponParam", JSON.stringify(_data));
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
        this.$router.push({ path: "cms_coupon", query: _query });
    }
    /**
     * 提交订单
     */
    async submitOrder() {
        let _self = this;
        let data = {};

        let _query = _self.$route.query;

        if (_query.orderSrouce == 'goods') {
            data = {
                goodsId: _self.goodsId,
                number: _self.number,
                shopId: _self.shopId
            }
            if (_query.id) {
                data.userCouponId = _query.id;
            }
            if (_self.stockType_State == 0) {
                data.ownStore = false;
            }
            else {

                data.ownStore = true;
                _self.isAddress();
                data.addrId = _self.orderAddress.addrId;
            }
            if (data.ownStore && !_self.isAddress()) {
                _self.isAddress();
                return;
            }
            let obj = this.$store.state.$loadding();
            _self._$service.submitOrder(data).then(res => {
                if (res.data.errorCode) {
                    _self.submittedResultErrCode(res.data);
                    obj.close();
                    return;
                }
                _self.orderId = res.data.orderId;
                _self.combinOrderNo = res.data.combinOrderNo;
                let _param = {
                    combinOrderNo: res.data.combinOrderNo,
                    totalMoney:res.data.totalMoney,
                }
                // _self._$service.pay(_param).then(res => {
                //     sessionStorage.removeItem("CmsCouponDetail");
                //     _self.payCallBack(res);
                     obj.close();
                // })
                _self.$router.replace({path:"sys_pay_list",query:_param});
            })
        } else {
            data = {
                wholeShopCartIds: _query.cartId,
                shopId: _self.shopId
            };
            if (_query.id) {
                data.userCouponId = _query.id;
            }
            if (_self.stockType_State == 0) {
                data.ownStore = false;
            } else {
                data.ownStore = true;
                data.addrId = _self.orderAddress.addrId;
            }
            if (data.ownStore && !_self.isAddress()) {
                _self.isAddress();
                return;
            }
            let obj = this.$store.state.$loadding();
            _self._$service.submitMutiOrder(data).then(res => {
                if (res.data.errorCode) {
                    _self.submittedResultErrCode(res.data);
                    obj.close();
                    return;
                }
                _self.orderId = res.data.orderId;
                _self.combinOrderNo = res.data.combinOrderNo;
                let _param = {
                    combinOrderNo: res.data.combinOrderNo,
                    totalMoney:res.data.totalMoney,
                    submitType:2
                }
                obj.close();
                _self.$router.replace({path:"sys_pay_list",query:_param});
            })
        }
    }

    /**
    * 实物商品进入商品默认加载该用户的默认的地址
    */
    async queryDefaultAddress(addrId) {

        let _self = this;
        console.log(_self.mySchool)
        let _orderAddress = {};
        let _result = (await this._$service.queryDefaultAddress(addrId)).data;

        if (this.stockType_State == 1 && _result.campus != _self.mySchool) {
            // 自储订单 不在同地址
            return;
        }

        if (!_result.errorCode) {
            _self.isInsideSchool = _result.isInsideSchool;
            if (_result) {
                _orderAddress.address = _result.address;
                _orderAddress.name = _result.name;
                _orderAddress.phone = _result.phone;
                _orderAddress.addrId = _result.addrId;
                _orderAddress.sex = _result.sex;
                this.selectAddressFlag = true;
                if (_result.campus) {
                    _orderAddress.addressInfo = {
                        campus: _result.campus,
                        dormitory: _result.dormitory
                    }
                } else {
                    _orderAddress.addressInfo = await getZoneData(_result);
                }
                this.orderAddress = _orderAddress;
            } else {
                this.orderAddress = {};
                this.selectAddressFlag = false;
            }
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
                assistFn() { },
                mainFn() { }
            };
            _self.$store.state.$dialog({ dialogObj });
            return false;
        }
        return true;
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
    }

    /**
     * 地址选择回调
     */
    selectAddress(item) {
        if (this.stockType_State == 1 && item.campus != this.mySchool) {
            // 自储订单 不在同地址
            return;
        }
        this.selectAddressFlag = true;
        this.orderAddress = item;
        this.isInsideSchool = item.isInsideSchool;
        this.refreashPrice();
        this.closeDialogAddess();
    }

    /**
     * 价格更新
     */
    refreashPrice() {
        let _self = this;
        _self.orderTotal.price = 0;
        _self.orderTotal.pay = 0;
        _self.goodsList[0].res.forEach(ele => {
            _self.orderTotal.price += Number(ele.number) * ele.stockPrice;
            _self.orderTotal.pay += ele.number * ele.stockPrice;
        });
        _self.setCouponShow(_self.goodsList[0].res);
        //优惠券抵扣
        if (_self.orderTotal.price - _self.disCouponMoney <= 0) {
            _self.disCouponMoney = _self.disCouponMoney - 1;
            _self.orderTotal.pay = 1;
        } else {
            _self.orderTotal.pay = _self.orderTotal.price - _self.disCouponMoney;
        }

        if (_self.stockType_State == 1) {
            _self.noShipFee = true;
            if (_self.selectAddressFlag) {
                //选择收货地址
                if (_self.isInsideSchool == 1) {
                    //校内地址
                    if (_self.mySchool == _self.orderAddress.addressInfo.campus) {
                        //相同校区
                        _self.chooseAddressState = 4;
                    } else {
                        //不同校区
                        _self.chooseAddressState = 3;
                        if (_self.orderTotal.price < _self.dissatisfyPrice) {
                            //收运费
                            _self.orderTotal.pay += Number(_self.shipFee);
                            _self.noShipFee = false;
                        }
                    }
                } else {
                    //校外地址
                    _self.chooseAddressState = 2;
                    if (_self.orderTotal.price < _self.dissatisfyPrice) {
                        //收运费
                        _self.orderTotal.pay += Number(_self.shipFee);
                        _self.noShipFee = false;
                    }
                }
            } else {
                //未选中收货地址
                _self.chooseAddressState = 1;
            }
        }
    }

    /**
     * 支付回调
     */
    payCallBack(res) {
        let _self = this;
        if (res) {
            this.$router.replace({ path: 'cms_stock_order', query: { listValue: '0' } });
        } else {
            this.$router.replace({ path: 'cms_stock_order', query: { listValue: '1' } });
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
        }
        goodsList.forEach(item => {
            _data.goodsIdList.push(item.goodsId);
            _data.priceList.push(item.stockPrice * item.number);
            _data.totalPrice += item.stockPrice * item.number

        });
        let _query = {
            totalPrice: _data.totalPrice,
            goodsIdListStr: _data.goodsIdList.join(","),
            priceListStr: _data.priceList.join(","),
            couponState: 0,
            limit: 10,
            page: 1
        }
        let _result = await this._$service.getCouponList(_query);
        if (!_result.data.errorCode) {
            if (_result.data && _result.data.data.length != 0) {
                _self.userCouponShow = false;
            } else {
                _self.userCouponShow = true;
            }
        } else {
            _self.userCouponShow = true;
        }
        // console.log(_result,1111111)
    }
    stockInfo() {
        this.$router.push({
            path: 'cms_stock_info',
        })
    }

    async submittedResultErrCode(result) {
        let _self = this;
        let _errCode = result.errorCode;
        let _query = _self.$route.query;
        if (_query.stockType == 1 && _errCode == 145) {
            //快速仓
            let _result = await _self.confrimFastDelivery(result);
            if (!_result) {
                return;
            } else {
                if (_result.flag) {
                    _self.submitOrder();
                } else {
                    _self.alertDailog(_result.msg);
                }
            }
        }else if(_errorCode==147){
            _self.alertDailog('订单已存在,请勿重复提交.',true);
        } else {
            _self.alertDailog(result.msg);
        }
    }
    confrimFastDelivery(result) {
        let _self = this;
        let _data = null;
        let _address = '';
        let _deliveryInfo = '';
        if (result && result.address) {
            _address = result.address;
            _deliveryInfo = result.deliveryInfo;
        } else {
            _data = _self.orderAddress;
            if (_data.addressInfo) {
                let _addressInfo = _data.addressInfo;
                if (_addressInfo.campus) {
                    _address = _addressInfo.campus + _addressInfo.dormitory + _data.address;
                } else {
                    _address = _addressInfo.province.na + _addressInfo.city.na + _addressInfo.district.na + _data.address;
                }
            }
            _deliveryInfo = _data.name + ' ' + _data.phone;
        }
        _address = _address.length > 35 ? _address.substr(0, 35) + '...' : _address;
        return new Promise((reslove) => {
            _self._$popup({
                title: '开启快速仓',
                close: true,
                height: 0.43,
                width: 350,
                content:
                    `<div class="fastdelivery-dialog">
                        <div class="fastdelivery-dialog_hd text-c-808080">您的快速仓未开启，是否快速开启？快速信息设置如下(需修改请到店铺管理端-我的设置):</div>
                        <div class="text-s-14 fastdelivery-dialog_bd">
                        <div><i class="icon iconfont icon-zhengque1"></i>快速仓地址：${_address}</div>
                        <div><i class="icon iconfont icon-zhengque1"></i>配送人信息：${_deliveryInfo}</div>
                        </div>   
                    </div>
                        `,
                assistBtn: '暂不开启',
                mainBtn: '确认开启',
                assistFn() {
                    reslove(false);
                },
                mainFn() {
                    _self._$service.openAndSetFastDelivery({ addrId: _self.orderAddress.addrId }).then((res) => {
                        let _result = res.data;
                        if (_result) {
                            if (_result.errorCode) {
                                reslove({ flag: false, msg: _result.msg });
                            } else {
                                reslove({ flag: true, msg: '设置成功，请您重新提交订单!' });
                            }
                        } else {
                            reslove({ flag: false, msg: '校外地址不能为进货订单地址!' });
                        }
                    });
                }
            });
        })
    }

    alertDailog(msg,toOrderList= false) {
        let _self = this;
        let dialogObj = {
            title: '',
            content: msg || '',
            assistBtn: '',
            mainBtn: '确定',
            type: 'info',
            assistFn() {
            },
            mainFn() {
                if (toOrderList) {
                    _self.$router.replace({ path: 'cms_stock_order', query: { listValue: '1' } });
                }else{
                    _self.$router.back();
                }
            }
        };
        this._$dialog({ dialogObj });
    }

    destroyed () {
      
    }
}
