// 我的库存
import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import InventoryListService from './inventory.list.service';
import MultiTab from '../../../../../commons/vue_plugins/components/multitab/multitab.vue';
import { getLocalUserInfo } from 'common.env';

import './inventory.list.scss';
@Component({
    template: require('./inventory.list.html'),
    components: {
        multitab: MultiTab
    }
})

export class MyInventoryList extends BaseVue {

    goodsPage = 0;

    //界面上显示的商品数据
    goodsData = [];

    _$service;

    tabIndex = 0;

    status = 0;

    limit = 10;

    shopCarCount = 0;

    mounted() {
        //注册服务
        this._$service = InventoryListService(this.$store);
        this.$nextTick(() => {
            document.title = "我的库存";
            this.initPage();
        });
    }

    initPage() {
        this.$store.dispatch('QUERY_SHOP_CAR').then((list) => {
            let _countTotal = 0;
            for (let i = 0, len = list.length; i < len; i++) {
                let _item = list[i];
                _countTotal += _item.number;
            }
            this.shopCarCount = _countTotal;
        });
    }
    toShopcar() {
        event.stopPropagation();
        this.$router.push({ path: "cms_goods_shelves", query: { from: 'my_inventory_list' } });
    }
    /**
     * 跳转到商品详情
     */
    goGoods(goodsId) {
        this.$router.push({
            path: 'cms_purchase_goods_detail',
            query: {
                goodsId: goodsId
            }
        })
        event.stopPropagation();
    }

    /**
     * 跳转到库存详情
     */
    goDetail(goodsId) {
        this.$router.push({
            path: 'my_inventory_detail',
            query: {
                goodsId: goodsId
            }
        })
    }

    goGoodsDetail(goodsId) {
        this.$router.push({
            path: 'cms_purchase_goods_detail',
            query: {
                goodsId: goodsId,
            }
        });
    }

    fetchData(index, page, done = null) {
        let _self = this;
        this._$service.queryStockList({ ownStore: index, page: page, limit: this.limit }).then((res) => {
            let _result = res.data;
            if (!_result || _result.errorCode || _result.data.length == 0) {
                done && done(true);
            } else {
                if (page == 1) {
                    _self.goodsData = _result.data;
                } else {
                    _self.goodsData = _self.goodsData.concat(_result.data);
                }
                if (_result.data && _result.data.length > 0) {
                    _self.goodsPage = page;
                }
                done && done(false);
            }
        }).catch(() => {
            done && done(true);
        });
    }
    /**
     * 下拉刷新
     */
    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.fetchData(1, 1, done);
            _self.status = 1 - _self.status;
        }, 500);
    }

    /**
     * 上拉加载
     */
    infinite(done) {
        let _self = this;
        setTimeout(() => {
            _self.fetchData(1, _self.goodsPage + 1, done);
        }, 500);
    }

    /**
   * 加入进货单
   */
    joinCar(goodsId) {
        let _self = this;
        let opt = {
            goodsId: goodsId,
            number: 1
        };
        let _toast = _self.$store.state.$toast;
        this._$service.addGoods(opt).then(res => {
            if (res.data.errorCode) {
                _toast({ title: res.data.msg, success: false });
                return;
            }
            _toast({ title: '加入进货单成功' });
            _self.shopCarCount++;
        })
        event.stopPropagation();
    }
}