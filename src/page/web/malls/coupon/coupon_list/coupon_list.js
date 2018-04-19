import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from "./coupon_list.service";
import './coupon_list.scss';
import { AvailableCoupon } from "./available_coupon/available_coupon";
import { AvailableCoupon2 } from "./first_coupon/available_coupon";
import { InvalidCoupon } from "./invalid_coupon/invalid_coupon";
import { UsedCoupon } from "./used_coupon/used_coupon";
@Component({
    template: require('./coupon_list.html'),
    components: {
        'available-coupon': AvailableCoupon,
        'used-coupon': UsedCoupon,
        'invalid-coupon': InvalidCoupon,
        'first-coupon': AvailableCoupon2
    }
})

export class CouponList extends BaseVue {
    headNav = ["通用优惠券", "店优惠券"];
    useNav = ["可使用", "已使用", "已失效"];
    headIndex = 0;
    useIndex = 0;
    availableShow = false;//未使用
    invalidShow = false;//失效
    usedShow = false;//已使用
    firstShow = true;
    couponState = { couponType: 0, couponState: 0 }//券状态"couponType":0|1,//券类型0:通用券1:校园券couponState": 0 | 2 | 1//券状态 0:未使用  1:已经使用 2:已经失效
    _$service;
    mounted() {
        document.title = "我的优惠券";
        this._$service = service(this.$store);
    }
    changeHeadNav(index) {
        this.headIndex = index;
        this.useIndex = 0;
        this.invalidShow = false;
        this.usedShow = false;
        if(index==0){
            this.firstShow = true;
            this.availableShow = false;
        }else{
            this.firstShow = false;
            this.availableShow = true;
        }
        this.couponState = { couponType: index, couponState: 0 }
    }
    changeUseNav(index) {
        this.useIndex = index;
        this.couponState = { couponType: this.headIndex, couponState: index }
     
        if(this.headIndex==0){
            this.availableShow = false;
            if (index == 0) {
                this.firstShow = true;
                this.invalidShow = false;
                this.usedShow = false;
         
            } else if (index == 1) {
                this.firstShow = false;
                this.invalidShow = false;
                this.usedShow = true;
            
            }
            else if (index == 2) {
                this.firstShow = false;
                this.usedShow = false;
                this.invalidShow = true;
           
            }  
        }else{
            this.firstShow = false;
            if (index == 0) {
                this.availableShow = true;
                this.invalidShow = false;
                this.usedShow = false;
             
            } else if (index == 1) {
                this.availableShow = false;
                this.invalidShow = false;
                this.usedShow = true;    
            }
            else if (index == 2) {
                this.availableShow = false;
                this.usedShow = false;
                this.invalidShow = true;
             
            }  
        }   
    }
}