import {
	Component,
	Vue
} from 'vue-property-decorator';

import './quick.order.item.scss';
import {
	getLocalUserInfo,
	toCMS,
	toWEB
} from 'common.env';


@Component({
	template: require('./quick.order.item.html'),
	props: ['order']
})


export class QuickOrderItem extends Vue {
	expand = false;
	expanded(expand) {
		this.expand = expand;
	}

	expandAble(length) {
		return !this.expand && (length > 1);
	}

	loadGoods(index) {
		return index == 0 || this.expand;
	}

	toOrderDetail() {
		let order = this.$props.order;
		this.$router.push({
			path: 'cms_quick_order_detail',
			query: {
				combinOrderNo: order.combinOrderNo
			}
		});
	}

	updateItem() {
		this.$emit('removeItem', this.$props.order);
	}

	transOrderState() {
		let order = this.$props.order;
		if (order.orderState == 4) {
			return '待配送';
		} else {
			return '配送完成';
		}
	}

	deliveryNow(order) {
		this.$router.push({path: 'delivery_m_finish_detail',query:{
			combinOrderNo:this.order.combinOrderNo
		}})	
	}


	goodsTotal(goods, order) {
		return goods.moneyPrice * goods.number;
	}

	saleTotal() {
		let goodses = this.$props.order.orderGoods;
		let totalPrice = 0;
		for (let index = 0; index < goodses.length; index++) {
			const element = goodses[index];
			totalPrice += element.moneyPrice * element.number;
		}
		return totalPrice;
	}
}