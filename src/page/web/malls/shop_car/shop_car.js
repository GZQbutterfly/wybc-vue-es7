import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isNotLogin, toLogin } from 'common.env';
import shopCarService from './shop_car.service';
import finishToCar from "./finishToCar";
import { GoodsList } from '../goods_list/goods_list';
import './shop_car.scss';

@Component({
    template: require('./shop_car.html'),
    components: {
        "list-goods": GoodsList
    }
})

export class ShopCar extends BaseVue {
    // 组件方法也可以直接声明为实例的方法
    validLists = []; //购物车列表
    invalidLists = []; //失效列表
    shopCars = [{ data: [] }, { data: [] }]
    total = 0; //合计
    totalPrice = 0; //总额
    settlement = 0; //结算个数
    checkAll = false;//全选
    isEdit = true; //编辑状态
    edit = '编辑';
    isEmpty = true; //购物车为空
    isShow = false; //失效物品区域显示
    // wxShopCheck: boolean = false;//店铺全选
    recommendShow = true;
    recommendLists = [];
    page = 1;
    flag = false;
    isLimit = false; //false受限制
    qflag = true;
    shopCarsIds = [];
    numbers = [];
    _shopcartCache = "";
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
            this.getShopcarRecommend();
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
        _self.isEmpty = true;
        _self.isShow = false;
        _self.shopCars = [{ data: [] }, { data: [] }];
        _self.validLists = []//购物车列表
        _self.invalidLists = [];//失效列表
        _self.shopCarsIds = [];
        _self.numbers = [];
    }
    async getShoppcarMsg() {
        this.edit = "编辑";
        this.isEdit = true;
        this.shopCarsIds = [];
        this.numbers = [];
        // this.shopCars = [{ data: [] }, { data: [] }];
        this._shopcartCache = JSON.parse(localStorage.getItem("shopcartCache") || null);
        let _self = this;
        let flag = !isNotLogin();
        let shopcartCache = _self._shopcartCache;
        if (flag) {
            if (shopcartCache) {
                let goodsId = [], numbers = [], shopIds = [], deliveryTypes = [];
                shopcartCache.data.forEach(ele => {
                    if (ele.commonShopCarts.length) {
                        ele.commonShopCarts.forEach(item => {
                            goodsId.push(item.goodsId);
                            numbers.push(item.number);
                            shopIds.push(ele.shopId);
                            deliveryTypes.push(item.deliveryType);
                        })
                    }
                });
                shopcartCache.data.forEach(ele => {
                    if (ele.fastShopCarts.length) {
                        ele.fastShopCarts.forEach(item => {
                            goodsId.push(item.goodsId);
                            numbers.push(item.number);
                            shopIds.push(ele.shopId);
                            deliveryTypes.push(item.deliveryType);
                        })
                    }
                });
                let options = {
                    goodsIds: goodsId.join(','),
                    numbers: numbers.join(','),
                    shopIds: shopIds.join(','),
                    deliveryTypes: deliveryTypes.join(",")
                };
                //同步
                let _result = (await this._$service.synchronousShoppingCart(options)).data;
                if (_result.errorCode) {
                    _self.toast(_result.msg, false);
                    localStorage.removeItem("shopcartCache");
                   // return;
                }
                //获取商品列表
                let _result1 = (await _self._$service.getShopcarGoodsesList(1)).data;
                if (_result1.errorCode) {
                    _self.toast(_result1.msg, false);
                } else {
                    _self.transferFormat(_result1);
                    localStorage.removeItem("shopcartCache");
                }
            } else {
                _self._$service.getShopcarGoodsesList(1).then((res) => {
                    if (res.data.errorCode) {
                        _self.toast(res.data.msg, false);
                        return;
                    }
                    _self.transferFormat(res.data);

                });
            }
        } else {
            if (!shopcartCache) {
                _self.isShow = false;
                _self.isEmpty = true;
                let num = 0;
                _self.validLists.length = 0;
                _self.shopCars = [{ data: [] }, { data: [] }];
                _self.invalidLists.length = 0;
                _self.$store.state.shopCar.count = num;
            } else {
                _self.isEmpty = false;
                _self.isShow = false;
                _self.invalidLists.length = 0;
                let shopId = shopcartCache.data[0].shopId;
                _self._$service.queryStoreState({ shopId }).then(res => {
                    if (!res.data.errorCode) {
                        if (res.data.state == 2) {
                            _self.updateLocalShopcar(shopcartCache);
                        } else {
                            shopcartCache.data[0].ksOpen = true;
                            _self.updateLocalShopcar(shopcartCache);
                        }
                    }
                })

            }
        }

        if (_self.validLists.length) {
            if (!_self.isEdit) {
                _self.edit = "编辑";
                _self.isEdit = true;
                _self.checkAll = false;
                _self.settlement = 0;
            }
        }
    }
    //推荐商品
    getShopcarRecommend() {
        let _self = this;
        this._$service.getShopcarRecommend().then((res) => {
            _self.recommendLists.length = 0;
            if (res.data.errorCode || (res.data.data && res.data.data.length == 0)) {
                _self.recommendShow = true;
                return;
            }
            _self.recommendShow = false;
            _self.recommendLists = res.data.data;
        });
    }
    //刷新
    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.getShoppcarMsg();
            _self.getShopcarRecommend();
            done();
        }, 1500)
    }
    //加载更多
    infinite(done) {
        // if (this.qflag) {
        //     done(true);
        //     return;
        // }
        // let login = !isNotLogin();
        // let _self = this;
        // if (login) {
        //     this.page++;
        //     if (_self.page < 2) {
        //         _self.page = 2;
        //     }
        //     let _result = _self._$service.getShopcarGoodsesList(_self.page);
        //     setTimeout(() => {
        //         _result.then((res) => {
        //             if (res.data.errCode || !res.data.data || res.data.data.length == 0) {
        //                 _self.page--;
        //                 done(true);
        //                 return;
        //             }
        //             _self.loadMore(res.data, done);
        //         });
        //     }, 1500)
        // } else {
        setTimeout(() => {
            done(true);
        }, 100);
        // }
    }
    //加载更多
    loadMore(res, done) {
        let _self = this;
        let _data = { data: [], speedStore: [] };
        let obj = {}, obj2 = {}, ksInvalidLists = [];
        res.data.forEach(item => {
            if (item.commonShopCarts.length) {
                obj = JSON.parse(JSON.stringify(item));
                obj.fastFlag = false;
                obj.shopCarts = item.commonShopCarts;
                _data.speedStore.push(obj);
            }
            if (item.fastShopCarts.length) {
                if (item.ksOpen) {
                    // obj2 = item;
                    obj2 = JSON.parse(JSON.stringify(item));
                    obj2.fastFlag = true;
                    obj2.shopCarts = item.fastShopCarts;
                    _data.data.push(obj2);
                } else {
                    let ksItem = JSON.parse(JSON.stringify(item));
                    ksItem.fastShopCarts.forEach(k => {
                        k.ksOpen = true;
                        ksInvalidLists.push(k);
                    })
                }
            }
        })
        res = _data;
        if (res.data.length == 0 && res.speedStore.length == 0) {
            _self.isEmpty = true;
            _self.$store.state.shopCar.count = 0;
            return;
        }
        let ptps = [], ksps = [];
        let _invalidLists = [];
        res.speedStore.forEach(lists => {
            let list = [], obj = {};
            if (lists.shopCarts && lists.shopCarts.length == 0) {
                return;
            }
            lists.wxShopCheck = false;
            lists.shopCarts.forEach(item => {
                item.check = false;
                if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
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
            ptps.push(lists);
        });
        res.data.forEach(lists => {
            let list = [], obj = {};
            if (lists.shopCarts && lists.shopCarts.length == 0) {
                return;
            }
            lists.wxShopCheck = false;
            lists.shopCarts.forEach(item => {
                item.check = false;
                if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
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
            ksps.push(lists);
        })
        _self.shopCars[1].data.push(...ptps);
        _self.shopCars[0].data.push(...ksps);
        _self.invalidLists.push(..._invalidLists);
        _self.invalidLists.push(...ksInvalidLists);
        _self.qflag = false;
        _self.setNum(_self.shopCars);
        done(true);
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
        if (res.errorCode || res.data.length == 0) {
            _self.isEmpty = true;
            _self.isShow = false;
            _self.$store.state.shopCar.count = 0;
            return;
        }
        let _data = { data: [], speedStore: [] }; //data快速 speedStore普通
        let obj = {}, obj2 = {}, ksInvalidLists = [];//快速失效商品
        res.data.forEach(item => {
            if (item.commonShopCarts.length) {
                obj = JSON.parse(JSON.stringify(item));
                obj.fastFlag = false;
                obj.shopCarts = item.commonShopCarts;
                _data.speedStore.push(obj);
            }

            if (item.fastShopCarts.length) {
                if (item.ksOpen) {
                    // obj2 = item;
                    obj2 = JSON.parse(JSON.stringify(item));
                    obj2.fastFlag = true;
                    obj2.shopCarts = item.fastShopCarts;
                    _data.data.push(obj2);
                } else {
                    let ksItem = JSON.parse(JSON.stringify(item));
                    ksItem.fastShopCarts.forEach(k => {
                        k.ksOpen = true;
                        ksInvalidLists.push(k);
                    })
                }
            }
        })

        res = _data;
        let ptps = [], ksps = [];
        let _invalidLists = [];
        res.speedStore.forEach(lists => {
            let list = [], obj = {};
            if (lists.shopCarts && lists.shopCarts.length == 0) {
                return;
            }
            lists.wxShopCheck = false;
            lists.shopCarts.forEach(item => {
                item.check = false;
                if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
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
            ptps.push(lists);
        });

        res.data.forEach(lists => {
            let list = [], obj = {};
            if (lists.shopCarts && lists.shopCarts.length == 0) {
                return;
            }
            lists.wxShopCheck = false;
            lists.shopCarts.forEach(item => {
                item.check = false;
                if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
                    list.push(item);
                } else {
                    _invalidLists.push(item);
                }
            });
            if (list.length == 0) {
                return;
            }
            lists.data = list;
            if (lists.shopCarts.length) {
                ksps.push(lists);
            }
        });
        let ptft = true, ksft = true;
        for (let i = 0, len = ptps.length; i < len; i++) {
            if (ptps[i].data.length != 0) {
                ptft = false;
                break;
            }
        }
        for (let i = 0, len = ksps.length; i < len; i++) {
            if (ksps[i].data.length != 0) {
                ksft = false;
                break;
            }
        }
        if (!ksft || !ptft) {
            _self.isEmpty = false;
        } else {
            _self.isEmpty = true;
        }
        _self.shopCars[1].data = ptps;
        _self.shopCars[0].data = ksps;
        if (_self.shopCars[1].data.length == 0 && _self.shopCars[0].data.length == 0) {
            _self.isEmpty = true;
            _self.$store.state.shopCar.count = 0;
        }
        _self.setCheck();
        _self.invalidLists = [..._invalidLists, ...ksInvalidLists];
        if (!_self.invalidLists.length) {
            _self.isShow = false;
        } else {
            _self.isShow = true;
        }

        _self.setNum(_self.shopCars);

        _self.qflag = false;
        _self.calTotalMoney();
    }
    //更新本地购物车价格和库存
    async  updateLocalShopcar(shopcartCache) {
        let _self = this;
        let _shopcartCache = shopcartCache.data[0];
        let ksGoodsId = [], ptGoodsId = [], deliveryTypes = [], shopIds = [];
        if (_shopcartCache.commonShopCarts.length) {
            deliveryTypes = [], shopIds = [], ptGoodsId = [];
            _shopcartCache.commonShopCarts.forEach(item => {
                ptGoodsId.push(item.goodsId);
                deliveryTypes.push(0);
                shopIds.push(_shopcartCache.shopId);
            })
            let updptpsPrice = (await this._$service.getGoodsLists(ptGoodsId.join(","))).data;//查询价格
            updptpsPrice.data.forEach((item, i) => {
                if (item) {
                    if (item.state == 1 && item.onSaleState == 1) {
                        item.isSourceGoodsValid = 1;
                        item.isCampusGoodsValid = 1;
                    } else {
                        item.isSourceGoodsValid = 0;
                        item.isCampusGoodsValid = 0;
                    }
                    item.deliveryType = 0;
                    item.number = _shopcartCache.commonShopCarts[i].number;
                    _shopcartCache.commonShopCarts[i] = item;
                }else{
                    _shopcartCache.commonShopCarts[i].isSourceGoodsValid = 0;
                    _shopcartCache.commonShopCarts[i].isCampusGoodsValid = 0;
                }
            })
            let _parms = {
                goodsIds: ptGoodsId.join(","),
                shopIds: shopIds.join(","),
                deliveryTypes: deliveryTypes.join(",")
            }
            let ptStock = (await this._$service.queryStore(_parms)).data;
            ptStock.forEach((item, i) => {
                _shopcartCache.commonShopCarts[i].maxBuyNum = item;
            });
        }
        if (_shopcartCache.fastShopCarts.length) {
            deliveryTypes = [], shopIds = [], ksGoodsId = [];
            _shopcartCache.fastShopCarts.forEach(item => {
                ksGoodsId.push(item.goodsId);
                deliveryTypes.push(1);
                shopIds.push(_shopcartCache.shopId);
            })
            let updptpsPrice = (await this._$service.getGoodsLists(ksGoodsId.join(","))).data;//查询价格
            updptpsPrice.data.forEach((item, i) => {
                if (item) {
                    if (item.state == 1 && item.onSaleState == 1) {
                        item.isSourceGoodsValid = 1;
                        item.isCampusGoodsValid = 1;
                    } else {
                        item.isSourceGoodsValid = 0;
                        item.isCampusGoodsValid = 0;
                    }
                    item.deliveryType = 1;
                    item.number = _shopcartCache.fastShopCarts[i].number;
                    _shopcartCache.fastShopCarts[i] = item;
                }else{
                    _shopcartCache.fastShopCarts[i].isSourceGoodsValid = 0;
                    _shopcartCache.fastShopCarts[i].isCampusGoodsValid = 0;
                }
            })
            let _parms = {
                goodsIds: ksGoodsId.join(","),
                shopIds: shopIds.join(","),
                deliveryTypes: deliveryTypes.join(",")
            }
            let ptStock = (await this._$service.queryStore(_parms)).data;
            ptStock.forEach((item, i) => {
                _shopcartCache.fastShopCarts[i].maxBuyNum = item;
            });
        }
        _self.transferFormat(shopcartCache);
    }
    //本地缓存勾选状态
    cacheCheck() {
        let _self = this;
        let obj = { shopId: "", deliveryType: '', goodsId: [] };
        this.shopCars.forEach(item => {
            item.data.forEach(v => {
                if (v.data.length) {
                    v.data.forEach(j => {
                        if (j.check) {
                            obj.shopId = v.shopId;
                            obj.deliveryType = j.deliveryType;
                            obj.goodsId.push(j.goodsId);
                        }
                    })
                }
            })
        })
        localStorage.setItem("checkState", JSON.stringify(obj));
    }
    //设置选中状态
    setCheck(){
        let checkState = JSON.parse(localStorage.getItem("checkState") || null);
        if (checkState && checkState.deliveryType==1){ //快速
            this.shopCars[0].data.forEach(item=>{
                if (checkState.shopId==item.shopId){
                    let flag = true;
                    item.data.forEach(v => {
                        checkState.goodsId.forEach(j=>{
                            if(v.goodsId==j){
                                v.check = true;
                            }
                        })
                        if(!v.check){
                            flag = false;
                        }
                    })
                    item.wxShopCheck = flag;
                }
               
            })
        } 
        else if (checkState && checkState.deliveryType == 0){
            this.shopCars[1].data.forEach(item => {
                if (checkState.shopId == item.shopId) {
                    let flag = true;
                    item.data.forEach(v => {
                        checkState.goodsId.forEach(j => {
                            if (v.goodsId == j) {
                                v.check = true;
                            }
                        })
                        if (!v.check) {
                            flag = false;
                        }
                    })
                    item.wxShopCheck = flag;
                }
            })
        }
        
    }
    //单选
    onRadio(i, index1, index2) {
        let _self = this;
        let _validLists = _self.shopCars[i].data[index1];
        _validLists.data[index2].check = !_validLists.data[index2].check;
        let flag = true;
        _validLists.data.forEach(item => {
            if (!item.check) {
                flag = false;
            }
        });
        if (this.isEdit) {
            _self.wdRadio(i, index1);
        }
        //  _self.checkLimit(_self.validLists);
        _validLists.wxShopCheck = flag; //店铺全选
        let flag2 = true; //判断是否所有店铺全选
        _self.shopCars.forEach(item => {
            item.data.forEach(v => {
                if (!v.wxShopCheck) {
                    flag2 = false;
                }

            })
        })

        _self.checkAll = flag2;
        _self.calTotalMoney();

    }
    wdRadio(i, index1) {

        if (i == 0) {
            this.shopCars[0].data.forEach((item, index) => {
                if (index != index1) {
                    item.wxShopCheck = false;
                    item.data.forEach(v => {
                        v.check = false;
                    })
                }
            });
            this.shopCars[1].data.forEach((item) => {
                item.wxShopCheck = false;
                item.data.forEach(v => {
                    v.check = false;
                })
            });
        } else {
            this.shopCars[1].data.forEach((item, index) => {
                if (index != index1) {
                    item.wxShopCheck = false;
                    item.data.forEach(v => {
                        v.check = false;
                    })
                }
            });
            this.shopCars[0].data.forEach((item) => {
                item.wxShopCheck = false;
                item.data.forEach(v => {
                    v.check = false;
                })
            });
        }
        this.cacheCheck();
    }

    //店铺商品全选 完成状态下isEdit=false店铺单选
    wxShopCheckAll(i, index1) {
        let _self = this;
        let flag = true;

        if (_self.shopCars[i].data[index1].wxShopCheck) {
            flag = false;
        }
        if (_self.isEdit) {
            if (i == 0) {
                _self.shopCars[0].data.forEach((item, index) => {
                    if (index == index1) {
                        item.wxShopCheck = flag;
                    } else {
                        item.wxShopCheck = false;
                    }
                    item.data.forEach(v => {
                        v.check = item.wxShopCheck;
                    })
                });
                _self.shopCars[1].data.forEach((item, index) => {
                    item.wxShopCheck = false;
                    item.data.forEach(v => {
                        v.check = item.wxShopCheck;
                    })
                })
            } else {
                _self.shopCars[1].data.forEach((item, index) => {
                    if (index == index1) {
                        item.wxShopCheck = flag;
                    } else {
                        item.wxShopCheck = false;
                    }
                    item.data.forEach(v => {
                        v.check = item.wxShopCheck;
                    })
                });
                _self.shopCars[0].data.forEach((item, index) => {
                    item.wxShopCheck = false;
                    item.data.forEach(v => {
                        v.check = item.wxShopCheck;
                    })
                })
            }
             _self.cacheCheck();
        } else {//删除
            _self.shopCars[i].data[index1].wxShopCheck = flag;
            _self.shopCars[i].data[index1].data.forEach(item => {
                item.check = flag;
            })

            let flag2 = true; //判断是否所有店铺全选
            _self.shopCars.forEach(item => {
                item.data.forEach(v => {
                    if (!v.wxShopCheck) {
                        flag2 = false;
                    }
                })
            })
            _self.checkAll = flag2;
        }
        _self.calTotalMoney();
    }
    //全选
    checkAllState(e) {
        let _self = this;
        let flag = true;
        if (_self.checkAll) {
            flag = false;
        }
        _self.shopCars.forEach(item => {
            item.data.forEach(v => {
                v.wxShopCheck = flag;
                v.data.forEach(item => {
                    item.check = flag;
                })
            })
        })
        _self.checkAll = !_self.checkAll;
        _self.calTotalMoney();
    }
    //减
    minus(i, index1, index2) {
        let _validLists = this.shopCars[i].data[index1].data[index2];
        if (_validLists.number <= 1) {
            _validLists.number = 1;
            return;
        }
        _validLists.number--;
        //  this.getCount(i,index1, index2);
        this.recodeCartIds(_validLists.id, _validLists.number);
        this.updateNum(_validLists);
    }
    //加
    add(i, index1, index2, stockNum) {
        let _validLists = this.shopCars[i].data[index1].data[index2];
        _validLists.number++;
        //  this.getCount(index1, index2);
        this.recodeCartIds(_validLists.id, _validLists.number);
        this.updateNum(_validLists);
    }
    //本地更新数量
    updateNum(item) {
        let loginFlag = isNotLogin();//未登录 true
        if (loginFlag) {
            this._shopcartCache.data.forEach(v => {
                if (item.deliveryType == 1) {
                    v.fastShopCarts.forEach(k => {
                        if (k.goodsId == item.goodsId) {
                            k.number = item.number;
                        }
                    })
                } else {
                    v.commonShopCarts.forEach(k => {
                        if (k.goodsId == item.goodsId) {
                            k.number = item.number;
                        }
                    })
                }
            })
            localStorage.setItem("shopcartCache", JSON.stringify(this._shopcartCache));
        }

    }
    //记录id
    recodeCartIds(id, num) {
        let _self = this;
        if (_self.shopCarsIds.length) {
            let findId = false;
            for (let i = 0; i < _self.shopCarsIds.length; i++) {
                if (_self.shopCarsIds[i] == id) {
                    findId = true;
                    _self.numbers[i] = num;
                    break;
                }
            }
            if (!findId) {
                _self.shopCarsIds.push(id);
                _self.numbers.push(num);
            }
        }
        else {
            _self.shopCarsIds.push(id);
            _self.numbers.push(num);
        }
    }
    //修改值
    changeNum(i, index1, index2, stockNum) {
        let _validLists = this.shopCars[i].data[index1].data[index2];
        let isNum = ('' + _validLists.number).indexOf('.');
        console.log(isNum);
        if (!_validLists.number || _validLists.number <= 0 || isNum == 1) {
            _validLists.number = 1;
            let _toast = this.$store.state.$toast;
            _toast({ title: '输入数量不正确', success: false });
            return;
        }
        // this.getCount(index1, index2);
        this.recodeCartIds(_validLists.id, _validLists.number);
        this.updateNum(_validLists);
    }
    //修改购物车数量
    getCount(i, index1, index2) {
        let _validLists = this.shopCars[i].data[index1].data[index2];
        let maxNum = _validLists.maxBuyNum;
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
                shopCartId: _validLists.id,
                num: _validLists.number,
                goodsId: _validLists.goodsId
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
    }
    //计算商品总价
    calTotalMoney() {
        let totalMoney = 0, settlementNum = 0;
        this.shopCars.forEach(lists => {
            lists.data.forEach(item => {
                item.data.forEach(v => {
                    if (v.check) {
                        totalMoney += v.moneyPrice * v.number;//应付价格
                        settlementNum += Number(v.number);
                    }
                })

            })
        })
        this.total = totalMoney;
        this.settlement = settlementNum;
    }
    //购物车编辑
    editShopCar() {
        let _self = this;
        if (this.edit === "编辑") {
            this.edit = "完成";
            this.isEdit = false;
            this.checkAll = false;
            this.shopCars.forEach(item => {
                item.data.forEach(v => {
                    v.wxShopCheck = false;
                    v.data.forEach(item => {
                        item.check = false;
                    })
                })
            })
        } else {
            this.isEdit = true;
            this.edit = "编辑";
            this.shopCars.forEach(item => {
                item.data.forEach(v => {
                    v.wxShopCheck = false;
                    v.data.forEach(item => {
                        item.check = false;
                    })
                })
            })
            this.checkAll = false;
            if (!_self.numbers.length) {
                _self.getShoppcarMsg();
                return;
            }
            let _data = {
                numbers: _self.numbers.join(","),
                shopCartIds: _self.shopCarsIds.join(",")
            }
            this._$service.queryAsyncNum(_data).then(res => {
                if (!res.data.errorCode) {
                    _self.getShoppcarMsg();
                }

            })
            //  this.setGoods();
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
            }
        };
        dialog({ dialogObj });
    }
    //删除购物车选中列表
    delete() {
        let flag = !isNotLogin(); 
        let checkState = JSON.parse(localStorage.getItem("checkState") || null);
        let goodsIdarr = [];
        let _self = this;
        if (!flag) {
             //本地删除购物车
            let shopcartCache = JSON.parse(localStorage.getItem("shopcartCache") || null);
            let ptarr = [], ksarr = [];
            this.shopCars.forEach(item => {
                let list = [];
                if (item.data.length == 0) {
                    return;
                }
                item.data.forEach(v => {
                    if (v.deliveryType == 1) {
                        v.data.forEach(ite => {
                            if (ite.check) {
                                ksarr.push(ite.goodsId);
                            }
                            else {
                                list.push(ite);
                            }
                        })
                    } else {
                        v.data.forEach(ite => {
                            if (ite.check) {
                                ptarr.push(ite.goodsId);
                            }
                            else {
                                list.push(ite);
                            }
                        })
                    }
                    if (list.length) {
                        v.data = list;
                    }
                })
                if (!list.length) {
                    item.data = [];
                }
            })
            let arr1 = [], arr2 = [];
            if (this._shopcartCache.data[0].commonShopCarts.length) {
                this._shopcartCache.data[0].commonShopCarts.forEach(item => {
                    ptarr.forEach(v => {
                        if (v != item.goodsId) {
                            arr1.push(item);
                        }
                    })
                })
                this._shopcartCache.data[0].commonShopCarts = arr1;
            }
            if (this._shopcartCache.data[0].fastShopCarts.length) {
                this._shopcartCache.data[0].fastShopCarts.forEach(item => {
                    ptarr.forEach(v => {
                        if (v != item.goodsId) {
                            arr2.push(item);
                        }
                    })
                })
                this._shopcartCache.data[0].fastShopCarts = arr2;
            }
            if(arr1.length==0&&arr2.length==0){
                localStorage.removeItem("shopcartCache");
            }else{
                localStorage.setItem("shopcartCache", JSON.stringify(this._shopcartCache));
            }
           
            // _self.getShoppcarMsg();
        }
        else {
            let arr = [], shopCartIds = [];
            this.shopCars.forEach(item => {
                if (item.data.length == 0) {
                    return;
                }
                let arr = [];
                item.data.forEach(v => {
                    let list = [];
                    v.data.forEach(ite => {
                        if (ite.check) {
                            shopCartIds.push(ite.id);
                        }
                        else {
                            list.push(ite);
                        }
                    })
                    if (list.length) {
                        v.data = list;
                        arr.push(v);
                    }
                })
                if (arr.length) {
                    item.data = arr;
                } else {
                    item.data = [];
                }

            })

            let opt = {
                shopCartIds: shopCartIds.join(',')
            }
            this._$service.deleteShopcar(opt).then(function (res) {
                if (res.data.errCode) {
                    _self.toast(res.data.msg, false);
                    return;
                }
                _self.setNum(_self.shopCars);
                // _self.getShoppcarMsg();
            })
        }
        if (this.invalidLists.length) {
            _self.isShow = true;
        } else {
            _self.isShow = false;
        }
        _self.deleteCheckStates();
        if (this.shopCars[0].data.length == 0 && this.shopCars[1].data.length == 0) {
            _self.isEmpty = true;
            _self.$store.state.shopCar.count = 0;
            return;
        }
        _self.calTotalMoney();
    }
    deleteCheckStates(){//删除勾选缓存
        let gooosIds=[];
        let checkState = JSON.parse(localStorage.getItem("checkState") || null);
        if (checkState && checkState.deliveryType == 1) { //快速
            this.shopCars[0].data.forEach(item => {
                if (checkState.shopId == item.shopId) {
                    item.data.forEach(v => {
                        checkState.goodsId.forEach(j => {
                            if (v.goodsId == j && !v.check) {
                                gooosIds.push(j);
                            }
                        })
                    })
                }

            })
        }
        else if (checkState && checkState.deliveryType == 0) {
            this.shopCars[1].data.forEach(item => {
                if (checkState.shopId == item.shopId) {
                    item.data.forEach(v => {
                        checkState.goodsId.forEach(j => {
                            if (v.goodsId == j && !v.check) {
                                gooosIds.push(j);
                            }
                        })
                    })
                }
            })
        }
        checkState.goodsId = gooosIds;
        localStorage.setItem("checkState", JSON.stringify(checkState));
    }
    //设置购物车显示数量
    setNum(validLists) {
        let num = 0;
        validLists.forEach(ele => {
            if (ele.data.length == 0) {
                return;
            }
            ele.data.forEach(item => {
                if (item.data.length == 0) {
                    return;
                }
                item.data.forEach(v => {
                    num += Number(v.number);
                })

            })
        });
        this.$store.state.shopCar.count = num;
    }
    //结算是否为同一个校区
    checkSameSchool() {
        let school = '';
        for (const key in this.validLists) {
            if (this.validLists.hasOwnProperty(key)) {
                const item = this.validLists[key];
                if (item.data[0].check) {
                    if (school) {
                        console.log(99, school, item.school)
                        if (school != item.school) {
                            return false;
                        }
                    } else {
                        school = item.school;
                    }
                }
            }
        }
        return true;
    }
    //结算
    onSettle() {
        let flag = !isNotLogin();//判断用户有缓存登录
        let dialog = this.$store.state.$dialog;
        let _self = this;
        let cartId = [];
        let fastFlag = "";
        //多校区订单检测
        // if (!_self.checkSameSchool()) {
        //     let dialogObj = {
        //         title: '提示',
        //         content: '多校区订单不能同时提交，请按单校区提交订单！',
        //         assistBtn: '',
        //         mainBtn: '确定',
        //         type: 'info',
        //         assistFn() {
        //         },
        //         mainFn() {
        //         }
        //     };
        //     dialog({ dialogObj });
        //     return;
        // }

        if (this.settlement == 0) {
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
        let checkStock = false;
        this.shopCars.forEach(lists => {
            lists.data.forEach(item => {
                item.data.forEach(v => {
                    if (v.check) {
                        cartId.push(v.id);
                        fastFlag = item.fastFlag;
                        if (!checkStock && v.number > v.maxBuyNum) {
                            checkStock = true;
                        }
                    }
                })
            })

        });
        if (checkStock) {
            let dialogObj = {
                title: '提示',
                content: '部分商品库存不足！',
                assistBtn: '',
                mainBtn: '确定',
                type: 'info',
                assistFn() { },
                mainFn() {
                }
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

        this.$router.push({ path: 'order_submit', query: { cartId: cartId.join(','), orderSrouce: 'car', fastFlag: fastFlag } });
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
                _self.clearShopcar();
            }
        };
        dialog({ dialogObj });
    }
    //清空失效商品
    clearShopcar() {
        let loginFlag = isNotLogin();
        let _self = this
        if (loginFlag) {
            let ksGoodsId = [], ptGoodsId = [];
            _self.invalidLists.forEach(ele => {
                if (ele.deliveryType == 0) {
                    ptGoodsId.push(ele.goodsId);
                } else {
                    ksGoodsId.push(ele.goodsId);
                }
            });
            let shopcartCache = JSON.parse(localStorage.getItem("shopcartCache") || null);
            let arr1 = [], arr2 = [];
            shopcartCache.data[0].commonShopCarts.forEach(item => {
                ptGoodsId.forEach(v => {
                    if (v != item.goodsId) {
                        arr1.push(item);
                    }
                })
            })
            shopcartCache.data[0].commonShopCarts = arr1;
            shopcartCache.data[0].fastShopCarts.forEach(item => {
                ksGoodsId.forEach(v => {
                    if (v != item.goodsId) {
                        arr2.push(item);
                    }
                })
            })
            shopcartCache.data[0].fastShopCarts = arr2;
            _self.invalidLists = [];
            _self.isShow = false;
            if (arr1.length == 0 && arr2.length == 0) {
                localStorage.removeItem("shopcartCache");
            } else {
                localStorage.setItem("shopcartCache", JSON.stringify(shopcartCache));
            }

        } else {
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
    }
    joinCar(item) {
        finishToCar(this.$store).finishToCar(this, item, "shop_car", item.warehouseFlag, this.getShoppcarMsg);
    }
    toDetaile(item){
        this.$router.push({ path: 'goods_detail', query: { goodsId: item.goodsId, isAgent: item.warehouseFlag == 1} });
    }
    //报错
    toast(content, boolean) {
        let _toast = this.$store.state.$toast;
        _toast({ title: content, success: boolean });
    }

    goWdShop(infoId) {
        this.$router.push({ path: 'home', query: { shopId: infoId } });
    }
    goCouponList(infoId) {
        this.$router.push({ path: 'mask_coupon', query: { shopId: infoId } });
    }
}
