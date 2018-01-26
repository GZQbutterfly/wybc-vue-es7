import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { get } from 'lodash';
import submitService from './submit.order.service';
import './submit.order.scss';
import { AddressDialogComponent } from './address/address.dialog.component';
import { getZoneData } from 'common.env';
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

    mounted() {
        document.title = "提交订单";
        this._$service = submitService(this.$store);
        this.$nextTick(() => {
            this.getOrderMsg();
        })
    }

    /**
     * 获取运费相关
     */
    async getFee() {
        let _result = await submitService(this.$store).getFee();
        this.dissatisfyPrice = _result.data.freeShipFee;
        this.shipFee = _result.data.outSchoolShipFee;
    }

    /**
     * 获取商品信息
     */
    async getOrderMsg() {
        let _self = this;
        this.orderSrouce = this.$route.query.orderSrouce;
        this.stockType_State = this.$route.query.stockType;
        this.stockType_Value = this.stockType_State == 0 ? "仓储中心代管" : "商品自行管理";
        if (sessionStorage.____addressBack && this.stockType_State == 1) {
            // 地址修改回调
            sessionStorage.removeItem('____addressBack');
            this.dialogSelectAddress();
        }
        if (this.orderSrouce == 'goods') {
            this.goodsId = this.$route.query.goodsId;
            this.number = this.$route.query.number;
            if (this.stockType_State == 1) {
                await this.queryDefaultAddress();
                await this.getFee();
            }
            this._$service.queryOrder({ goodsId: _self.goodsId }).then(res => {
                if (res.data.errorCode) {
                    _self.goodsList = [];
                    return;
                }
                res.data.data.number = this.number;
                _self.changePrice([res.data.data], _self.refreashPrice);
                // _self.refreashPrice();
            })
        } else {
            if (this.stockType_State == 1) {
                await this.queryDefaultAddress();
                await this.getFee();
            }
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
                _self.changePrice(res.data.data, _self.refreashPrice);
                // _self.refreashPrice();
            })
        }
    }

    /**
     * 获取上一级店的信息
     */
    changePrice(data, cb = null) {
        let _self = this;
        if (!data || data.length == 0) {
            return;
        }
        let shopId = _self.$store.state.workVO.user.userId;
        //根据自己的ID获取上一级微店的信息
        _self._$service.getWdInfo(shopId).then(wd_res => {
            let upWdName;
            let wdInfo = wd_res.data.wdVipInfo;
            let upWdInfo = wdInfo.upWdInfo;
            _self.mySchool = wdInfo.school;
            _self.shopId = upWdInfo;
            if (wdInfo.state == 3 || upWdInfo == 0) {
                upWdName = "学惠精选官方商城";
                _self.getdisc(data, upWdName, shopId, cb);

            } else {
                _self._$service.getWdInfo(upWdInfo).then(up_res => {
                    let wdInfo = up_res.data.wdVipInfo;
                    upWdName = wdInfo.wdName;
                    _self.getdisc(data, upWdName, shopId, cb);
                })
            }
        })
    }

    /**
     * 设置价格
     */
    getdisc(res, upWdName, shopId, cb = null) {
        let _self = this;
        let goodsIds = [];
        let opt = { infoId: shopId, listStr: "" };
        res.forEach(ele => {
            goodsIds.push(ele.goodsId)
        });
        opt.listStr = goodsIds.join(",");
        if (_self.stockType_State == 1) {
            opt.ownStore = true;
        } else {
            opt.ownStore = false;
        }
        _self._$service.getDiscountPrice(opt).then(discount => {
            for (let i = 0, len = res.length; i < len; i++) {
                for (let j = 0, lenj = discount.data.length; j < lenj; j++) {
                    if (i == j) {
                        res[i].moneyPrice = Math.ceil(res[i].moneyPrice * (discount.data[j] || 100) / 100);
                        break;
                    }
                }
            }
            let obj = {};
            res.forEach(ele => {
                _self.orderTotal.price = _self.number * ele.moneyPrice;
                _self.orderTotal.pay = _self.number * ele.moneyPrice;
            });
            if (_self.stockType_State == 1) {
                if (_self.isInsideSchool == 0 && _self.orderTotal.pay < _self.dissatisfyPrice) {
                    _self.orderTotal.pay += Number(_self.shipFee);
                }
            }
            obj = {
                "shopName": upWdName,
                "res": res
            }
            _self.goodsList.push(obj);
            cb && cb();
        })
    }

    /**
     * 提交订单
     */
    submitOrder() {
        let _self = this;
        let data = {};
        if (_self.$route.query.orderSrouce == 'goods') {
            data = {
                goodsId: _self.goodsId,
                number: _self.number,
                shopId: _self.shopId
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
                    let dialogObj = {
                        title: '提示',
                        content: res.data.msg,
                        assistBtn: '',
                        mainBtn: '确定',
                        type: 'info',
                        assistFn() {
                        },
                        mainFn() {
                            obj.close();
                        }
                    };
                    this.$store.state.$dialog({ dialogObj });
                    return;
                }
                _self.orderId = res.data.orderId;
                _self.combinOrderNo = res.data.combinOrderNo;
                let _param = {
                    combinOrderNo: _self.combinOrderNo,
                    ownStore: data.ownStore
                }
                _self._$service.pay(_param).then(res => {
                    _self.payCallBack(res);
                    obj.close();
                })
            })
        } else {
            data = {
                wholeShopCartIds: _self.$route.query.cartId,
                shopId: _self.shopId
            };
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
                    let dialogObj = {
                        title: '',
                        content: res.data.msg,
                        assistBtn: '',
                        mainBtn: '确定',
                        type: 'info',
                        assistFn() {
                        },
                        mainFn() {
                            obj.close();
                        }
                    };
                    this.$store.state.$dialog({ dialogObj });
                    return;
                }
                _self.orderId = res.data.orderId;
                _self.combinOrderNo = res.data.combinOrderNo;
                let _param = {
                    combinOrderNo: _self.combinOrderNo,
                    ownStore: data.ownStore
                }
                _self._$service.pay(_param).then(res => {
                    _self.payCallBack(res);
                    obj.close();
                })
            })
        }
    }

    /**
    * 实物商品进入商品默认加载该用户的默认的地址
    */
    async queryDefaultAddress(addrId) {
        let _self = this;
        let _orderAddress = {};
        let _result = (await this._$service.queryDefaultAddress(addrId)).data;
        if (!_result.errorCode) {
            _self.isInsideSchool = _result.isInsideSchool;
            if (_result) {
                _orderAddress.address = _result.address;
                _orderAddress.name = _result.name;
                _orderAddress.phone = _result.phone;
                _orderAddress.addrId = _result.addrId;
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
        this.selectAddressFlag = true;
        this.orderAddress = item;
        this.isInsideSchool = item.isInsideSchool;
        this.refreashPrice()
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
            _self.orderTotal.price += Number(ele.number) * ele.moneyPrice;
            _self.orderTotal.pay += ele.number * ele.moneyPrice;
        });
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
     * 进货仓储说明
     */
    stockInfo() {
        this.$router.push({
            path: 'cms_stock_info',
        })
    }
}
