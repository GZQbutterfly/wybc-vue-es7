import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import './shop_car.scss';
import shopCarService from './shop_car.service';
import { isNotLogin, toLogin, cacheLogin } from "common.env";



@Component({
    template: require('./shop_car.html')
})
export class CmsPurchaseShopCar extends BaseVue {
    // 组件方法也可以直接声明为实例的方法
    validLists = []//购物车列表
    invalidLists = [];//失效列表
    total = 0;//合计
    totalPrice = 0;//总额
    settlement = 0;//结算个数
    checkAll = false;//全选
    isEdit = true;//编辑状态
    edit = "编辑";
    isEmpty = true;//购物车为空
    isShow = false;//失效物品区域显示
    recommendShow = false;
    recommendLists = [];
    _$service;
    page = 1;
    flag = false;
    wdName = '';
    infoId = '';
    headImg = '/static/newshop/images/pic-nologin.png';
    qflag = true;
    //最低购买金额
    isFirst = false;
    leastMoney = 0;
    stockType = '';
    stocktypeShow = false;
    stockTypes = [{
        stocktype: "仓储中心代管",
        stocktypeShow: false
    }, {
        stocktype: "快速仓自储",
        stocktypeShow: false
    }];

    stockTypeShow = false;
    _shopcartCache;
    data() {
        return {};
    }
    mounted() {
        // 注册服务
        this._$service = shopCarService(this.$store);
        this.initPage();
    }
    activated() {
        document.title = "进货单";
        // keep-alive 时 会执行activated
        this.$nextTick(() => {
            this.getShoppcarMsg();
            this.queryRecommendGoods();
            this.getLeastBuyMoney();
        });

    }
    initPage(){
        let _self = this;
        _self.page = 1;
        _self.edit = "编辑";
        _self.isEdit = true;
        _self.checkAll = false;
        _self.recommendShow = false;
        _self.isEmpty = true;
        _self.stockTypeShow = false;
        _self.validLists = []//购物车列表
        _self.invalidLists = [];//失效列表
    }
    getShoppcarMsg() {
        this._shopcartCache = JSON.parse(localStorage.getItem("shopcartCache"));
        let _self = this;
        _self.stockTypeShow = false;
        this.stockTypes = [{
            stocktype: "仓储中心代管",
            stocktypeShow: false
        }, {
            stocktype: "快速仓自储",
            stocktypeShow: false
        }];
        //用户是否登录
       
        _self._$service.getShopcarGoodsesList(1).then( async (res) => {
            if (res.data.errCode) {
                let dialogObj = {
                    title: '',
                    content: res.data.msg,
                    assistBtn: '',
                    mainBtn: '我知道了',
                    type: 'info',
                    assistFn() {
                    },
                    mainFn() {
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
                return;
            }
            if (res.data.data.length == 0) {
                _self.isEdit = true;
                _self.isEmpty = true;
                return;
            }
            if (res.data.message) {
                let dialogObj = {
                    title: '',
                    content: '您已升级，进货单商品已更新！',
                    assistBtn: '',
                    mainBtn: '我知道了',
                    type: 'info',
                    assistFn() {
                    },
                    mainFn() {
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
            }
            let _validLists = [];
            let _invalidLists = [];
            if (res.data.data[0].shopId == 0) {
                _self.wdName = "学惠精选官方商城";
            } else {
                _self.wdName = res.data.data[0].wdName;
            }
            let _result = res.data.data;
            _result.forEach(item => {
                item.check = false;
                if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
                    _validLists.push(item);
                } else {
                    _invalidLists.push(item);
                }
            });
            _self.validLists = _validLists;
            _self.invalidLists = _invalidLists;
            _self.setGoods();
            let num = 0;
            _validLists.forEach(ele => {
                num += Number(ele.number);
            });
            _self.$store.state.shopCar.count = num;
            if (_invalidLists.length == 0) {
                _self.isShow = false;
            } else {
                _self.isShow = true;
            }
            if (_validLists.length != 0) {
                _self.isEmpty = false;
            } else {
                _self.isEmpty = true;
            }

        });

        if(_self.validLists.length){
            if(!_self.isEdit){
                _self.edit = "编辑";
                _self.isEdit = true;
                _self.checkAll = false;
                _self.settlement = 0;
            }
        }
    }
    queryRecommendGoods(){
        let _self = this;
        //推荐商品
        this._$service.getShopcarRecommend().then(async (res) => {
            if (res.data.data && res.data.data.length == 0 || res.data.errorCode) {
                _self.recommendLists.length = 0;
                _self.recommendShow = true;
                return;
            }
            _self.recommendShow = false;
            _self.recommendLists = res.data.data;
        });
    }
    async changePrice(res) {
        let _self = this;
        let shopId = _self.$store.state.workVO.user.userId;
        let goodsIds = []; let opt = { infoId: shopId, listStr: "" };
        res.forEach(ele => {
            goodsIds.push(ele.goodsId)
        });
        opt.listStr = goodsIds.join(",");
        let discount = await this._$service.getDiscountPrice(opt);
        for (let i = 0, len = res.length; i < len; i++) {
            for (let j = 0, lenj = discount.data.length; j < lenj; j++) {
                if (i == j) {
                    res[i].moneyPrice = Math.ceil(res[i].moneyPrice * discount.data[j] / 100);
                    break;
                }
            }
        }
        _self.qflag = false;
        return res;
    }
    //刷新
    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.getShoppcarMsg();
            done();
        }, 1500)
    }
    //加载更多
    infinite(done) {
      done(true);
    }
    //选中商品
    setGoods() {
        let goodsId = JSON.parse(localStorage.getItem("checkStateCms"));
        let _self = this;
        let flag = true;
        if (goodsId && goodsId.length != 0) {
            this.validLists.forEach(item => {
                goodsId.forEach(ele => {
                    if (item.goodsId == ele) {
                        item.check = true;
                    }
                });
                if (!item.check) {
                    flag = false;
                }
            });
            _self.checkAll = flag;
            _self.calTotalMoney();
        }
    }
    //单选
    onRadio(e, index) {
        let _self = this;
        this.validLists[index].check = !this.validLists[index].check;
        let goodsId = [];
        let flag = true;
        this.validLists.forEach(item => {
            if (!item.check) {
                flag = false;
            }
            if (_self.edit === "编辑") {
                if (item.check) {
                    goodsId.push(item.goodsId);
                }
            }
        });
        this.checkAll = flag;
        this.calTotalMoney();
        if (_self.edit == "编辑") {
            localStorage.setItem("checkStateCms", JSON.stringify(goodsId));
        }

    }
    //全选
    checkAllState(e) {
        let _self = this;
        let flag = true;
        let goodsId = [];
        if (this.checkAll) {
            flag = false;
        }

        this.validLists.forEach(item => {
            item.check = flag;
            if (_self.edit == "编辑") {
                if (item.check) {
                    goodsId.push(item.goodsId);
                }
            }
        })
        this.checkAll = !this.checkAll;
        this.calTotalMoney();

        if (_self.edit == "编辑") {
            localStorage.setItem("checkStateCms", JSON.stringify(goodsId));
        }
        console.log(_self.edit);
    }
    //减
    minus(index) {
        if (this.validLists[index].number <= 1) {
            this.validLists[index].number = 1;
            return;
        }
        this.validLists[index].number--;
        this.getCount(index);
    }
    //加
    add(index) {
        this.validLists[index].number++;
        this.getCount(index);
    }
    //修改值
    changeNum(e, index) {
        let isNum = ('' + this.validLists[index].number).indexOf('.');
        console.log(isNum);
        if (!this.validLists[index].number || this.validLists[index].number <= 0 || isNum == 1) {
            this.validLists[index].number = 1;
            let _toast = this.$store.state.$toast;
            _toast({ title: '输入数量不正确', success: false });
            return;
        }
        this.getCount(index);
    }
    //修改购物车数量
    getCount(index) {
        // let _self = this;
        // let maxNum = this.validLists[index].maxBuyNum;
        // if (maxNum && this.validLists[index].number > maxNum) {
        //     this.validLists[index].number = maxNum;
        //     let _toast = this.$store.state.$toast;
        //     _toast({ title: '一次最多购买' + maxNum + '件', success: false });
        // }
        let opt = {
            cartId: this.validLists[index].id,
            num: this.validLists[index].number,
            goodsId: this.validLists[index].goodsId
        }
        this._$service.changeShopcarNumber(opt).then(res => {
            if (res.data.errorCode) {
                let _toast = _self.$store.state.$toast;
                _toast({ title: res.data.msg, success: false });
                _self.validLists[index].number = 1;
            }

        });
        let num = 0;
        this.validLists.forEach(ele => {
            num += Number(ele.number);
        });
        this.$store.state.shopCar.count = num;
    }
    //计算商品总价
    calTotalMoney() {
        let totalMoney = 0, settlementNum = 0;
        this.validLists.forEach(item => {
            if (item.check) {
                let num = Number(item.number)
                totalMoney += item.moneyPrice * num;//应付价格
                settlementNum += num;

            }
        })
        this.total = totalMoney;
        this.settlement = settlementNum;
    }
    //购物车编辑
    editShopCar() {
        if (this.edit === "编辑") {
            this.edit = "完成";
            this.isEdit = false;
            this.checkAll = false;
            this.validLists.forEach(item => {
                item.check = false;
            })
        } else {
            this.isEdit = true;
            this.edit = "编辑";
            this.validLists.forEach(item => {
                item.check = false;
            })
            this.checkAll = false;
            this.setGoods();
            this.getShoppcarMsg();
        }
        this.calTotalMoney();
    }
    //删除购物车
    onDelete() {
        //弹出层
        let _self = this;

        if (this.settlement == 0) {
            let dialogObj = {
                title: '',
                content: '您未选中要删除的商品',
                assistBtn: '',
                mainBtn: '确定',
                type: 'info',
                assistFn() {
                },
                mainFn() {
                }
            };
            this.$store.state.$dialog({ dialogObj });
            return;
        }
        let dialogObj = {
            title: '删除商品',
            content: '是否删除选中商品',
            assistBtn: '取消',
            mainBtn: '确定',
            type: 'info',
            assistFn() {
            },
            mainFn() {
                _self.delete();
                if (_self.validLists.length === 0) {
                    _self.isEmpty = true;
                }
            }
        };
        this.$store.state.$dialog({ dialogObj });
    }
    //删除购物车选中列表
    delete() {
        let goodsId = JSON.parse(localStorage.getItem("checkStateCms"));
        let goodsIdarr = [];
        let arr = [], del = [];
        this.validLists.forEach((item, index) => {
            if (!item.check) {
                arr.push(item);
            }
            else {
                del.push(item.id);
            }
        });
        this.validLists = arr;
        let num = 0;
        this.validLists.forEach(ele => {
            num += Number(ele.number);
        });
        this.$store.state.shopCar.count = num;

        if (goodsId && goodsId != 0) {
            goodsId.forEach(ele => {
                arr.forEach(item => {
                    if (ele == item.goodsId) {
                        goodsIdarr.push(ele);
                    }
                })
            });
            localStorage.setItem("checkStateCms", JSON.stringify(goodsIdarr));
        }
        let opt = {
            cartId: del.join(',')
        }
        console.log(opt);
        this._$service.deleteShopcar(opt).then(function (res) {
            console.log(res);
        })
    }
    //结算
    onSettle() {
        let flag = !isNotLogin();//判断用户有缓存登录
        let _self = this;
        let cartId = [];
        let stockFlag = false;
        this.validLists.forEach(item => {
            if (item.check) {
                cartId.push(item.id);
                if (!stockFlag&&item.maxBuyNum < item.number) {
                    stockFlag = true;
                }
            }
           
        });
        if (cartId.length == 0) {
            let dialogObj = {
                title: '',
                content: '您未选中商品！！',
                assistBtn: '',
                mainBtn: '确定',
                type: 'info',
                assistFn() {
                    console.log('ok');
                },
                mainFn() {
                }
            };
            this.$store.state.$dialog({ dialogObj });
            return;
        }
        if(stockFlag){
            let dialogObj = {
                title: '提示',
                content: '部分商品库存不足',
                assistBtn: '',
                mainBtn: '确定',
                type: 'info',
                assistFn() {

                },
                mainFn() {
                }
            };
            this.$store.state.$dialog({ dialogObj });
            return;
        }
        if (!flag) {
            let dialogObj = {
                title: '用户未登录',
                content: '登录后才可购买商品',
                assistBtn: '取消',
                mainBtn: '确定',
                type: 'info',
                assistFn() {

                },
                mainFn() {
                    toLogin(_self.$router, { toPath: 'cms_purchase_shop_car', realTo: 'cms_purchase_shop_car' });
                }
            };
            this.$store.state.$dialog({ dialogObj });
            return;
        }
        // this.stockTypeShow = true;
        this.$router.push({ path: 'cms_purchase_submit_order', query: { cartId: cartId.join(','), orderSrouce: 'car', stockType: 1 } });
    }

