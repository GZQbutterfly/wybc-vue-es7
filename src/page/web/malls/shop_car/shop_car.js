import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { isNotLogin, toLogin, cacheLogin } from 'common.env';


import shopCarService from './shop_car.service';

import './shop_car.scss';

@Component({ template: require('./shop_car.html') })
export class ShopCar extends BaseVue {
    // 组件方法也可以直接声明为实例的方法
    validLists = []; //购物车列表
    invalidLists = []; //失效列表
    total = 0; //合计
    //最小消费额
    minimumConsumption = -1;
    totalPrice = 0; //总额
    settlement = 0; //结算个数
    checkAll = false;//全选
    isEdit = true; //编辑状态
    edit = '编辑';
    isEmpty = false; //购物车为空
    isShow = false; //失效物品区域显示
    // wxShopCheck: boolean = false;//店铺全选
    recommendShow = true;
    recommendLists = [];
    page = 1;
    flag = false;
    headImg = '/static/newshop/images/pic-nologin.png';
    isLimit = false; //false受限制
    qflag = true;

    data() {
        return {};
    }
    mounted() {
        // 注册服务
        this._$service = shopCarService(this.$store);
        this.initPage();
    }
    activated() {
        document.title = "购物车";
        // keep-alive 时 会执行activated
        this.$nextTick(() => {
            this.getShoppcarMsg();
        });
    }
    initPage() {
        let _self = this;
        //用户是否登录
        _self.page = 1;
        _self.edit = "编辑";
        _self.isEdit = true;
        _self.checkAll = false;
        _self.recommendShow = false;
        _self.isEmpty = false;
        _self.validLists = []//购物车列表
        _self.invalidLists = [];//失效列表
    }
    getShoppcarMsg() {
        this._shopcartCache = JSON.parse(localStorage.getItem("shopcartCache"));
        let _self = this;
        let flag = !isNotLogin();
        let shopcartCache = _self._shopcartCache;
        if (flag) {
            if (shopcartCache) {
                let goodsId = [], numbers = [], shopIds = [];
                shopcartCache.forEach(ele => {
                    ele.shopCarts.forEach(item => {
                        goodsId.push(item.goodsId);
                        numbers.push(item.number);
                        shopIds.push(ele.shopId);
                    })
                });
                let options = {
                    goodsId: goodsId.join(','),
                    number: numbers.join(','),
                    shopIds: shopIds.join(',')
                };
                //同步
                this._$service.synchronousShoppingCart(options).then(res => {
                    if (res.data.errorCode) {
                        _self.toast(res.data.msg, false);
                        return;
                    }
                    console.log(res);
                    //获取商品列表
                    _self._$service.getShopcarGoodsesList(1).then((res) => {
                        if (res.data.errorCode) {
                            _self.toast(res.data.msg, false);
                            return;
                        }
                        _self.transferFormat(res.data.data);
                        localStorage.removeItem("shopcartCache");
                    })
                })
            } else {
                _self._$service.getShopcarGoodsesList(1).then((res) => {
                    if (res.data.errorCode) {
                        _self.toast(res.data.msg, false);
                        return;
                    }
                    _self.transferFormat(res.data.data);

                });
            }
        } else {
            if (!shopcartCache) {
                this.isShow = false;
                this.isEmpty = true;
                let num = 0;
                _self.validLists.length = 0;
                _self.invalidLists.length = 0;
                this.$store.state.shopCar.count = num;
            } else {
                this.isEmpty = false;
                this.isShow = false;
                _self.invalidLists.length = 0;
                let _validLists = [];
                let goodsIds = [], numbers = [];
                shopcartCache.forEach(lists => {
                    lists.shopCarts.forEach(item => {
                        goodsIds.push(item.goodsId);
                        numbers.push(item.number);
                    })
                });
                _self._$service.getGoodsLists(goodsIds.join(",")).then(res => {
                    let _result = res.data.data;
                    _result.forEach((item, i) => {
                        item.number = numbers[i];
                    })
                    shopcartCache[0].shopCarts = _result;
                    shopcartCache.forEach(lists => {
                        let list = [], obj = {};
                        lists.wxShopCheck = false;
                        lists.shopCarts.forEach(item => {
                            item.check = false;
                            list.push(item);
                        })
                        lists.data = list;
                        _validLists.push(lists);
                    });
                    _self.validLists = _validLists;
                    _self.setGoods();
                    _self.setNum(_self.validLists);
                });
            }
        }

        if(_self.validLists.length){
            if(!_self.isEdit){
                _self.edit = "编辑";
                _self.isEdit = true;
                _self.checkAll = false;
                _self.settlement = 0;
            }
        }

        //推荐商品
        this._$service.getShopcarRecommend().then((res) => {
            _self.recommendLists.length = 0;
            if (res.data.errorCode || (res.data.data && res.data.data.length == 0)) {
                _self.recommendShow = true;
                return;
            }
            _self.recommendShow = false;
            _self.recommendLists = res.data.data;
        });

        this.updateMinimumConsumption();
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
        if (this.qflag) {
            done(false);
            return;
        }
        let login = !isNotLogin();
        let _self = this;
        if (login) {
            this.page++;
            if (_self.page < 2) {
                _self.page = 2;
            }
            let _result = _self._$service.getShopcarGoodsesList(_self.page);
            setTimeout(() => {
                _result.then((res) => {
                    if (!res.data.data || res.data.data.length == 0 || res.data.errCode) {
                        done(true);
                        return;
                    }
                    res.data.data.forEach(lists => {
                        let list = [];
                        lists.wxShopCheck = false;
                        lists.shopCarts.forEach(item => {
                            if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
                                list.push(item);
                            } else {
                                _self.invalidLists.push(item);
                            }
                        })
                        lists.data = list;
                        _self.validLists.push(lists);
                        if (_self.invalidLists.length != 0) {
                            _self.isShow = true;
                        }
                    })
                    done(true);
                });
            }, 1500)
        } else {
            setTimeout(() => {
                done(true);
            }, 1500);
        }
    }
    //查询改商品是否受限制     
    checkLimit(data) {
        let _self = this;
        let isflag = false;
        data.forEach(ele => {
            ele.data.forEach(item => {
                if (item.check && item.limitedByOrder) {
                    isflag = true;//bu受限制
                }
            })
        });
        _self.isLimit = isflag;
    }
    //转格式
    transferFormat(res) {
        let _self = this;
        if (res.length == 0) {
            _self.isEmpty = true;
            _self.$store.state.shopCar.count = 0;
            return;
        }
        let _validLists = [];
        let _invalidLists = [];
        let arr = [];
        res.forEach(lists => {
            let list = [], obj = {};
            if (lists.shopCarts && lists.shopCarts.length == 0) {
                return;
            }
            lists.wxShopCheck = false;
            lists.shopCarts.forEach(item => {
                item.check = false;
                if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid) {
                    list.push(item);
                } else {
                    _invalidLists.push(item);
                }
            });
            if (list.length == 0) {
                return;
            }
            lists.data = list;
            if (lists.shopCarts.length == 0) {
                return;
            }
            _validLists.push(lists);
        })
        if (_validLists.length === 0) {
            _self.isShow = false;
        } else {
            _self.isShow = true;
        }
        let ft = true;
        for (let i = 0, len = _validLists.length; i < len; i++) {
            if (_validLists[i].length != 0) {
                ft = false;
                break;
            }
        }
        if (ft) {
            _self.isEmpty = true;
        } else {
            _self.isEmpty = false;
        }
        _self.validLists = _validLists;
        _self.invalidLists = _invalidLists;
        _self.setGoods();
        _self.setNum(_self.validLists);
        _self.checkLimit(_self.validLists);
        _self.qflag = false;
    }
    //选中商品
    setGoods() {
        let goodsId = JSON.parse(localStorage.getItem("checkState"));
        let _self = this;
        let flag = true;

        if (goodsId && goodsId.length != 0) {
            _self.validLists.forEach(lists => {
                let flag2 = true;
                lists.data.forEach(item => {
                    goodsId.forEach(ele => {
                        if (item.goodsId == ele) {
                            item.check = true;
                        }
                    });
                    if (!item.check) {
                        flag = false;
                        flag2 = false;
                    }
                });

                lists.wxShopCheck = flag2;
            });
            _self.checkAll = flag;
            _self.calTotalMoney();
        }
    }
    //本地缓存勾选状态
    cacheCheck() {
        let goodsId = [];
        let _self = this;
        this.validLists.forEach(item => {
            item.data.forEach(ditem => {
                if (_self.edit == "编辑") {
                    if (ditem.check) {
                        goodsId.push(ditem.goodsId);
                    }
                }
            })
        })
        if (_self.edit == "编辑") {
            localStorage.setItem("checkState", JSON.stringify(goodsId));
        }
    }
    //单选
    onRadio(e, index1, index2) {
        let _self = this;
        _self.validLists[index1].data[index2].check = !_self.validLists[index1].data[index2].check;
        let flag = true;
        _self.validLists[index1].data.forEach(item => {
            if (!item.check) {
                flag = false;
            }
        });
        _self.checkLimit(_self.validLists);
        _self.validLists[index1].wxShopCheck = flag; //店铺全选
        let flag2 = true; //判断是否所有店铺全选
        _self.validLists.forEach(item => {
            if (!item.wxShopCheck) {
                flag2 = false;
            }
        })
        _self.checkAll = flag2;
        _self.cacheCheck();
        _self.calTotalMoney();

    }
    //店铺全选
    wxShopCheckAll(index1) {
        let _self = this;
        let flag = true;
        if (_self.validLists[index1].wxShopCheck) {
            flag = false;
        }
        _self.validLists[index1].data.forEach(item => {
            item.check = flag;
        })
        _self.validLists[index1].wxShopCheck = flag;
        let flag2 = true; //判断是否所有店铺全选
        _self.validLists.forEach(item => {
            if (!item.wxShopCheck) {
                flag2 = false;
            }
        })
        _self.checkAll = flag2;
        _self.calTotalMoney();
        _self.cacheCheck();
        _self.checkLimit(this.validLists);
    }
    //全选
    checkAllState(e) {
        let _self = this;
        let flag = true;
        if (_self.checkAll) {
            flag = false;
        }
        _self.validLists.forEach(item => {
            item.wxShopCheck = flag;
            item.data.forEach(ditem => {
                ditem.check = flag;
            })
        })
        _self.checkAll = !_self.checkAll;
        _self.calTotalMoney();
        _self.cacheCheck();
        _self.checkLimit(_self.validLists);
    }
    //减
    minus(index1, index2) {
        if (this.validLists[index1].data[index2].number <= 1) {
            this.validLists[index1].data[index2].number = 1;
            return;
        }
        this.validLists[index1].data[index2].number--;
        this.getCount(index1, index2);
    }
    //加
    add(index1, index2) {
        this.validLists[index1].data[index2].number++;
        this.getCount(index1, index2);
    }
    //修改值
    changeNum(e, index1, index2) {
        let isNum = ('' + this.validLists[index1].data[index2].number).indexOf('.');
        console.log(isNum);
        if (!this.validLists[index1].data[index2].number || this.validLists[index1].data[index2].number <= 0 || isNum == 1) {
            this.validLists[index1].data[index2].number = 1;
            let _toast = this.$store.state.$toast;
            _toast({ title: '输入数量不正确', success: false });
            return;
        }
        this.getCount(index1, index2);
    }
    //修改购物车数量
    getCount(index1, index2) {
        let maxNum = this.validLists[index1].data[index2].maxBuyNum;
        let _self = this;
        if (maxNum) {
            if (_self.validLists[index1].data[index2].number > maxNum) {
                _self.validLists[index1].data[index2].number = maxNum;
                let _toast = _self.$store.state.$toast;
                _toast({ title: '一次最多购买' + maxNum + '件', success: false });
            }
        }
        let flag = !isNotLogin();
        if (flag) {
            let opt = {
                shopCartId: _self.validLists[index1].data[index2].id,
                num: _self.validLists[index1].data[index2].number,
                goodsId: _self.validLists[index1].data[index2].goodsId
            }
            _self._$service.changeShopcarNumber(opt).then(res => {
                if (res.data.errorCode) {
                    _self.toast(res.data.msg, false);
                    _self.validLists[index1].data[index2].number = maxNum;
                    return;
                }
            });
        } else {
            localStorage.setItem("shopcartCache", JSON.stringify(_self.validLists));
        }
        _self.setNum(_self.validLists);
    }
    //计算商品总价
    calTotalMoney() {
        let totalMoney = 0, settlementNum = 0;
        this.validLists.forEach(lists => {
            lists.data.forEach(item => {
                if (item.check) {
                    totalMoney += item.moneyPrice * item.number;//应付价格
                    settlementNum += Number(item.number);

                }
            })
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
            this.validLists.forEach(lists => {
                lists.wxShopCheck = false;
                lists.data.forEach(item => {
                    item.check = false;
                })
            })
        } else {
            this.isEdit = true;
            this.edit = "编辑";
            this.validLists.forEach(lists => {
                lists.wxShopCheck = false;
                lists.data.forEach(item => {
                    item.check = false;
                })
            })
            this.checkAll = false;
            this.setGoods();
        }
        this.calTotalMoney();
    }
    //删除购物车
    onDelete() {
        //弹出层
        let dialog = this.$store.state.$dialog;
        let _self = this;

        if (this.settlement == 0) {
            let dialogObj = {
                title: '提示',
                content: '您未选中要删除的商品',
                assistBtn: '',
                mainBtn: '确定',
                type: 'info',
                assistFn() {
                },
                mainFn() {
                }
            };
            dialog({ dialogObj });
            return;
        }
        let dialogObj = {
            title: '提示',
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
        dialog({ dialogObj });
    }
    //删除购物车选中列表
    delete() {
        let flag = !isNotLogin();
        //本地删除购物车
        let shopcartCache = JSON.parse(localStorage.getItem("shopcartCache"));
        let goodsId = JSON.parse(localStorage.getItem("checkState"));
        let goodsIdarr = [];
        let _self = this;
        if (!flag) {
            let arr = [], arr1 = [];
            this.validLists.forEach((lists) => {
                let list = [];
                lists.data.forEach(item => {
                    if (!item.check) {
                        list.push(item);
                        arr1.push(item);
                    }
                })
                if (list.length != 0) {
                    lists.data = list;
                    arr.push(lists);
                }
            });

            this.validLists = arr;
            if (goodsId && goodsId.length != 0) {
                goodsId.forEach(ele => {
                    arr.forEach(lists => {
                        lists.data.forEach(item => {
                            if (ele == item.goodsId) {
                                goodsIdarr.push(ele);
                            }
                        })
                    })
                });
                localStorage.setItem("checkState", JSON.stringify(goodsIdarr));
            }
            if (arr1.length == 0) {
                this.isEmpty = true;
                this.isShow = false;
                localStorage.removeItem("shopcartCache");
                return;
            }
            this.setNum(arr);

            if (arr.length == 0) {
                this.isEmpty = true;
                this.isShow = false;
                localStorage.removeItem("shopcartCache");
                return;
            }
            localStorage.setItem("shopcartCache", JSON.stringify(arr));
        } else {
            let arr = [], shopCartIds = [];
            this.validLists.forEach((lists, index) => {
                let list = [];
                lists.data.forEach(item => {
                    if (!item.check) {
                        list.push(item);
                    }
                    else {
                        shopCartIds.push(item.id);
                    }
                })
                if (list.length != 0) {
                    lists.data = list;
                    arr.push(lists);
                }
            });
            this.validLists = arr;
            this.setNum(arr);

            if (goodsId && goodsId.length != 0) {
                goodsId.forEach(ele => {
                    arr.forEach(lists => {
                        lists.data.forEach(item => {
                            if (ele == item.goodsId) {
                                goodsIdarr.push(ele);
                            }
                        })
                    })
                });
                localStorage.setItem("checkState", JSON.stringify(goodsIdarr));
            }
            let opt = {
                shopCartIds: shopCartIds.join(',')
            }
            console.log(opt);
            this._$service.deleteShopcar(opt).then(function (res) {
                if (res.data.errCode) {
                    _self.toast(res.data.msg, false);
                    return;
                }
                console.log(res);
            })
        }
    }
    //设置购物车显示数量
    setNum(validLists) {
        console.log(validLists);
        let num = 0;
        validLists.forEach(ele => {
            ele.data.forEach(item => {
                num += Number(item.number);
            })
        });
        this.$store.state.shopCar.count = num;
    }
    //结算是否为同一个校区
    checkSameSchool() {
        let school = '';
        this.validLists.forEach(lists => {
            if (school) {
                if (school != lists.school) {
                    return true;
                }
            } else {
                school = lists.school;
            }
        });
        return false;
    }
    //结算
    onSettle() {
        let flag = !isNotLogin();//判断用户有缓存登录
        let dialog = this.$store.state.$dialog;
        let _self = this;
        let cartId = [];
        //多校区订单检测
        if (_self.checkSameSchool()) {
            let dialogObj = {
                title: '提示',
                content: '多校区订单不能同时提交！',
                assistBtn: '',
                mainBtn: '确定',
                type: 'info',
                assistFn() {
                },
                mainFn() {
                }
            };
            dialog({ dialogObj });
            return;
        }
        this.validLists.forEach(lists => {
            lists.data.forEach(item => {
                if (item.check) {
                    cartId.push(item.id);
                }
            })
        });
        if (cartId.length == 0) {
            let dialogObj = {
                title: '提示',
                content: '您未选中商品！！',
                assistBtn: '',
                mainBtn: '确定',
                type: 'info',
                assistFn() { console.log('ok'); },
                mainFn() { }
            };
            dialog({ dialogObj });
            return;
        }
        if (!flag) {
            let dialogObj = {
                title: '用户未登录',
                content: '登录后才可购买商品',
                assistBtn: '取消',
                mainBtn: '确定',
                type: 'info',
                assistFn() { },
                mainFn() {
                    toLogin(_self.$router, { toPath: 'shop_car', realTo: 'shop_car' });
                }
            };
            dialog({ dialogObj });
            return;
        }

        this.$router.push({ path: 'order_submit', query: { cartId: cartId.join(','), orderSrouce: 'car' } });
    }
    //清空
    onClear() {
        let dialog = this.$store.state.$dialog;
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
                    shopCartIds: cartsId.join(',')
                }
                _self._$service.deleteShopcar(opt).then(function (res) {
                    console.log(res);
                })
                _self.invalidLists = [];
                _self.isShow = false;
            }
        };
        dialog({ dialogObj });
    }
    //报错
    toast(content, boolean) {
        let _toast = this.$store.state.$toast;
        _toast({ title: content, success: boolean });
    }

    //更新最低消费额
    updateMinimumConsumption() {
        if (this.minimumConsumption != -1) {//无需更新
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

    goWdShop(infoId) {
        this.$router.push({ path: 'home', query: { shopId: infoId } });
    }

}
