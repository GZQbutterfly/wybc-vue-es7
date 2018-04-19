// 我的库存详情
import { Component, Watch } from 'vue-property-decorator';
import BaseVue from 'base.vue';


import InventoryDetailService from './inventory.detail.service';

import './inventory.detail.scss';
@Component({
    template: require('./inventory.detail.html')
})
export class MyInventoryDetail extends BaseVue {
    //索引
    goodsId = 0;
    //顶部商品数据
    goodsData = {};
    //代接单数据列表
    dataList = [];
    //选择的数量
    chooseNum = 0;
    //计算所有花费
    totalMoney = 0;
    minMoney = 0;
    // 升级第一次
    flag = false;
    showDiscountDetail = false;
    //是否能立即进货
    canBuy = false;
    countAmount = 0;
    queryOrderId = '';
    buyMaxLength = 4;
    buyMaxNum = 9999;
    _$service;

    //结果的页码
    search_page = 0;
    //一页一条数据
    search_limit = 10;
    //是否有下一页
    search_flag = true;

    mounted() {
        //注册服务
        this._$service = InventoryDetailService(this.$store);
        this.queryOrderId = this.$route.query.orderId;
        this.$nextTick(() => {
            document.title = "我要进货";
            this.initPage();
        });
    }

    destroyed() {
        this.clearAllTimer();
    }
    //初始化页面
    initPage() {
        this.goodsId = this.$route.query.goodsId;
        // this.search_init();
        this.queryGoodsStock();
    }

    //去商品详情
    goGoods(goodsId) {
        this.$router.push({ path: 'cms_purchase_goods_detail', query: { goodsId: goodsId } });
    }

    //报错提示
    errorMsgDialog(msg, cb) {
        let _self = this;
        let dialogObj = {
            title: '提示',
            content: msg || '服务异常',
            assistBtn: '',
            mainBtn: '我知道啦',
            type: 'error',
            assistFn() { },
            mainFn() {
                cb && cb();
            }
        };
        _self.$store.state.$dialog({ dialogObj });
    }


    //初始化搜索结果  在提交关键词和下拉刷新时
    search_init(callBack = null) {
        this.search_flag = true;
        this.search_page = 0;
        this.dataList = [];
        this.search_next(callBack);
    }

    //得到下一页搜索结果
    search_next(callBack = null) {
        let _self = this;
        this.search_page++;
        _self.buyMaxLength = 4;
        this._$service.queryWaitOrders(this.goodsId, this.search_page, this.search_limit).then((res) => {
            let _result = res.data;
            if (!_self.search_flag) {
                return;
            }
            let _dataList = [];
            let _orderDatas = _result.data;
            if (_result.errorCode) {
                _self.search_flag = false;
                _self.errorMsgDialog();
                // 没有订单 也可针对该商品进货
                // } else if (_orderDatas.length == 0) {
                //     _self.search_flag = false;
            } else {
                //console.log('第' + _self.search_page + '页数据:', res);
                //商品
                if (_self.search_page == 1) {
                    _self.goodsData = _result.goods;
                    _self.countAmount += _result.goods.amount;
                    _self.minMoney = (+_result.minMoney || 0);
                    _self.flag = _result.flag;
                    _self.buyMaxNum = _self.goodsData.wholeMaxBuyNum || _self.buyMaxNum;
                    _self.buyMaxLength = (_self.buyMaxNum + '').length;
                    //if (_result.discountMoney !== _result.goods.moneyPrice) {
                    // _self.showDiscountDetail = true;
                    //_self.goodsData.moneyPrice = _result.discountMoney;
                    //}
                }
                //库存
                for (let i = 0, len = _orderDatas.length; i < len; i++) {
                    let _tmp = _orderDatas[i];
                    //计算利润
                    if (!_tmp.shopIncome) {
                        _tmp.shopIncome = _tmp.purchasePrice * (_tmp.shopSaleDisct - _tmp.shopBuyDisct) * _tmp.punishDisct / 100 / 100;
                    }
                    _tmp.buyTotal = (+_tmp.shopSaleDisct) ? (Math.ceil(_tmp.purchasePrice * (_tmp.shopSaleDisct / 100)) * _tmp.number) : _tmp.purchasePrice * _tmp.number;
                    // 任何情况倒计时都要 手动 清除
                    _tmp.timer = setInterval(function () {
                        if ((_tmp.acceptTimeLeft -= 1000) <= 0) {
                            _tmp.acceptTimeLeft = 0;
                            clearInterval(_tmp.timer);
                        }
                    }, 1000);
                    _tmp.needAmount = 0;//初始化
                    _self.diffNeedAmout(_tmp);
                    _dataList.push(_tmp);
                }
                _self.dataList = _dataList;
                //检查是否有下一页
                _self.search_flag = _result.orderWhole && (_self.search_limit == _result.orderWhole.length);
                callBack && callBack();
            }
        });
    }
    /**
    * 计算所需库存值
    * @param item
    */
    diffNeedAmout(item) {
        let _result = 0;
        if (item.number === item.needAmount || !this.countAmount) {
            // 已满足，不用在分配  或者库存不足，无法分配
            return;
        }
        let _needNum = item.number - item.needAmount; // 所需
        if (this.countAmount > _needNum) {
            _result = _needNum;
            this.countAmount -= _needNum;
        } else {
            _result = this.countAmount;
            this.countAmount = 0;
        }
        item.needAmount += _result;
        this.diffAmountRate(item);
    }

