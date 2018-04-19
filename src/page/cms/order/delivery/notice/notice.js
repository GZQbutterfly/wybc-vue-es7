// 订单推送
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { timeout, getLocalUserInfo, interval } from 'common.env';

import service from '../delivery.service';

import './notice.scss';
@Component({
    template: require('./notice.html')
})
export class Notice extends Vue {
    @Prop({ type: Function, default: () => { } })
    close;

    @Prop({ type: Boolean, default: true })
    showNotice;

    @Prop({ type: Object, default: () => { return { } } })
    data;

    takeImgSrc = require('../../../../../static/images/delivery/q.png');

    giveImgSrc = require('../../../../../static/images/delivery/s.png');

    pointImgSrc = require('../../../../../static/images/delivery/jiantou.png');

    show = false;

    timeNum = 10;

    timer = 0;

    _$service;

    mounted() {

        this._$service = service(this.$store);

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
            this.timeNum = this.data.countDownTime || 10;
            this.show = true;
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

    async robOrder() {
        window.clearInterval(this.timer);
        let success = false;
        let _result = (await this._$service.receivedOrderResult({ combinOrderNo: this.data.combinOrderNo })).data;
        if (_result && _result.success) {
            success = true;
        }
        //success = true;//test
        this.close({ success })
    }


}