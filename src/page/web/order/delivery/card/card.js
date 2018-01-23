import { Component, Vue, Prop } from 'vue-property-decorator';




import './card.scss';
@Component({
    template: require('./card.html'),
})
export class Card extends Vue {
    @Prop({ type: String, default: 'rob' })
    cardType;

    @Prop({ type: Object, default: () => { return {money: 200, from: '北京',fromAddress: '北京天安门',  to: '成都', toAddress: '成都天府广场'  } } })
    data;


    type = ['rob', 'pickup', 'delivering']; // rob - 抢单；pickup - 取货； delivering - 配送中

    mounted() {

    }

}