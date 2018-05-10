import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import searchService from './search.service';
import { GoodsList } from '../goods_list/goods_list';
import { debounce,find } from 'lodash';
import shopCarService from '../../public/shopcar.service';
import { ShelvesShopCar } from '../shelves/shopcar/shopcar';
import './search.scss';

@Component({
    template: require('./search.html'), components: { "list-goods": GoodsList },
    components: {
        'shelves-shopcar': ShelvesShopCar
    }
})


export class Search extends BaseVue {
    ipt_search = '';
    frm_push = false;
    data_hot = [];
    data_history = [];
    data_keyword = [];
    data_goods = { 'data': [] };

    search_page = 0;
    search_limit = 10;

    search_flag = true;
    _$service;
    _$shopCarService;

    shopcarOpts = {
        list: [],
        countTotal: 0,
        totalPrice: 0,
        leastMoney:0,
    };
    carmap = {};

    created() {

    }

    mounted() {
        //注册服务
        this._$service = searchService(this.$store);
        this._$shopCarService = shopCarService(this.$store);
        this._toast = this.$store.state.$toast;
        this.$nextTick(() => {
            this.initPage()
        })
    }

    initPage() {
        let _self = this;
        //输入框的改变
        let _change = debounce(function () {
            if (_self.ipt_format === '') {
                _self.data_keyword = [];
                _self.data_history = _self._$service.getShowHistory();
                return;
            }
            _self._$service.getKeyWord_list(_self.ipt_format).then((res) => {
                _self.data_keyword = res.data.suggest;
            });
        }, 500);
        this.$watch('ipt_search', () => {
            _change();
        });
        //监听路由变化
        this.$watch('$route', () => {
            this.initSearch();
        });
        //获取热门搜索以及搜索历史
        this._$service.getKeyWord_hot().then((res) => {
            this.data_hot = res.data.data;
        });
        this.data_history = this._$service.getShowHistory();
        //初始化
        this.initSearch();
        this.initShopCarInfo();
        this.queryCarGoodsList();
    }

    //初始化搜索
    initSearch() {
        //init
        this.ipt_search = '';
        //ipt-search失焦 去除上一次的聚焦
        document.getElementById('ipt-search').blur();
        // 检查是否为搜索结果
        let search = this.$route.query.search || '';
        if (search) {
            this.ipt_search = search;
            //saerch ...
            this.search_init(null);
            this.frm_push = true;
            //保存到历史记录
           // this._$service.setHistory(this.ipt_format);
        } else {
            //初始化输入框聚焦
            document.getElementById('ipt-search').focus();
            this.frm_push = false;
        }
    }

    initShopCarInfo(){
        let _self = this;
        let _params = {
            infoId : this.$store.state.workVO.user.userId,
        }
        this._$shopCarService.queryStockLimit(_params)
        .then(res=>{
            let _result = res.data;
            if (_result && !_result.errorCode) {
                _self.shopcarOpts.leastMoney = _result.leastBuy;
            }
        })
    }

    async addGoods2Car(goods){
        let _result = (await this.$store.dispatch('ADD_GOODS_TO_CAR', { goodsId: goods.goodsId, number: 1 })).data;
        if (!_result || _result.errorCode) {
            this._toast({ success: false, title: _result.msg });
            // callBack();
            this.removeGoodsInAllGoodsList(goods);
            return;
        }
        if (!_result.amount) {
            goods.amount = 0;
            this._toast({ success: false, title: '库存不足，加入失败！' });
            return;
        }
        goods.id = _result.id;
        let diffNum = _result.amount - _result.oldNumber;
        if (diffNum <= 0) {
            this._toast({ success: false, title: '库存达到上限！' });
        } else {
            diffNum = 1;
            this._toast({ success: true, title: '加入成功！' });
        }
        goods.amount = _result.amount;
        if (isNaN(+(goods.maxBuyNum + ''))) {
            goods.maxBuyNum = goods.amount;
        }
        let _item = find(this.shopcarOpts.list, { goodsId: goods.goodsId });
        if (_item) {
            _item.__number += diffNum;
        } else {
            goods.__number = diffNum;
            _item = goods;
            this.shopcarOpts.list.push(goods);
        }
        this.shopcarOpts.countTotal += diffNum;
        this.shopcarOpts.totalPrice += diffNum * goods.stockPrice;
        // 缓存 加入购物车的商品数量
        let _map = this.carmap[goods.goodsId];
        if (_map) {
            _map.number++;
        } else {
            this.$set(this.carmap, goods.goodsId, { number: diffNum });
        }
    }

    //结算订单
    settlementCar(){
        let _cartId = [];
        if (this.accordWithBalance()) {
            this.shopcarOpts.list.forEach((ele)=>{
                _cartId.push(ele.id);
            });
            this.$router.push({ path: 'cms_purchase_submit_order', query: { cartId: _cartId.join(','), orderSrouce: 'car', stockType: 1 } });
        }
    }

    //输入框文字格式化
    get ipt_format() {
        return this.ipt_search.replace(/\s+/g, ' ').trim();
    }

    //输入框聚焦
    ipt_focus() {
        this.frm_push && (this.frm_push = false);
    }

