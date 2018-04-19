/**
 * 我的优惠券 二维码
 */
import { Component } from 'vue-property-decorator';
import { toWEB } from 'common.env';
import BaseVue from 'base.vue';
import service from './coupon.detail.service';
import { CouponItem } from '../item/coupon.item';
import './coupon.detail.scss';

@Component({
    template: require('./coupon.detail.html'),
    components: {
		ci: CouponItem,
	}
})

export class CmsCouponDetail extends BaseVue {
    _$service;
    page = 1;
    limit = 10;
    shareData = null;
    coupon = {};
    goods = [];
    couponId;
    over = false;

    mounted() {
        let _self = this;
        _self._$service = service(_self.$store);
        _self.couponId = _self.$route.query.couponId;
        this.$nextTick(() => {
            document.title = '进货券商品';
            _self.queryCoupon();
        });
    }

    async queryCoupon() {
        let _self = this;
        let query = {
            couponId: _self.couponId,
            infoId: _self.$store.state.workVO.user.userId,
        }
        let result = await _self._$service.queryCoupon(query);
        _self.coupon = result.data.data;
        if(_self.coupon.valid == 1){
            _self.coupon.valid = null;
        }
        this.fetchFirstPageData();
    }

    async fetchFirstPageData(){
        let query = {
            page: 1,
            limit: this.limit,
            couponId: this.couponId,
            infoId: this.$store.state.workVO.user.userId,
        }
        let result = await this._$service.getGoodsList(query);
        if(!result.errorCode){
            if(result.data.length < this.limit){
                this.over = true;
            }
            this.goods = result.data.data;
            this.page = 1;
        }
    }

    async refresh(done) {
        let _self = this;
        _self.page = 1;
        _self.over = false;
        let query = {
            page: _self.page++,
            limit: _self.limit,
            couponId: _self.couponId,
            infoId: _self.$store.state.workVO.user.userId,
        }
        let result = await _self._$service.getGoodsList(query);
        result = result.data;
        setTimeout(() => {
            if(!result.errorCode){
                if(result.data.length < _self.limit){
                    _self.over = true;
                }
                _self.goods = result.data;
            }
            done(true);
        }, 300);
    }



    async infinite(done) {
        let _self = this;
        if(_self.over){
            done(true);
            return;
        }
        let query = {
            page: this.page + 1,
            limit: _self.limit,
            couponId: _self.couponId,
            infoId: _self.$store.state.workVO.user.userId,
        }
        let result = await _self._$service.getGoodsList(query);
        result = result.data;
        if(!result.errorCode){
            if(result.data.length < _self.limit){
                _self.over = true;
            }else{
                this.page ++;
            }
            _self.goods.push(...result.data);
        }
        done(true);
    }

    /**
     * 跳转到店长自己店铺的商品详情
     */
    toGoodsDetail(goodsId) {
        this.$router.push({path:'cms_purchase_goods_detail',query:{goodsId:goodsId}})
    }

    expiryDate(){
        if (this.coupon.expiryDate){
            return '有效期:至' + this.coupon.expiryDate;
        }else{
            return '有效期: 领取后' + this.coupon.validTimeDay + '天内有效';
        }
    }
}