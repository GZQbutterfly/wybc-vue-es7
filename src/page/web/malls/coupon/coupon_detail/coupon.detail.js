/**
 * 我的优惠券 二维码
 */
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './coupon.detail.service';
import './coupon.detail.scss';

@Component({
    template: require('./coupon.detail.html'),
})

export class MyCouponDetail extends BaseVue {
    _$service;
    page = 1;
    limit = 10;
    shareData = null;
    coupon = {};
    goods = [];
    couponId;

    mounted() {
        let _self = this;
        _self._$service = service(_self.$store);
        _self.couponId = _self.$route.query.couponId;
        this.$nextTick(() => {
            document.title = '优惠券明细';
            _self.queryCoupon();
        });
    }

    async queryCoupon() {
        let _self = this;
        let _infoId = _self.$route.query.shopId;
        if (!_infoId) {
            _infoId = -1;
        }
        let query = {
            couponId: _self.couponId,
            infoId: _infoId
        }
        let result = await _self._$service.queryCoupon(query);
        _self.coupon = result.data.data;
    }

    async refresh(done) {
        let _self = this;
        _self.page = 1;
        _self.over = false;
        let _infoId = _self.$route.query.shopId;
        if (!_infoId) {
            _infoId = (await  this.$store.dispatch('CHECK_WD_INFO')).infoId;
        }
        let query = {
            page: _self.page++,
            limit: _self.limit,
            couponId: _self.couponId,
            infoId: _infoId
        }
        let result = await _self._$service.getGoodsList(query);
        setTimeout(() => {
            result = result.data;
            if (!result.errorCode) {
                if (result.data.length < _self.limit) {
                    _self.over = true;
                }
                _self.goods = result.data;
            }

            done(true);
        }, 300);

    }

    async infinite(done) {
        let _self = this;
        if (_self.over) {
            done(true);
            return;
        }
        let _infoId = _self.$route.query.shopId;
        if (!_infoId) {
            _infoId = (await this.$store.dispatch('CHECK_WD_INFO')).infoId;
        }
        let query = {
            page: _self.page++,
            limit: _self.limit,
            couponId: _self.couponId,
            infoId: _infoId
        }
        let result = await _self._$service.getGoodsList(query);
        setTimeout(() => {
            result = result.data;
            if (!result.errorCode) {
                if (result.data.length < _self.limit) {
                    _self.over = true;
                }
                _self.goods.push(...result.data);
            }
            done(true);
        }, 300);
      
    }

    /**
     * 跳转到店长自己店铺的商品详情
     */
    async toGoodsDetail(goods) {
        // debugger;
        let _shopId = this.$route.query.shopId;
        if (_shopId==null) {
            _shopId = (await this.$store.dispatch('CHECK_WD_INFO')).infoId;
        }
        let query = {
            goodsId: goods.goodsId,
            shopId: _shopId
        }
        this.$router.push({ path: 'goods_detail', query });
    }
}