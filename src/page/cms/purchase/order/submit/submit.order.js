// 提交订单页面（预提交订单）
import { Component} from 'vue-property-decorator';
import  BaseVue  from 'base.vue';

import { get } from 'lodash';

import submitService from './submit.order.service';
import './submit.order.scss';

// ==>
/**
 * 直接购买 goods   实物  虚拟
 * 购物车结算 car      实物
 */
@Component({
    template: require('./submit.order.html'),

})

export class CmsPurchaseSubmitOrder extends BaseVue {
    showNowifi = false;
    orderSrouce = 'car';//订单来源（商品goods，购物车car）
    orderList = [];
    goodsId;
    number;
    combinOrderNo;
    orderTotal = {
        price: 0, //总价格
        transportPrice: 0, //总配送费
        pay: 0 //支付总价
    };
    payResult = {};// 支付结果
    _$service;
    satisfyShow = false;
    orderId = 1;//订单id
    chooseGoodsList = [];
    data() {
        return {};
    }
    mounted() {
        document.title = "待付款订单";
        this._$service = submitService(this.$store);
        this.$nextTick(() => {
            this.chooseGoodsList = [
                {
                    id: 1,
                    goodsName: "好多肉吃",
                    number: 167,
                    checkedShow: true,
                    coverImg: "data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAAAeFBMVEUAwAD///+U5ZTc9twOww7G8MYwzDCH4YcfyR9x23Hw+/DY9dhm2WZG0kbT9NP0/PTL8sux7LFe115T1VM+zz7i+OIXxhes6qxr2mvA8MCe6J6M4oz6/frr+us5zjn2/fa67rqB4IF13XWn6ad83nxa1loqyirn+eccHxx4AAAC/klEQVRo3u2W2ZKiQBBF8wpCNSCyLwri7v//4bRIFVXoTBBB+DAReV5sG6lTXDITiGEYhmEYhmEYhmEYhmEY5v9i5fsZGRx9PyGDne8f6K9cfd+mKXe1yNG/0CcqYE86AkBMBh66f20deBc7wA/1WFiTwvSEpBMA2JJOBsSLxe/4QEEaJRrASP8EVF8Q74GbmevKg0saa0B8QbwBdjRyADYxIhqxAZ++IKYtciPXLQVG+imw+oo4Bu56rjEJ4GYsvPmKOAB+xlz7L5aevqUXuePWVhvWJ4eWiwUQ67mK51qPj4dFDMlRLBZTqF3SDvmr4BwtkECu5gHWPkmDfQh02WLxXuvbvC8ku8F57GsI5e0CmUwLz1kq3kD17R1In5816rGvQ5VMk5FEtIiWislTffuDpl/k/PzscdQsv8r9qWq4LRWX6tQYtTxvI3XyrwdyQxChXioOngH3dLgOFjk0all56XRi/wDFQrGQU3Os5t0wJu1GNtNKHdPqYaGYQuRDfbfDf26AGLYSyGS3ZAK4S8XuoAlxGSdYMKwqZKM9XJMtyqXi7HX/CiAZS6d8bSVUz5J36mEMFDTlAFQzxOT1dzLRljjB6+++ejFqka+mXIe6F59mw22OuOw1F4T6lg/9VjL1rLDoI9Xzl1MSYDNHnPQnt3D1EE7PrXjye/3pVpr1Z45hMUdcACc5NVQI0bOdS1WA0wuz73e7/5TNqBPhQXPEFGJNV2zNqWI7QKBd2Gn6AiBko02zuAOXeWIXjV0jNqdKegaE/kJQ6Bfs4aju04lMLkA2T5wBSYPKDGF3RKhFYEa6A1L1LG2yacmsaZ6YPOSAMKNsO+N5dNTfkc5Aqe26uxHpx7ZirvgCwJpWq/lmX1hA7LyabQ34tt5RiJKXSwQ+0KU0V5xg+hZrd4Bn1n4EID+WkQdgLfRNtvil9SPfwy+WQ7PFBWQz6dGWZBLkeJFXZGCfLUjCgGgqXo5TuSu3cugdcTv/HjqnBTEMwzAMwzAMwzAMwzAMw/zf/AFbXiOA6frlMAAAAABJRU5ErkJggg==",
                },
                {
                    id: 2,
                    goodsName: "好多肉吃",
                    number: 16,
                    checkedShow: false,
                    coverImg: "data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAAAeFBMVEUAwAD///+U5ZTc9twOww7G8MYwzDCH4YcfyR9x23Hw+/DY9dhm2WZG0kbT9NP0/PTL8sux7LFe115T1VM+zz7i+OIXxhes6qxr2mvA8MCe6J6M4oz6/frr+us5zjn2/fa67rqB4IF13XWn6ad83nxa1loqyirn+eccHxx4AAAC/klEQVRo3u2W2ZKiQBBF8wpCNSCyLwri7v//4bRIFVXoTBBB+DAReV5sG6lTXDITiGEYhmEYhmEYhmEYhmEY5v9i5fsZGRx9PyGDne8f6K9cfd+mKXe1yNG/0CcqYE86AkBMBh66f20deBc7wA/1WFiTwvSEpBMA2JJOBsSLxe/4QEEaJRrASP8EVF8Q74GbmevKg0saa0B8QbwBdjRyADYxIhqxAZ++IKYtciPXLQVG+imw+oo4Bu56rjEJ4GYsvPmKOAB+xlz7L5aevqUXuePWVhvWJ4eWiwUQ67mK51qPj4dFDMlRLBZTqF3SDvmr4BwtkECu5gHWPkmDfQh02WLxXuvbvC8ku8F57GsI5e0CmUwLz1kq3kD17R1In5816rGvQ5VMk5FEtIiWislTffuDpl/k/PzscdQsv8r9qWq4LRWX6tQYtTxvI3XyrwdyQxChXioOngH3dLgOFjk0all56XRi/wDFQrGQU3Os5t0wJu1GNtNKHdPqYaGYQuRDfbfDf26AGLYSyGS3ZAK4S8XuoAlxGSdYMKwqZKM9XJMtyqXi7HX/CiAZS6d8bSVUz5J36mEMFDTlAFQzxOT1dzLRljjB6+++ejFqka+mXIe6F59mw22OuOw1F4T6lg/9VjL1rLDoI9Xzl1MSYDNHnPQnt3D1EE7PrXjye/3pVpr1Z45hMUdcACc5NVQI0bOdS1WA0wuz73e7/5TNqBPhQXPEFGJNV2zNqWI7QKBd2Gn6AiBko02zuAOXeWIXjV0jNqdKegaE/kJQ6Bfs4aju04lMLkA2T5wBSYPKDGF3RKhFYEa6A1L1LG2yacmsaZ6YPOSAMKNsO+N5dNTfkc5Aqe26uxHpx7ZirvgCwJpWq/lmX1hA7LyabQ34tt5RiJKXSwQ+0KU0V5xg+hZrd4Bn1n4EID+WkQdgLfRNtvil9SPfwy+WQ7PFBWQz6dGWZBLkeJFXZGCfLUjCgGgqXo5TuSu3cugdcTv/HjqnBTEMwzAMwzAMwzAMwzAMw/zf/AFbXiOA6frlMAAAAABJRU5ErkJggg==",
                }
            ]
            this.getOrderMsg();
        })
    }

