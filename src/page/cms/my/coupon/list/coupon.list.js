/**
 * 我的优惠券 列表
 */
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './coupon.list.service';
import { CouponItem } from '../item/coupon.item';
import { CouponShare } from '../share/coupon.share';
// import { CouponTempl } from '../templ/templ';


import './coupon.list.scss';
@Component({
    template: require('./coupon.list.html'),
    components: {
        ci: CouponItem,
        cs: CouponShare,
        // ct: CouponTempl
    }
})

export class MyCouponList extends BaseVue {
    shareData = null;
    _$service;
    activeIndex = 0;
    limit = 10;
    coupon_data = [
        {
            name: '分享优惠券',
            url: 'api/activites/wd_share_coupons',
            page: 1,
            over: false,
            data: [],
        },
        {
            name: '失效优惠券',
            url: 'api/activites/wd_noefficacy_coupons',
            page: 1,
            over: false,
            data: [],
        },
    ];
    page = 1;
    limit = 10;

    shopId;

    mounted() {
        let _self = this;
        _self._$service = service(_self.$store);

        _self.shopId = _self.$store.state.workVO.user.userId;
        _self.$nextTick(() => {
            document.title = '推广店铺优惠券';
        });
    }

    async refresh(done) {
        let _self = this;
        let _active = _self.coupon_data[_self.activeIndex];
        _active.page = 1;
        _active.over = false;
        let query = {
            shopId: _self.shopId,
            page: _active.page++,
            limit: _self.limit
        }
        let result = await _self._$service.getCouponList(_active.url, query);
        result = result.data;
        for (let index in result.data) {
            result.data[index].wdName = result.wdName;
            if(_self.activeIndex === 0){
                result.data[index].valid = null;
            }
        }
        setTimeout(() => {
            if(!result.errorCode){
                _active.data = result.data;
                if(result.data.length < _self.limit){
                    _active.over = true;
                }
            }
            done(true);
        }, 300);
    }

    async infinite(done) {
        let _self = this;
        let _active = _self.coupon_data[_self.activeIndex];
        if(_active.over){
            done(true);
            return;
        }
        let query = {
            shopId: _self.shopId,
            page: _active.page++,
            limit: _self.limit
        }
        let result = await _self._$service.getCouponList(_active.url, query);
        result = result.data;
        for (let index in result.data) {
            result.data[index].wdName = result.wdName;
            if(_self.activeIndex === 0){
                result.data[index].valid = null;
            }
        }
        if(!result.errorCode){
            _active.data.push(...result.data);
            if(result.data.length < _self.limit){
                _active.over = true;
            }
        }
        done(true);
    }

    /**
     * 切换优惠券类型
     */
    changeType(index) {
        this.activeIndex = index;
    }

    /**
     * 限定商品 进入商品列表
     */
    toCouponDetail(data) {
        let _self = this;
        let query = {
            couponId: data.couponId,
            // coupon: data
        }
        console.log(query)
        _self.$router.push({ path: 'my_coupon_detail', query: query })
    }

    /**
     * 弹窗优惠券二维码
     */
    toCouponShare(coupon) {
        let _self = this;
        _self.shareData = coupon;
    }

    /**
     * 关闭弹窗优惠券二维码
     */
    shareClose() {
        let _self = this;
        _self.shareData = null;
    }

    done(){
        //nothing
    }

}