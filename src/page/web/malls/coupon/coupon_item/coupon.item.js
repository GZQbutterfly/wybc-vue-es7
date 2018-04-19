import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { toWEB } from 'common.env';
import { CouponShare } from '../share/coupon.share';
import './coupon.item.scss';

@Component({
    template: require('./coupon.item.html'),
    props: [
        "coupon",
        "toDetail",
        "toShare"
    ]
})

export class CouponItem extends BaseVue {

    mounted() {
        
    }

    toWebDetail(){
        let _self = this;
        let query = {
            couponId: _self.$props.coupon.couponId,
            shopId: _self.$store.state.workVO.user.userId
        }
        toWEB('coupon_detail',query);
    }
 
}