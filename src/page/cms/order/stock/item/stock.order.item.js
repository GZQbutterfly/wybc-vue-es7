
import { Component, Vue } from 'vue-property-decorator';

import './stock.order.item.scss';
import itemService from './stock.order.item.service';
import { getLocalUserInfo, } from 'common.env';




@Component({
	template: require('./stock.order.item.html'),
	props: ['order', 'expand']
})

export class StockOrderItem extends Vue {

	_$service;

	mounted() {
		//注册服务
		this._$service = itemService(this.$store);
	}

	expanded(expand) {
		this.$props.expand = expand;
	}

	expandAble(length) {
		return !this.$props.expand && (length > 1);
	}

	loadGoods(index) {
		return index == 0 || this.$props.expand;
	}

	toOrderDetail(orderId) {
		let query = {};
		if (this.$props.order.orders[0].orderState == 1 || this.$props.order.orders[0].orderState == 3) {//待支付或者交易关闭
			query.combinOrderNo = this.$props.order.orders[0].combinOrderNo;
		} else {
			query.orderId = this.$props.order.orders[0].orderId;
		}
		this.$router.push({
			path: 'cms_purchase_order_detail',
			query: query,
		});
	}

	//支付订单
	payOrder(combinOrderNo) {
		let obj = this.$store.state.$loadding();
		let data = {
			combinOrderNo: combinOrderNo
		}
		let self = this;
		this._$service.pay(data).then(res => {
			obj.close();
			self.updateItem();
		});
	}


	updateItem() {
		this.$emit('removeItem', this.$props.order);
	}

	transOrderState() {
		let orderState = this.$props.order.orders[0].orderState;
		let state = '';
		switch (orderState) {
			case 1:
				state = '待支付';
				break;
			case 2:
				state = '交易完成';
				break;
			case 3:
				state = '交易关闭';
				break;
			default:
				state = '';
		}
		return state;
	}

	confirmCancel() {
		let params = {
			combinOrderNo: this.$props.order.orders[0].combinOrderNo
		}

		this._$service.cancelOrder(params).then((res) => {
			let _result = res.data;
			let _toast = this.$store.state.$toast;
			if (_result.errorCode) {
				_toast({ title: _result.msg, success: false });
			} else {
				this.updateItem();
			}

		})
	}

	sureRecive(orderId) {
		let params = {
			userId: this.$store.state.workVO.user.id,
			token: this.$store.state.workVO.user.token,
			orderId: orderId
		}

		this._$service.sureRecive(params).then((res) => {
			let _result = res.data;
			let _toast = this.$store.state.$toast;

			if (_result.errorCode) {
				_toast({ title: '操作失败！', success: false });
			} else {
				this.updateItem();
			}

		})
	}

	confirmRecive(orderId) {
		let _this = this;
		let dialogObj = {
			title: '',
			content: '是否确认收货',
			assistBtn: '取消',
			mainBtn: '确定',
			type: 'info',
			assistFn() {

			},
			mainFn() {
				_this.sureRecive(orderId);
			}
		};
		this.$store.state.$dialog({ dialogObj });
	}

	// 取消订单
	cancelOrder() {
		let _this = this;
		let dialogObj = {
			title: '',
			content: '是否取消订单',
			assistBtn: '取消',
			mainBtn: '确定',
			type: 'info',
			assistFn() {

			},
			mainFn() {
				_this.confirmCancel();
			}
		};
		this.$store.state.$dialog({ dialogObj });
	}

	orderTotalMoney() {
		let orders = this.$props.order.orders;
		if (orders) {
			let total = 0;
			for (var i = 0; i < orders.length; ++i) {
				total += orders[i].totalMoney;
			}
			return total;
		} else {
			return 0;
		}
	}
}
