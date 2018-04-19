import { Component, Vue, Prop } from 'vue-property-decorator';




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

  

    }


    callClick() {
        this.call(this.data);
    }

    mainClick() {
        this.main(this.data);
    }

    toDetail() {
        this.$router.push({ path: 'distributor_detail', query: { combinOrderNo: this.data.combinOrderNo } });
    }

}