    //输入表单提交
    frm_submit() {
        let search = this.ipt_format;
        //判断数据有效
        if (search) {
            // hash  =>  解决相同路由相同参数连续查询
            let hash = this.$route.query.hash;
            // '==' for undefined
            hash = (hash == '1' ? '0' : '1');
            let origin = this.$route.query.origin || 'cms_goods_shelves';
            let query = { search: search, origin: origin, hash: hash };
            //第一次打开搜索 跳转记录url
            if (this.$route.query.search) {
                setTimeout(() => {
                    this.$router.replace({ path: 'cms_purchase_search', query: query });
                }, 100);
            } else {
                setTimeout(() => {
                    this.$router.push({ path: 'cms_purchase_search', query: query });
                }, 100);
               
            }
        }
        event.preventDefault();
        window.event.returnValue = false;
        return false;
    }

    //搜索栏按钮提交
    btn_click() {
        if (this.frm_push) {
            // origin
            this.$router.push({ path:'cms_goods_shelves' });
            event.preventDefault();
            window.event.returnValue = false;
            return false;
        }
    }

    //热搜,历史,关键词等点击
    word_click(e) {
        this.ipt_search = e.target.innerText;
        this.frm_submit();
    }

    //删除/清空历史记录
    delKeyWord(e) {
        let res = this._$service.delHistory(e.target);
        if (res) {
            res.then(() => {
                //update
                this.data_history = this._$service.getShowHistory();
            });
        } else {
            this.data_history = this._$service.getShowHistory();
        }
    }

    //清除关键字
    clearKeyWord() {
        this.ipt_search = '';
        document.getElementById('ipt-search').focus();
    }

    //初始化搜索结果  在提交关键词和下拉刷新时
    search_init(callBack) {
        //TODO page=0
        this.search_page = 0;
        this.search_flag = true;
        this.search_next(callBack);
    }

    //得到下一页搜索结果
    search_next(callBack) {
        let _self = this;
        //TODO page++ and  showpage
        this.search_page++;
        this._$service.getGoods(this.ipt_format, this.search_page, this.search_limit,0).then((res) => {
            res = res.data;
            if (res.errorCode) {
                return;
            }
            if (_self.ipt_format&& _self.search_page==1){
                //保存到历史记录
                _self._$service.setHistory(_self.ipt_format);
                _self.data_goods = { 'data': res.agent };
            }else{
                _self.data_goods.data.push.apply(_self.data_goods.data, res.agent);
            }
            //检查是否有下一页
            _self.search_flag = res && (_self.search_limit == res.agent.length);
            callBack && callBack();
        });
        return true;
    }

    //刷新
    refresh(done) {
        setTimeout(() => {
            this.search_init(done());
        }, 500)
    }

    //加载
    infinite(done) {
        let _self = this;
        if (this.search_flag) {
            setTimeout(() => {
                _self.search_next(done(false));
            }, 500)
        } else {
            done(true);
        }
    }
    joinCar(item) {
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
            _toast({ title: '加入进货单成功'});
        })
    }

    viewShopCar() {
        this.$refs.shelvesShopcarRef.showContent();
    }

    toGoodsDetail(goodsId) {
        this.$router.push({
            path: 'cms_purchase_goods_detail',
            query: {
                goodsId: goodsId,
            }
        });
    }

    accordWithBalance() {
        return this.shopcarOpts.list.length && this.shopcarOpts.totalPrice - this.shopcarOpts.leastMoney >= 0;
    }

    cleanCar() {
        this.carmap = {};
    }

    queryCarGoodsList(callBack = () => { }) {
        return this.$store.dispatch('QUERY_SHOP_CAR').then((_list) => {
            let _countTotal = 0;
            let _totalPrice = 0;
            let _newList = [];
            let _delIds = [];
            let _delNames = [];
            let _updList = [];
            for (let i = 0, len = _list.length; i < len; i++) {
                let _item = _list[i];
                if (_item.amount) {
                    // 库存减少时  修改 已选择数量
                    if (_item.number > _item.amount) {
                        _item.number = _item.amount;
                        _updList.push(_item);
                        continue;
                    }
                } else {
                    // 库存不足 不同添加本地购物车
                    _delIds.push(_item.id);
                    _delNames.push(_item.goodsName);
                    continue;
                }
                _item.__number = _item.number;
                _countTotal += _item.__number;
                _totalPrice += _item.__number * _item.moneyPrice;
                this.carmap[_item.goodsId] = { number: _item.number };
                _newList.push(_item);
            }
            this.shopcarOpts.countTotal = _countTotal;
            this.shopcarOpts.totalPrice = _totalPrice;
            this.shopcarOpts.list = _newList;
            if (_delIds.length) {
                let _names =_delNames.join(',');
                let dialogObj = {
                    title: '提示',
                    type: 'info',
                    content: `商品${_names}已下架，商品${_names}仓库库存不足，并已从进货单清除！`,
                    mainBtn: '我知道啦',
                    mainFn() {}
                };
                this.$store.state.$dialog({ dialogObj });
                // 删除不足的购物车
                this.$store.dispatch('CLEAN_SHOP_CAR', { wholeShopCartIds: _delIds.join(',') });
            }
            if (_updList.lengths) {
                // 修改 购物车数量
                this.$store.dispatch('BACTH_UPD_GOODS_NUMBER_IN_CAR', _updList);
            }
            callBack();
        });
    }
}
