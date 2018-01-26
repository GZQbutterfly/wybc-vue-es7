// 订单推送
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { timeout, getLocalUserInfo, interval } from 'common.env';


import './notice.scss';
@Component({
    template: require('./notice.html')
})
export class Notice extends Vue {
    @Prop({ type: Function, default: () => { } })
    close;

    @Prop({ type: Boolean, default: true })
    showNotice;

    @Prop({ type: Object, default: () => { return { money: 200, from: '北京', fromAddress: '北京天安门', to: '成都', toAddress: '成都天府广场' } } })
    data;

    takeImgSrc = require('../../../../../static/images/delivery/q.png');

    giveImgSrc = require('../../../../../static/images/delivery/s.png');

    pointImgSrc = require('../../../../../static/images/delivery/jiantou.png');

    show = false;

    timeNum = 10;

    timer = 0;

    mounted() {

        this.$nextTick(() => {

            this.showContent();


        });

    }


    @Watch('showNotice')
    watchShowNotice(newVal, oldVal) {
        if (newVal) {
            this.showContent();
        }
    }

    showContent() {
        timeout(() => {
            this.timeNum = 10;
            this.show = !this.show;
            this.timer = interval(() => {
                if (!this.timeNum) {
                    this.closeSelf();
                    return;
                }
                this.timeNum--;
            }, 999);
        }, 100)
    }

    closeSelf() {
        this.show = false;
        timeout(() => {
            this.close();
            window.clearInterval(this.timer);
        }, 400);
    }

    noTouchMove(e) {
        e.preventDefault();
        return false;
    }

    // 抢单ing

    robOrder() {
        window.clearInterval(this.timer);
        console.log('抢单ing');
        let success = Math.floor(Math.random() * 2);
        window.clearInterval(this.timer);
        this.close({ success: !success })
    }


}