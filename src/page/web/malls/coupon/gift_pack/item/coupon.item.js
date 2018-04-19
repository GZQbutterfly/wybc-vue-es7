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
            if (_coupon.expiryDate.length>10){
                _coupon.expiryDate = _coupon.expiryDate.substring(0,10);
            }
            return '有效期:至' + _coupon.expiryDate;
        }else{
            return '有效期: 领取后' + _coupon.validTimeDay + '天内有效';
        }
    }
}