import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isNotLogin, toLogin } from 'common.env';
import service from "../coupon_list.service";
import './invalid_coupon.scss';

@Component({
    template: require('./invalid_coupon.html'),
    props: ["state"]
})

export class InvalidCoupon extends BaseVue {
    _$service;
    couponList = [];
    firstLoad = true;
    mounted() {
        this._$service = service(this.$store);
        this.initPage();
    }
    initPage() {
        this.page = 1;
        let _state = this.$props.state;
        let _self = this;
        let _data = {
            limit: 10,
            page: 1,
            couponType: _state.couponType,
            couponState: _state.couponState
        }
        this._$service.getUserCoupons(_data).then(res => {
            let _result = res.data;
            _self.firstLoad = false;
            if (!_result.errorCode) {
                _self.couponList = _result.data;
            }
        })

    }
    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.initPage();
            done(true);
        }, 500);

    }
    infinite(done) {
        if (this.firstLoad) {
            done(true);
            return;
        }
        let _self = this;
        setTimeout(() => {
            _self.loadMore(done);
            done(true)
        }, 500);
    }
    loadMore(done) {
        let _state = this.$props.state;
        this.page++;
        if (this.page > 3) {
            done(true);
            reurn;
        }
        let _self = this;
        let _data = {
            limit: 10,
            page: _self.page,
            couponType: _state.couponType,
            couponState: _state.couponState
        }
        this._$service.getUserCoupons(_data).then(res => {
            let _result = res.data;
            this.firstLoad = false;
            if (_result.errorCode || _result.data.length == 0) {
                _self.page--;
                done(true);
                return;
            }
            _self.couponList.push(..._result.data);
            done(false);
        })
    }

}