    diffAmountRate(item) {
        if (item.needAmount !== item.number) {
            item.amountRate = Math.floor((item.needAmount / item.number) * 100) + '%';
        } else {
            item.amountRate = 'inherit';
        }
    }

    overnum = 0;

    diffSlider(value) {
        value = (+value);
        this.countAmount += value;
        if (this.countAmount < 0) { return; }
        if (value > 0) {
            for (let i = 0, len = this.dataList.length; i < len; i++) {
                let _item = this.dataList[i];
                if (_item.number !== _item.needAmount) {
                    let _diff = _item.number - _item.needAmount;
                    if (_diff > value) {
                        _item.needAmount += value;
                        value = 0;
                    } else {
                        _item.needAmount += _diff;
                        value -= _diff;
                    }
                    this.diffAmountRate(_item);
                    if (!value) {
                        break;
                    }
                }
            }
            this.overnum += value;
        } else {
            let num = this.overnum;
            this.overnum += value;
            if (this.overnum < 0) {
                value = num > 0 ? value + num : value;
                let len = this.dataList.length;
                for (let i = len - 1; i >= 0; i--) {
                    let _item = this.dataList[i];
                    if (_item.needAmount) {
                        let _diff = -_item.needAmount;
                        if (_diff > value) {
                            _item.needAmount = 0;
                            value -= _diff;
                        } else {
                            _item.needAmount = value - _diff;
                            value = 0;
                        }
                        this.diffAmountRate(_item);
                        if (!value) {
                            break;
                        }
                    }
                }
            }
        }
    }
    /**
     * 清除所有定时器
     */
    clearAllTimer() {
        for (let i = 0, len = this.dataList.length; i < len; i++) {
            this.dataList[i].timer &&
                clearInterval(this.dataList[i].timer);
        }
    }

    /**
     * 根据毫秒t得到时间字符串
     */
    getTime(t) {
        let _getN = function (n) {
            return n > 9 ? n : '0' + n;
        },
            _getT = function (n, t = 3) {
                return --t ? _getT(Math.floor(n / 60), t) + ':' + _getN(n % 60) : _getN(n);
            };
        return _getT(Math.floor(t / 1000));
    }

    /**
     * 下拉刷新
     */
    refresh(done) {
        let _self = this;
        this.chooseNum = 0;

        setTimeout(function () {
            _self.clearAllTimer();
            _self.search_init();
            done(true);
        }, 500);
    }

    /**
     * 上拉加载
     */
    infinite(done) {
        let _self = this;
        if (this.search_flag) {
            setTimeout(() => {
                _self.search_next();
                done(true);
            }, 500);
        } else {
            done(true);
        }
    }

