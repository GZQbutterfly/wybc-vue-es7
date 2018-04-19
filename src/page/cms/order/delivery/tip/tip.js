import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { timeout, getLocalUserInfo, interval } from 'common.env';


import './tip.scss';
@Component({
    template: require('./tip.html'),
})
export class Tip extends Vue {

    @Prop({ type: Function, default: () => { } })
    close;

    @Prop({ type: Object, default: () => { return { success: true } } })
    data;

    @Prop({ type: Boolean, default: true })
    showTip;


    robSucceedImgSrc = require('../../../../../static/images/delivery/qd-cg.png');

    robFaliedImgSrc = require('../../../../../static/images/delivery/qd-fail.png');

    show = false;



    mounted() {

        this.$nextTick(() => {
            this.showContent();
        });

    }

    @Watch('showTip')
    watchShowTip(newVal, oldVal) {
        if (newVal) {
            this.showContent();
        }
    }

    showContent() {
        timeout(() => {
            this.show = !this.show;
        }, 100);
    }

    closeSelf(index) {
        this.show = false;
        timeout(() => {
            this.close(index);
        }, 400);
    }

    toDetail() {
        this.closeSelf(1);
    }
}