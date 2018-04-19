
import { Component, Prop } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { timeout ,toCMS} from 'common.env';

import { GiftCrad } from '../crad/crad';
import { CouponItem } from '../item/coupon.item';


import './detail.scss';

@Component({
    template: require('./detail.html'),
    components: {
        'gift-crad': GiftCrad,
        'coupon-item':CouponItem
    }
})
export class GiftDetail extends BaseVue {

    @Prop()
    data;

    @Prop({ type: String, default: 'coupon' })
    giftType;

    bdHeight = '400px';

    list = [];


    mounted() {
        this.$nextTick(() => {
            this.initPage();
        });
    }
    initPage() {


        // console.log('gift detail  giftType: ', this.giftType);

        this.list = this.data || [];

        let _refs = this.$refs;

        timeout(() => {
            let _h = document.body.offsetHeight;
            this.bdHeight = _h - _refs.hdRef.offsetHeight - _refs.ftRef.offsetHeight + 'px';
        });

        console.log(this.data);
    }


    takeGift() {

    }


    closeSelf() {
        let _route = this.$route;
        if (this.giftType=='applay_shop'){
            toCMS('cms_home');
        } else if (['home', 'classify'].includes(_route.name)) {
            this.$store.state.giftVO.show = false;
        } else {
            this.$router.replace({ path: 'home', query: { shopId: _route.query.shopId } });
        }
    }

    goBuy() {

    }

    // 禁止touchmove
    noTouchMove(e) {
        e.preventDefault();
        return false;
    }
}