    getOrderMsg() {//获取商品信息
        let _this = this;
        this.orderSrouce = this.$route.query.orderSrouce;//订单来源（商品goods，购物车car）
        if (this.orderSrouce == 'goods') {
            this.goodsId = this.$route.query.goodsId;
            this.number = this.$route.query.number;
            this._$service.queryOrder({ goodsId: _this.goodsId }).then(res => {
                if (res.data.errorCode) {
                    _this.orderList = [];
                    return;
                }
                res.data.data.number = this.number;
                let opt = {
                    "res": [
                        res.data.data
                    ]
                }
                _this.changePrice(opt.res);
            })
        } else {
            _this.orderList = [];
            let opt = {
                wholeShopCartIds: this.$route.query.cartId
            }
            this._$service.queryCarOrders(opt).then(res => {
                if (res.data.errorCode) {
                    _this.orderList = [];
                    return;
                }
                let opt = {
                    "shopName": res.data.data[0].wdName,
                    "res": res.data.data
                }
                res.data.data.forEach(ele => {
                    _this.orderTotal.price += ele.number * ele.moneyPrice;
                    _this.orderTotal.pay += ele.number * ele.moneyPrice;
                });
                _this.orderList.push(opt);
            })
        }
    }
    //直接购买修改价格
    changePrice(res) {
        let _this = this;
        if (res.length == 0 || !res) {
            return;
        }
        let shopId = _this.$store.state.workVO.user.userId;
        localStorage.selfShopId = shopId;
        _this._$service.getUpWdInfo(shopId).then(wdname => {
            let upWdName = '';
            if (wdname.data.wdVipInfo.state == 3 || wdname.data.wdVipInfo.upWdInfo == 0) {
                upWdName = "学惠精选官方商城";
                localStorage.upWdName = upWdName;
                _this.getdisc(res, upWdName, shopId);
            } else {
                _this._$service.getUpWdInfo(wdname.data.wdVipInfo.upWdInfo).then(wdname1 => {
                    upWdName = wdname1.data.wdVipInfo.wdName;
                    localStorage.upWdName = upWdName;
                    _this.getdisc(res, upWdName, shopId);
                })
            }
        })
    }
    getdisc(res, upWdName, shopId) {
        let _this = this;
        let goodsIds = []; let opt = { infoId: shopId, listStr: "" };
        res.forEach(ele => {
            goodsIds.push(ele.goodsId)
        });
        opt.listStr = goodsIds.join(",");
        this._$service.getDiscountPrice(opt).then(discount => {
            for (let i = 0, len = res.length; i < len; i++) {
                for (let j = 0, lenj = discount.data.length; j < lenj; j++) {
                    if (i == j) {
                        res[i].moneyPrice = Math.ceil(res[i].moneyPrice * discount.data[j] / 100);
                        break;
                    }
                }
            }
            let obj = {};
            res.forEach(ele => {
                _this.orderTotal.price = _this.number * ele.moneyPrice;
                _this.orderTotal.pay = _this.number * ele.moneyPrice;
            });
            obj = {
                "shopName": upWdName,
                "res": res
            }
            this.orderList.push(obj);
        })
    }
    chooseGoods(index) {
        this.chooseGoodsList.forEach((item) => {
            item.checkedShow = false;
        })
        this.chooseGoodsList[index].checkedShow = true;
    }
    confirm() {
        this.satisfyShow = false;
    }
    //提交订单
    submitOrder() {

        let _this = this;
        let data = {};
        let obj = this.$store.state.$loadding();
        //单个订单提交
        if (_this.$route.query.orderSrouce == 'goods') {
            data = {
                goodsId: _this.goodsId,               								//商品Id
                number: _this.number,
                // shopId:_this.shopId										//数量
            }
            _this._$service.submitOrder(data).then(res => {
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

                _this.orderId = res.data.orderId;//获取订单id
                _this.combinOrderNo = res.data.combinOrderNo;

                let _param = {
                    combinOrderNo: _this.combinOrderNo//, orderId: _this.orderId
                }
                _this._$service.pay(_param).then(res => {
                    _this.payCallBack(res);
                    obj.close();
                })
            })
        }
        //购物车提交
        else {
            data = {
                wholeShopCartIds: _this.$route.query.cartId									//数量
            };
            _this._$service.submitMutiOrder(data).then(res => {
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

                _this.orderId = res.data.orderId;//获取订单id
                _this.combinOrderNo = res.data.combinOrderNo;

                let _param = {
                    combinOrderNo: _this.combinOrderNo//, orderId: _this.orderId
                }
                _this._$service.pay(_param).then(res => {
                    _this.payCallBack(res);
                    obj.close();
                })
            })
        }
    }
    payCallBack(res) {
        let _self = this;
        if (res) {
            //console.log('已支付');
            this.$router.replace({ path: 'cms_stock_order', query: { listValue: '0' } });

        } else {
            //console.log('未支付');
            this.$router.replace({ path: 'cms_stock_order', query: { listValue: '1' } });
        }
    }
}
