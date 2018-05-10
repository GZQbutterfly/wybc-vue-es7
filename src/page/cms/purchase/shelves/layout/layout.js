import { Component, Vue, Watch } from 'vue-property-decorator';
import { find, debounce, remove, merge, findIndex } from 'lodash';
import { timeout, clientEnv } from 'common.env';


import { ScrollTab, ScrollTabPanel } from 'components/scrolltab';

import { ShelvesItem } from '../item/item';
import { ShelvesShopCar } from '../shopcar/shopcar';


import service from '../shelves.service';

import './layout.scss';
@Component({
    template: require('./layout.html'),
    components: {
        'scroll-tab': ScrollTab,
        'scroll-tab-panel': ScrollTabPanel,
        'shelves-item': ShelvesItem,
        'shelves-shopcar': ShelvesShopCar
    }
})
export class ShelvesLayout extends Vue {
    list = [];
    currentIndex = -1;
    shopkeeper = {
        wdName: "学惠精选官方商城",
        wdImg: "/static/images/newshop/xuehui-fang.png",
        id: 0
    };

    shopcarOpts = {
        list: [],
        countTotal: 0,
        totalPrice: 0,
        leastMoney: 0
    };

    _$service;
    _toast;

    mounted() {

        document.title = '我要进货';

        this._$service = service(this.$store);
        this._toast = this.$store.state.$toast;

        this.$nextTick(() => {
            this.initPage();
        });

        this.containerRef = this.$refs.containerRef;

    }


    initPage() {

        this.queryClassyfyList().then(() => {
            this.queryClassifyGoodsList();
        });

        this.queryLeastBuyMoney();

        this.queryGoodsCounpon();

        let _query = this.$route.query;
        this.queryCarGoodsList().then(() => {
            if (_query.from == 'my_inventory_list') {
                this.viewShopCar();
            }
        });

    }

    queryLeastBuyMoney() {
        let _self = this;
        _self._$service.queryLeastBuyMoney().then((res) => {
            let _result = res.data;
            if (!_result || _result.errorCode) {
                return;
            }
            _self.isFirst = _result.flag;
            _self.shopcarOpts.leastMoney = _result.leastBuy;
        });
    }

    queryClassyfyList() {
        return this._$service.queryClassyfyList({ isUser: 2 }).then((res) => {
            let _result = res.data;
            if (!_result || _result.errorCode || !_result.data || !_result.data.length) {
                return;
            }
            let _list = _result.data;
            let _newList = [];
            for (let i = 0, len = _list.length; i < len; i++) {
                let _item = _list[i];
                _newList.push({ label: _item.classifyName, itemid: _item.goodsClassifyId, create: false, list: [] });
            }
            _newList[0].create = true;
            this.list = _newList;
        });
    }

    showClassify = false;
    queryClassifyGoodsList() {
        this._$service.queryClassifyGoodsList().then((res) => {
            let _result = res.data;
            if (!_result || _result.errorCode || !_result.classify || !_result.classify.length) {
                return;
            }
            let _classifyList = _result.classify;
            for (let i = 0, len = _classifyList.length; i < len; i++) {
                let _classify = _classifyList[i];
                let _item = find(this.list, { itemid: _classify.goodsClassifyId });
                if (_item) {
                    let _glen = _classify.goodsList.length;
                    if (_glen) {
                        _item.list = _classify.goodsList;
                    } else {
                        remove(this.list, { itemid: _classify.goodsClassifyId });
                    }
                }
            }
        }).then(() => {
            // this.$refs.shelvesShopcarRef.init();
            this.showClassify = true;
        });
    }

    counponObj = {};
    queryGoodsCounpon() {
        this._$service.queryGoodsCounpon().then((res) => {
            let _result = res.data;
            if (!_result || _result.errorCode || !_result.coupon) {
                return;
            }
            this.counponObj = _result.coupon;
            this.counponObj.count = _result.count;
        });
    }

    change(index) {
        // console.log('Scroll tab :', index);
    }

    removeGoodsInAllGoodsList(item) {
        let _list = this.list;
        for (let i = 0, len = _list.length; i < len; i++) {
            let _itemList = _list[i].list;
            let _index = findIndex(_itemList, { goodsId: item.goodsId });
            if (_index > -1) {
                _itemList.splice(_index, 1);
            }
        }
    }

