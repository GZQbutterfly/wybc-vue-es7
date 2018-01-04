import { Component } from 'vue-property-decorator';
import  BaseVue  from 'base.vue';

import  MultiTab  from '../../../../commons/vue_plugins/components/multitab/multitab.vue';
import orderListService from './user.order.service';
import { OrderItem } from '../item/order.item';
// import { OrderBannerComponent } from '../orderBanner/order.banner.component';

import './user.order.scss';

@Component({
	template: require('./user.order.html'),
	components: {
		tab: MultiTab,
		oi: OrderItem,
		// ob: OrderBannerComponent,
	}
})
export class UserOrder extends BaseVue {

	tableIndex = 0;
	_$service;
	orderBanners = [];

	ordersList = [[], [], [], [], [], []];

	pageList = [0, 0, 0, 0, 0, 0];

	noDataList = [false, false, false, false, false, false];

	data() {
		return {
			tabItemList: ['全部', '待付款', '待发货', '待收货', '交易完成', '交易关闭'],
			index: Number(this.$route.query.listValue) ? Number(this.$route.query.listValue) : 0
		};
	}

	mounted() {
		document.title = "我的订单";
		this._$service = orderListService(this.$store);
		this.$nextTick(() => {
			this.tableIndex = Number(this.$route.query.listValue) ? Number(this.$route.query.listValue) : 0;
			// this._$service.getOrderBanner()
			// 	.then((res) => {
			// 		if (!res.errorCode) {
			// 			this.orderBanners = res.data.data;
			// 		}
			// 	});
		});
	}

	formatServerData(res) {
		let data = res.data;
		let orderList = [];
		let orders = data.orders;
		if (orders) {
			let goodses = data.orderGoods;
			let logis = data.logis;
			for (let i = 0; i < orders.length; ++i) {
				let order = orders[i];
				order.goodses = new Array();
				order.orders = new Array();
				let combinOrderNo = order.combinOrderNo;
				//组合订单
				if (combinOrderNo && (order.orderState == 1 || order.orderState == 6)) {
					while (orders[i] && (combinOrderNo == orders[i].combinOrderNo)) {
						order.orders.push(orders[i]);
						for (let k = 0; k < goodses.length; ++k) {
							let goods = goodses[k]
							if (goods.orderId == order.orderId) {
								order.goodses.push(goods);
							}
						}
						i++;
					}
					--i;
				} else {
					order.orders.push(orders[i]);
					for (let k = 0; k < goodses.length; ++k) {
						let goods = goodses[k]
						if (goods.orderId == order.orderId) {
							order.goodses.push(goods);
						}
					}
				}

				if (logis) {
					for (var index = 0; index < logis.length; index++) {
						var element = logis[index];
						if (element.orderId == order.orderId) {
							order.logis = element;
							break;
						}
					}
				}
				orderList.push(order);
			}
		}
		return orderList;
	}

	resetData(index) {
		this.pageList[index] = 1;
		this.$set(this.ordersList, index, []);
		this.noDataList[index] = false;
	}

	fetchOrdersData(index, page, done) {
		let orderState;
		switch (index) {
			case 1://待付款
				orderState = 1;
				break;
			case 2://待发货
				orderState = 3;
				break;
			case 3://已发货
				orderState = 4;
				break;
			case 4://交易完成
				orderState = 5;
				break;
			case 5://交易关闭
				orderState = 6;
				break;
			default:
				orderState = null;
				break;
		}

		let params = {
			page: page,
			limit: 10,
			orderState: orderState,
		}

		let self = this;
		orderListService(this.$store).getOrderList(params).then((res) => {
			let _toast = self.$store.state.$toast;
			if (res.errorCode) {
				_toast({ title: '获取数据失败', success: false });
				if (done) {
					done(true);
				}
			} else {
				let orders = self.formatServerData(res);
				self.pageList[index] = page;
				if (orders.length < 10) {
					self.noDataList[index] = true;
				} else {
					self.noDataList[index] = false;
				}
				if (page == 1) {
					self.$set(self.ordersList, index, orders);
				} else {
					self.$set(self.ordersList, index, self.ordersList[index].concat(orders));
				}

				if (done) {
					done(true);
				}
			}
		});
	}

	refresh(done) {
		let self = this;
		setTimeout(() => {
			self.noDataList[self.tableIndex] = false;
			self.fetchOrdersData(self.tableIndex, 1, done);
		}, 500)
	}

	infinite(done) {
		let self = this;
		setTimeout(() => {
			if (!self.noDataList[self.tableIndex]) {
				self.fetchOrdersData(self.tableIndex, self.pageList[self.tableIndex] + 1, done);
			} else {
				done(true);
			}
		}, 500)
	}

	onChange(i) {
		this.tableIndex = i;
		this.$router.replace({ path: 'user_order', query: { listValue: i } });
	}

	resetAllData() {
		this.pageList = [0, 0, 0, 0, 0, 0];
		this.ordersList = [[], [], [], [], [], []];
		this.fetchOrdersData(this.tableIndex, 1, null);
	}

	// selectItem(index) {
	// 	if (!this.orderBanners || this.orderBanners.length < index + 1) {
	// 	} else {
	// 		let banner = this.orderBanners[index];
	// 		if (banner.linkType == 1) {//页面
	// 			location.href = banner.linkTarget;
	// 		} else if (banner.linkType == 0) {//商品
	// 			this.$router.push({
	// 				path: 'goods_detail',
	// 				query: {
	// 					goodsId: banner.goodsId,
	// 				}
	// 			})
	// 		}

	// 	}
	// }

}
