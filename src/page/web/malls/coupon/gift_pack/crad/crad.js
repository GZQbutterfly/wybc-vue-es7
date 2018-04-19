
import { Component, Prop } from 'vue-property-decorator';
import BaseVue from 'base.vue';





import './crad.scss';

@Component({
    template: require('./crad.html')
})
export class GiftCrad extends BaseVue {

    @Prop({ type: Object, default: () => { return {} } })
    data;

    @Prop({ type: String, default: 'couponGfit' })
    giftType;


    mounted() {
        this.$nextTick(() => {
            // this.data = {};
            console.log(this.giftType);
        });
    }

    goBuy() {
        let _route = this.$route;
        if (['home', 'classify'].includes(_route.name)) {
            this.$store.state.giftVO.show = false;
        } else {
           //
        }
        this.$router.push({ path: 'coupon_detail', query: { couponId: this.data.couponId } });
    }
}