    async inCar(item, callBack = () => { }) {
        let _result = (await this.$store.dispatch('ADD_GOODS_TO_CAR', { goodsId: item.goodsId, number: 1 })).data;
        if (!_result || _result.errorCode) {
            this._toast({ success: false, title: _result.msg });
            if (/146/.test(_result.errorCode)) {
                // 商品已下架， 移除页面 goods
                this.removeGoodsInAllGoodsList(item);
                this.$refs.scrolltabRef.refreshItemHeight();
            }
            return;
        }
        if (!_result.amount) {
            item.amount = 0;
            this._toast({ success: false, title: '库存不足，加入失败！' });
            return;
        }
        item.id = _result.id;
        let diffNum = _result.amount - _result.oldNumber;
        if (diffNum <= 0) {
            this._toast({ success: false, title: '库存达到上限！' });
        } else {
            diffNum = 1;
            this._toast({ success: true, title: '加入成功！' });
        }
        item.amount = _result.amount;
        if (isNaN(+(item.maxBuyNum + ''))) {
            item.maxBuyNum = item.amount;
        }
        let _item = find(this.shopcarOpts.list, { goodsId: item.goodsId });
        if (_item) {
            _item.__number += diffNum;
        } else {
            item.__number = diffNum;
            _item = item;
            this.shopcarOpts.list.push(item);
        }
        this.shopcarOpts.countTotal += diffNum;
        this.shopcarOpts.totalPrice += diffNum * item.stockPrice;
        // 缓存 加入购物车的商品数量
        let _map = this.carmap[item.goodsId];
        if (_map) {
            _map.number++;
        } else {
            this.$set(this.carmap, item.goodsId, { number: diffNum });
        }
    }

    carmap = {};
    queryCarGoodsList(callBack = () => { }) {
        return this.$store.dispatch('QUERY_SHOP_CAR').then((_list) => {
            let _countTotal = 0;
            let _totalPrice = 0;
            let _newList = [];
            let _updList = [];
            let _updNames = [];
            let _delNames = [];
            let _delIds = [];
            this.carmap = {};
            for (let i = 0, len = _list.length; i < len; i++) {
                let _item = _list[i];
                if (!_item.amount) {
                    // 库存不足时  移除购物中该商品
                    _delIds.push(_item.id);
                    _delNames.push(_item.goodsName);
                } else if (_item.number > _item.amount) {
                    // 库存减少时  修改 已选择数量
                    _item.number = _item.amount;
                    _updList.push(_item);
                    _updNames.push(_item);
                } else {
                    _item.__number = _item.number;
                    _countTotal += _item.__number;
                    _totalPrice += _item.__number * _item.moneyPrice;
                    this.carmap[_item.goodsId] = { number: _item.number };
                    _newList.push(_item);
                }
            }

            this.shopcarOpts.countTotal = _countTotal;
            this.shopcarOpts.totalPrice = _totalPrice;
            this.shopcarOpts.list = _newList;
            let msg = '';
            if (_list.deleteGoods.length) {
                msg += `商品${_list.deleteGoods.join(',')}已下架，已从进货单清除！`;
            }
            if (_delIds.length) {
                msg += `商品${_delNames.join(',')}仓库库存不足，已从进货单清除！`;
                // 修改 购物车数量
                this.$store.dispatch('CLEAN_SHOP_CAR', { wholeShopCartIds: _delIds.join(',') });
            }
            if (_updList.length) {
                msg += `商品${_updNames.join(',')}仓库库存不足，并修改了进货单数据！`;
                // 修改 购物车数量
                this.$store.dispatch('BACTH_UPD_GOODS_NUMBER_IN_CAR', _updList);
            }
            if (msg) {
                let dialogObj = {
                    title: '提示',
                    type: 'info',
                    content: msg,
                    mainBtn: '我知道啦',
                    mainFn() { }
                };
                this.$store.state.$dialog({ dialogObj });
            }
            callBack();
        });
    }


    diffLeastMoney() {
        return this.shopcarOpts.list.length && this.shopcarOpts.leastMoney - this.shopcarOpts.totalPrice > 0;
    }

    toSearch() {
        this.goRoute('cms_purchase_search');
    }

    viewShopCar() {
        this.$refs.shelvesShopcarRef.showContent();
    }

    showShopCar = false;
    triggerCar(flag) {
        if (clientEnv.ios) {
            console.log('show shopcar: ', flag);
            this.showShopCar = flag;
        }
    }

    balanceCar() {
        this.accordWithBalance() && this.$refs.shelvesShopcarRef.balanceCar();
    }
    accordWithBalance() {
        return this.shopcarOpts.list.length && this.shopcarOpts.totalPrice - this.shopcarOpts.leastMoney >= 0;
    }

    toDetail(item) {
        this.goRoute('cms_purchase_goods_detail', { goodsId: item.goodsId });
    }

    goRoute(path, query) {
        this.scrollTop = this.getScrollView().scrollTop;
        this.$router.push({ path, query });
    }

    _scrollView;
    scrollTop = 0;
    getScrollView() {
        return this._scrollView || (this._scrollView = this.$refs.scrolltabRef.scrollView);
    }

    leavDeActive = false;
    activated() {
        document.title = '我要进货';
        this.scrollTop && (this.getScrollView().scrollTop = this.scrollTop);
        this.leavDeActive && this.queryCarGoodsList();
    }

    deactivated() {
        this.leavDeActive = true;
    }

    cleanCar() {
        this.carmap = {};
    }

    // 禁止touchmove
    noTouchMove(e) {
        e.preventDefault();
        return false;
    }


}