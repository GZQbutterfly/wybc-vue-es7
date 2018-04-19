import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import orderDetailService from './quick.order.detail.service';
import { getLocalUserInfo, toWEB } from 'common.env';



import './quick.order.detail.scss';

@Component({
    template: require('./quick.order.detail.html')
})


export class QuickOrderDetail extends BaseVue {

     _$service ;
     
    orderInfo = {};

    orderGoods = {};

    mounted() {
        //订单编号
        let _query = this.$route.query || {};
        this.combinOrderNo = _query.combinOrderNo;
        this._$service = orderDetailService(this.$store);
        let _self = this;
        this.$nextTick(() => {
            _self.initPage();
        })

    }

    async initPage(){
        let _query = this.$route.query;
        let _params = {
            orderId:_query.orderId,
            combinOrderNo:_query.combinOrderNo,
        }
        let result =  await  this._$service.getOrderInfo(_params)
        let _self = this;
        if (!result||result.errorCode || result.data.errcode) {
                let dialogObj = {
                    title: '',
                    content: '订单不存在',
                    type: 'info',
                    mainBtn: '返回',
                    assistFn() {
                    },
                    mainFn() {
                        self.$router.back();
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
        }else{
            this.orderInfo = result.data;
            this.orderGoods = result.data.orderGoods;
        }
    }


    deliveryNow(combinOrderNo){
        this.$router.push({path: 'delivery_m_finish_detail',query:{
            combinOrderNo:combinOrderNo
        }})
    }

    toGoodsDetail(goodsId) {
    }

    saleTotal() {
        let goodses = this.orderGoods;
		let totalPrice = 0;
		for (let index = 0; index < goodses.length; index++) {
			const element = goodses[index];
			totalPrice += element.moneyPrice * element.number;
		}
		return totalPrice;
    }

}
