import { Component, Vue, Prop } from 'vue-property-decorator';

import { timeout, getCountDown, interval } from 'common.env';


import './card.scss';
@Component({
    template: require('./card.html'),
})
export class Card extends Vue {
    @Prop({ type: String, default: 'rob' })
    cardType;

    @Prop({ type: Object, default: () => { return {} } })
    data;

    @Prop({ type: Function, default: () => { } })
    call;

    @Prop({ type: Function, default: () => { } })
    main;

    type = ['rob', 'pickup', 'delivering']; // rob - 抢单；pickup - 取货； delivering - 配送中

    takeImgSrc = require('../../../../../static/images/delivery/q.png');

    giveImgSrc = require('../../../../../static/images/delivery/s.png');

    pointImgSrc = require('../../../../../static/images/delivery/jiantou.png');

    mounted() {

        this.$nextTick(() => {
            this.overTime = this.data.leftTime;
            this.countDown();
        });
    }

    countDate = {
        hour: '00',
        minute: '00',
        second: '00'
    };


    timer = 0;
    overFlag = false;
    overTime = 10000;
    countDown() {
        let _self = this;
        if (isNaN(+_self.overTime) || _self.overTime < 999) {
            return;
        }
        _self.overFlag = true;
        _self.diffHour();
        _self.timer = interval(() => {
            _self.overTime -= 1000;
            if (_self.overTime <= 999) {
                _self.overFlag = false;
                _self.countDate = { hour: '00', minute: '00', second: '00', day: '00' };
                window.clearInterval(_self.timer);
            } else {
                _self.diffHour();
            }
        }, 999);
    }
    diffHour() {
        let _result = getCountDown(this.overTime, 'h');
        this.countDate = { hour: _result.h, minute: _result.m, second: _result.s };
    }

    destroyed() {
        window.clearInterval(this.timer);
    }


    callClick() {
        this.call(this.data);
    }

    mainClick() {
        this.main(this.data);
    }

    toDetail() {
        this.$router.push({ path: 'delivery_m_finish_detail', query: { combinOrderNo: this.data.combinOrderNo } });
    }

}