    //计算订单信息
    calcOrderInfo() {
        this.totalMoney = this.goodsData.moneyPrice * this.chooseNum;
        this.canBuy = false;
        if (this.totalMoney >= this.minMoney&&this.chooseNum<=this.stockNum) {
            this.canBuy = true;
        }
        //chooseNum改变,计算各个订单是否满足
        // for (let i = 0, len = this.dataList.length; i < len; i++) {
        //     let _item = this.dataList[i];
        //     if (_item.number !== _item.needAmount) {
        //         this.canBuy = false;
        //         break;
        //     }
        // }
    }
    stockNum = 0;
    async queryGoodsStock() {
        let _self = this;
        let _param = {
            goodsId: _self.$route.query.goodsId,
            deliveryType: 0
        }
        let ordinaryStockNum = (await this._$service.queryGoodsStock(_param)).data;
        _self.stockNum = ordinaryStockNum
    }
    /**
     * 减小数量
     */
    orderNumbPrev() {
        if (this.chooseNum) {
            this.chooseNum--;
        }
        if (this.chooseNum > this.stockNum) {
            this.canBuy = false;
        }else{
            this.canBuy = true;
        }
    }

    /**
     * 增加数量
     */
    orderNumbNext() {
        this.chooseNum++;
        if(this.chooseNum>this.stockNum){
            this.canBuy = false;
        } else {
            this.canBuy = true;
        }
    }

    //输入框失焦
    chooseNumBlur() {
        let reg = /^[1-9]\d*$/;
        let num = '' + Number(this.chooseNum);
        if (reg.test(num)) {
            this.chooseNum = num;
        } else {
            this.chooseNum = 0;
        }
        if (this.chooseNum > this.stockNum) {
            this.canBuy = false;
        } else {
            this.canBuy = true;
        }
        this.calcOrderInfo();
    }

    buyDialog = false;

    @Watch('chooseNum')
    changeNumInput(newVal, oldVal) {
        newVal = +newVal ? newVal : 0;
        oldVal = +oldVal ? oldVal : 0;
        if (newVal > this.buyMaxNum) {
            let dialogObj = {
                title: '提示',
                content: '您购买的最大数量为' + this.buyMaxNum,
                mainBtn: '我知道啦',
                type: 'info',
                mainFn() { }
            };
            this.$store.state.$dialog({ dialogObj });
            this.buyDialog = true;
            this.chooseNum = oldVal;
            return;
        }
        if (this.buyDialog) {
            this.chooseNum = this.buyMaxNum;
            this.buyDialog = false;
        } else {
            if (newVal != oldVal) {
                let _diff = newVal - oldVal;
                this.diffSlider(_diff);
                this.calcOrderInfo();
            }
            if (!newVal) {
                this.overnum = 0;
            }
        }
    }

    //输入数量改变
    chooseNumInput() {
        let reg = /^[1-9]\d*$/;
        let num = '' + Number(this.chooseNum);
        if (reg.test(num)) {
            this.calcOrderInfo();
        } else {
            this.canBuy = false;
        }
    }

    /**
     * 点击立即进货
     */
    goBuy() {
        let _self = this;
        if (this.canBuy) {
            this.$router.push({ path: 'cms_purchase_submit_order', query: { goodsId: _self.goodsId, goodsType: 'entity', number: this.chooseNum, orderSrouce: 'goods', stockType: 0 } });
        }
    }
    toShopcar() {
        this.$router.push({ path: "cms_purchase_shop_car" });
    }
    /**
     * 加入进货单
     */
    joinCar() {
        if (this.chooseNum == 0) {
            let dialogObj = {
                title: '提示',
                content: "请选择加入进货单商品数量",
                mainBtn: '确定',
                type: 'info',
                mainFn() { }
            };
            this.$store.state.$dialog({ dialogObj });
            return;
        }

        let _self = this;
        let opt = {
            goodsId: _self.goodsId,
            number: _self.chooseNum
        }
        this._$service.addGoods(opt).then(res => {
            if (res.data.errorCode) {
                let _toast = _self.$store.state.$toast;
                _toast({ title: res.data.msg, success: false });
                return;
            }
            let _toast = _self.$store.state.$toast;
            _toast({ title: '加入进货单成功' });
        })
    }
}
