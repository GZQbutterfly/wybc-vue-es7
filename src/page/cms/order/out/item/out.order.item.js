import { Component,Vue } from 'vue-property-decorator';

import './out.order.item.scss';
import itemService from './out.order.item.service';
import { getLocalUserInfo, toCMS, toWEB } from 'common.env';


@Component({
	template: require('./out.order.item.html'),
	props: ['order']
})


export class OutOrderItem extends Vue {
	_$service;
	expand = false;
	timeLeftTimer;
	timeLeft = 0;
	created (){
		//注册服务
		this._$service = itemService(this.$store);
	}

	expanded(expand) {
		this.expand = expand;
	}

	expandAble(length) {
		return !this.expand && (length > 1);
	}

	loadGoods(index) {
		return index == 0 || this.expand;
	}

	toOrderDetail(orderId) {
		this.$router.push({
			path: 'cms_out_order_detail',
			query: {
				orderId: this.$props.order.orderId,
			}
		});
	}

	updateItem() {
		this.$emit('removeItem', this.$props.order);
	}

	saleTotal() {
		let order = this.$props.order;
		return order.purchasePrice * order.number;
	}
}
