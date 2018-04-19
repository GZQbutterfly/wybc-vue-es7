
import { Component, Prop } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { isNotLogin, toLogin } from 'common.env';



import './new_gift.scss';

@Component({
    template: require('./new_gift.html')
})
export class NewGift extends BaseVue {

    @Prop({ type: Object, default: () => { return {} } })
    data;

    @Prop({ type: String, default: 'newGift' })
    giftType; // newGift 新手礼包  couponGift  优惠券

    takeGift() {

        let _notLoginFlag = isNotLogin();
        console.log('未登录状态: ', _notLoginFlag);
        let couponId = this.data.couponId;
        if (_notLoginFlag) {
            this.$store.state.giftVO.show = false;
            if (this.giftType == 'newGift') {
                // 新手礼包   拆
                sessionStorage.__takeFlag = 'takeNewGift';
            } else {
                // 优惠券   拆
                sessionStorage.__takeFlag = 'takeCounpon';
            }
            // 引导登录
            toLogin(this.$router, { realTo: 'home', realToQuery: { couponId, shopId: this.data.shopId } })
        } else {
            // 拆礼包
            this.$emit('takeGift', this.giftType, couponId,  this.data.shopId);
        }
    }


    closeSelf() {
        let _route = this.$route;
        if (['home', 'classify'].includes(_route.name)) {
            this.$store.state.giftVO.show = false;
        } else {
            this.$router.replace({ path: 'home', query: { shopId: _route.query.shopId }  })
        }
    }

    // 禁止touchmove
    noTouchMove(e) {
        e.preventDefault();
        return false;
    }

}