import { Component, Vue } from 'vue-property-decorator';
import './coupon.item.scss';

@Component({
    template: require('./coupon.item.html'),
    props: [
        "coupon",
    ]
})

export class CouponItem extends Vue {

    mounted() {
        
    }
 
    expiryDate(){
        let _coupon = this.$props.coupon;
        if (_coupon.expiryDate){
            return '有效期:至' + _coupon.expiryDate;
        }else{
            return '有效期: 领取后' + _coupon.validTimeDay + '天内有效';
        }
    }

    toUse(){
        let _coupon = this.$props.coupon;
        if (_coupon.goodsLimit && _coupon.state==0) {
            this.$router.push({path:'cms_coupon_detail',query:{couponId:_coupon.couponId}});
        }else{
            this.$router.push({path:'cms_goods_shelves'});
        }
    }

    toDetail(){
        let _coupon = this.$props.coupon;
        if (_coupon.goodsLimit && _coupon.state==0) {
            this.$router.push({path:'cms_coupon_detail',query:{couponId:_coupon.couponId}});
        }
    }
}