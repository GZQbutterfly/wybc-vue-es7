import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import maskService from './mask_coupon.service';

import './mask_coupon.scss';

@Component({ template: require('./mask_coupon.html') })

export class CmsMaskCoupon extends BaseVue {
    page = 0;
    _$service;
    couponList = [];
    couponSub = '店铺';
    mounted() {
        this._$service = maskService(this.$store);
        this.initPage();
    }
    initPage() {
        document.title = "进货券明细";
        let _self = this;
        let _shopId = this.$route.query.shopId;
        let _goodsId = this.$route.query.goodsId;
        let _data = {
            shopId: _shopId,
            limit: 10,
            page: 1
        };
        if (_goodsId) {
            this._$service.queryCouponInfo({ goodsId: _goodsId }).then(res => {
                let _result = res.data
                if (!_result || _result.errorCode || !_result.data) {
                    return;
                }
                _self.couponList = _result.data;
            });
            this.couponSub = '商品';
        } else {
            this._$service.getCarCoupon(_data).then(res => {
                if (res.data.errorCode || res.data.data.length == 0) {
                    return;
                }
                _self.couponList = res.data.data;
            })
        }


    }
    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.initPage();
            done(true);
        }, 300);
    }
    infinite(done) {
        done(true);
        // let _self = this;
        // setTimeout(() => {
        //     _self.initPage(done);
        // }, 300);

    }
}