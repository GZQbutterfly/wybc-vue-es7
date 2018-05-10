/**
 * 金币购
 */

import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './buy.service';
// import { GoodsList } from '../../goods_list/goods_list';
import './buy.scss';

@Component({
    template: require('./buy.html'),
    // components: {
    //     "list-goods": GoodsList
    // }
})

export class MoneyGoldBuy extends BaseVue {
    shopkeeper = {};
    bannerList = [];
    goodsList = [];
    shopId = '';
    _shop;
    _$service;
    page = 0;
    limit = 10;

    mounted() {
        this._$service = service(this.$store);
        this.$nextTick(() => {
            document.title = '金币购';
            this.serWxShareConfig();
            this.initPage();
        });
    }

    serWxShareConfig() {
        let _self = this;
        _self.fetchShopData().then((res) => {
            let config = {
                title: '学惠精选,金币换购超值特惠中!',
                link: location.origin + '/money_gold_buy?shopId=' + res.infoId,
                desc: '小金币大作用,金币直接抵现,快来选购吧!',
                imgUrl: 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_dz.jpg',
            }
            _self.updateWxShare(config);
        });
    }

    async initPage() {
        await this.setShop();
        this.queryBannerList();
    }

    async setShop() {
        this._shop = await this.$store.dispatch('CHECK_WD_INFO');
    }



    queryBannerList() {
        this._$service.queryHomeBannerList(this._shop.infoId).then((res) => {
            let _result = res.data;
            if (!_result.errorCode) {
                let _newList = [];
                _result.data.forEach((item) => {
                    item.url = item.imgUrl;
                    _newList.push(item);
                });
                this.bannerList = _newList;
            }
        });
    }

    queryGoodsInit() {
        this.page = 0;
        return this.queryGoodsNext();
    }

    async queryGoodsNext() {
        this.page++;
        let data = {
            page: this.page,
            limit: this.limit,
            campusId: this._shop.campusId
        };
        let _result = (await this._$service.queryGoodsList(data)).data;
        let _datas = [];
        if (_result && !_result.errorCode) {
            _datas = _result.data;
        }
        if (!_datas.length) {
            this.page--;
        }
        return _datas;
    }

    setGoodsList(datas, flag) {
        (flag ? (this.goodsList = datas) : (this.goodsList.push(...datas)));
    }


    // 下拉刷新
    refresh(done) {
        this.queryBannerList();

        let _result = this.queryGoodsInit();

        setTimeout(() => {

            _result.then((datas) => {
                this.setGoodsList(datas, true);
                done(true);
            });

        }, 500);

    }

    // 上拉加载
    infinite(done) {
        let _result = this.queryGoodsNext();
        setTimeout(() => {

            _result.then((datas) => {
                this.setGoodsList(datas);
                done(true);
            });

        }, 300);
    }

    toGoodsDetail(goods) {
        this.$router.push({ path: 'goods_detail', query: { goodsId: goods.goodsId, from: 'money_gold_buy' } });
    }

}