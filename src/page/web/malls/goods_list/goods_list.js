import { Component, Vue, Prop } from 'vue-property-decorator';


import finishToCar from "../shop_car/finishToCar";


import './goods_list.scss';
@Component({
    template: require('./goods_list.html')
})
export class GoodsList extends Vue {
    @Prop({ type: String, default: 'none' })
    status;  //   agentmalls 店长直营   officialmalls 店铺代理 

    @Prop({ type: Object, default: () => { return { 'data': [] } } })
    dataList

    goodsList = { 'data': [] };

    mounted() {
        this.goodsList = this.dataList;
    }

    toDetail(id) {
        this.$router.push({ path: "goods_detail", query: { goodsId: id, isAgent: this.status == 'agentmalls' } });
    }
    QuicklyJoinTheShoppingCart(goodsItem) {
        this.$emit("joinCar", goodsItem);
    }
}
