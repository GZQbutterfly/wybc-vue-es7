import { Component, Vue, Prop } from 'vue-property-decorator';




import './card.scss';
@Component({
    template: require('./card.html'),
})
export class Card extends Vue {

    @Prop({ type: Object, default: () => { return {} } })
    data;


    takeImgSrc = require('../../../../../../static/images/delivery/q.png');

    giveImgSrc = require('../../../../../../static/images/delivery/s.png');

    pointImgSrc = require('../../../../../../static/images/delivery/jiantou.png');

    mounted() {

    }

    toDetail() {


        this.$router.push({ path: 'delivery_finish_detail', query: { combinOrderNo: this.data.combinOrderNo, deliveryState: this.data.deliveryState } })

    }

}