import { Component } from 'vue-property-decorator';
import Vue from 'vue';


import itemService from './order.item.service';
import './order.item.scss';
import { debug } from 'util';

@Component({
	template: require('./order.item.html'),
	props: ['order']
})
export class OrderItem extends Vue {
	_$service;
	expand = false;
	totalGold = 0;
	totalRoll = 0;
	disCountMoney = 0;
	useRoll = false;
    timeLimit = false;
	mounted() {
		//注册服务
		this._$service = itemService(this.$store);
		this.parseData();
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

	parseData(){
		let _self = this;
		let orders = this.$props.order.orders;
		_self.totalGold = 0;
		_self.totalRoll = 0;
		_self.disCountMoney = 0;
		for (var i = 0; i < orders.length; ++i) {
			_self.totalGold += orders[i].totalGold || 0;
			_self.totalRoll += orders[i].couponMoney || 0;
			if(orders[i].couponMoney != null){
				_self.useRoll = true;
			}
			if (orders[i].periodId) {
				this.timeLimit = true;
				_self.disCountMoney += (orders[i].goodses[0].purchasePrice - orders[i].goodses[0].moneyPrice) * orders[i].goodses[0].number || 0;
			}
		}
	}

	toOrderDetail() {
		let query = {};
		query.combinOrderNo = this.$props.order.combinOrderNo;
		query.orderId = this.$props.order.orderId;
		this.$router.push({
			path: 'order_detail',
			query: query
		});
	}

	//支付订单
	payOrder(orderId) {
		let self = this;
		let order = self.$props.order;
		let orderPayType = 0;
		if (order.consuType == 3 && order.periodId==0){
			orderPayType = 1;
		} else if (order.periodId > 0){
			orderPayType = 2
		}
		else{
			orderPayType = 0;
		}
	
		let _param = {
			combinOrderNo: order.combinOrderNo,
			totalMoney:order.totalMoney,
			orderPayType:orderPayType
		};

		this.$router.push({path:'pay_list',query:_param});
	}


	updateItem() {
		this.$emit('removeItem', this.$props.order);
	}

	transOrderState() {
		// 1：待支付 2：已支付、待发货 3:发货中，4：已发货，5：交易完成，6：交易关闭（原因有：1-买家取消、2-支付超时、3-买家退款、4-订单异常
		let orderState = this.$props.order.orders[0].orderState;
		let state = '';
		switch (orderState) {
			case 1:
				state = '待支付';
				break;
			case 2:
				state = '待发货';
				break;
			case 3:
				state = '待发货';
				break;
			case 4:
				state = '已发货';
				break;
			case 5:
				state = '交易完成';
				break;
			case 6:
				state = '交易关闭';
				break;
			default:
				state = '';
		}
		return state;
	}

	confirmCancel() {
		let params = {};
		if (this.$props.order.orders[0].orderState == 1) {//待付款
			params.combinOrderNo = this.$props.order.orders[0].combinOrderNo;
		} else {
			params.orderId = this.$props.order.orders[0].orderId;
		}

		this._$service.cancelOrder(params).then((res) => {
			let _result = res.data;
			let _toast = this.$store.state.$toast;
			if (_result.errorCode) {
				_toast({ title: '删除失败！', success: false });
			} else {
				this.updateItem();
			}

		})
	}

	sureRecive() {
		let params = {};
		if (this.$props.order.orders[0].orderState == 1) {
			params.combinOrderNo = this.$props.order.orders[0].combinOrderNo;
		} else {
			params.orderId = this.$props.order.orders[0].orderId;
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

	confirmRecive() {

		let _this = this;
		let dialogObj = {
			title: '',
			content: '是否确认收货',
			assistBtn: '取消',
			mainBtn: '确定',
			assistFn() {

			},
			mainFn() {
				_this.sureRecive();
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
			assistFn() {

			},
			mainFn() {
				_this.confirmCancel();
			}
		};
		this.$store.state.$dialog({ dialogObj });
	}
	getShipFee() {
		let orders = this.$props.order.orders;
		if (orders) {
			let shipFee = 0;
			for (var i = 0; i < orders.length; ++i) {
				shipFee += orders[i].shipFee;
			}
			return shipFee;
		} else {
			return 0;
		}
	}
	orderTotalMoney() {
		let orders = this.$props.order.orders;
		if (orders) {
			let total = 0;
			for (var i = 0; i < orders.length; ++i) {
				total += orders[i].totalMoney + orders[i].shipFee;
			}
			return total;
		} else {
			return 0;
		}
	}
}
