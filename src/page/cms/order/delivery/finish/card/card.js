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

    mounted () {
        
    }

}