    //清空
    onClear() {
        let _self = this;
        let dialogObj = {
            title: '提示',
            content: '是否清空失效商品?',
            assistBtn: '取消',
            mainBtn: '确定',
            type: 'info',
            assistFn() {
            },
            mainFn() {
                let cartsId = [];
                _self.invalidLists.forEach(ele => {
                    cartsId.push(ele.id);
                });
                let opt = {
                    cartId: cartsId.join(',')
                }
                _self._$service.deleteShopcar(opt).then(function (res) {
                    console.log(res);
                })
                _self.invalidLists = [];
                _self.isShow = false;
            }
        };
        this.$store.state.$dialog({ dialogObj });
    }
    //进货方式
    // chooseStockTpe(index) {
    //     let _self = this;
    //     for (let i = 0, len = _self.stockTypes.length; i < len; i++) {
    //         if (i == index) {
    //             _self.stockTypes[i].stocktypeShow = true;
    //         } else {
    //             _self.stockTypes[i].stocktypeShow = false;
    //         }
    //     }
    //     let cartId = [];
    //     this.validLists.forEach(item => {
    //         if (item.check) {
    //             cartId.push(item.id);
    //         }
    //     });
    //     this.$router.push({ path: 'cms_purchase_submit_order', query: { cartId: cartId.join(','), orderSrouce: 'car', stockType: index } });
    // }
    // onClose() {
    //     this.stockTypeShow = false;
    // }
    //最低购买金额
    getLeastBuyMoney() {
        let _self = this;
        _self._$service.getLeastBuyMoney().then((res) => {
            _self.isFirst = res.data.flag;
            _self.leastMoney = res.data.leastBuy;
        });
    }
    QuicklyJoinTheShoppingCart(item){
        event.stopPropagation(); 
        let _self = this;
        let opt = {
            goodsId: item.goodsId,
            number: 1
        }
        this._$service.addGoods(opt).then(res => {
            if (res.data.errorCode) {
                let _toast = _self.$store.state.$toast;
                _toast({ title: res.data.msg, success: false });
                return;
            }
            let _toast = _self.$store.state.$toast;
            _toast({ title: '加入进货单成功' });
            _self.getShoppcarMsg();
        })
       
    }
    toDetail(goodsId){
        this.$router.push({ path:"cms_purchase_goods_detail",query:{goodsId:goodsId}})
    }
    goCouponList(){
        this.$router.push({ path:"cms_mask_coupon"})
    }
}
