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
		if (this.timeLeftTimer) {
			clearInterval(this.timeLeftTimer);
		}
		if (!this.$props.order.acceptStatus && this.$props.order.acceptTimeLeft > 0) {
			this.countDown(this.$props.order.acceptTimeLeft);
		}
	}

	countDown(timeValue) {
		let self = this;
		this.timeLeftTimer = setInterval(function () {
			if (timeValue > 0) {
				let hour = Math.floor(timeValue / 1000 / 60 / 60) % 60 < 10 ? '0' + Math.floor(timeValue / 1000 / 60 / 60) % 60 : Math.floor(timeValue / 1000 / 60 / 60) % 60;
				let minte = Math.floor(timeValue / 1000 / 60) % 60 < 10 ? '0' + Math.floor(timeValue / 1000 / 60) % 60 : Math.floor(timeValue / 1000 / 60) % 60;
				let second = Math.floor(timeValue / 1000) % 60 < 10 ? '0' + Math.floor(timeValue / 1000) % 60 : Math.floor(timeValue / 1000) % 60
				self.timeLeft = hour + ' : ' + minte + ' : ' + second;
			} else {
				clearInterval(self.timeLeftTimer);
				self.timeLeftTimer = null;
				self.updateItem();
			}
			timeValue -= 1000;
		}, 1000);
	}

	destroyed() {
		if (this.timeLeftTimer) {
			clearInterval(this.timeLeftTimer);
		}
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

	isTichengOrder() {
		let userId = getLocalUserInfo().userId;
		return this.$props.order.shopId == userId;
	}

	toOrderDetail(orderId) {
		this.$router.push({
			path: 'cms_out_order_detail',
			query: {
				orderId: this.$props.order.orderId,
				outState: this.$props.order.outState,
			}
		});
	}

	updateItem() {
		this.$emit('removeItem', this.$props.order);
	}

	transOrderState() {
		// 1：待进货 2：交易完成 3:提成中，4：已提成，
		let outState = this.$props.order.outState;
		let state = '';
		switch (outState) {
			case 1:
				state = '待进货';
				break;
			case 2:
				state = '交易完成';
				break;
			case 3:
				state = '等待上级微店进货';
				break;
			case 4:
				state = '已返利';
				break;
			default:
				state = '';
		}
		return state;
	}

	refuse(orderId) {
		let self = this;
        this._$service.upShopInfo(getLocalUserInfo().userId)
            .then(res => {
                if (res && !res.errorCode) {
                    let dialogObj = {
                        title: '确认拒绝',
                        content: '确认拒绝备货后，订单将会被推送到' + res.data.wdName + '，确认拒绝？',
                        assistBtn: '取消',
                        mainBtn: '确定',
                        assistFn() {

                        },
                        mainFn() {
                            self.sureRefuse(orderId);
                        }
                    };
                    self.$store.state.$dialog({ dialogObj });
                } else {//给个安全的处理方案
                    let dialogObj = {
                        title: '确认拒绝',
                        content: '确认拒绝备货后，订单将会被推送到上级微店，确认拒绝？',
                        assistBtn: '取消',
                        mainBtn: '确定',
                        assistFn() {

                        },
                        mainFn() {
                            self.sureRefuse(orderId);
                        }
                    };
                    self.$store.state.$dialog({ dialogObj });
                }
            })
	}

	sureRefuse(orderId){
        let self = this;
        this._$service.throwOrder(orderId)
            .then(res => {
                if (!res || res.errcode) {
                    let dialogObj = {
                        title: '',
                        content: '抛单错误:' + res.errcode,
                        type: 'info',
                        mainBtn: '返回',
                        assistFn() {
                        },
                        mainFn() {

                        }
                    };
                    self.$store.state.$dialog({ dialogObj });
                } else {
					self.updateItem();
                }
            })
    }

	stockNow(orderId) {
		//他们说目前只有一个商品
		let goods = this.$props.order.goodses[0];
		this.$router.push({
			path: 'my_inventory_detail',
			query: {
				goodsId: goods.goodsId,
				orderId
			}
		})
	}

	goodsTotal(goods,order){
		if (order.outState==3||order.outState==4) {
			return Math.ceil(goods.purchasePrice*order.commi.shopSaleDisct/100);
		}else{
			return Math.ceil(goods.purchasePrice*order.shopSaleDisct/100);
		}
	}


	saleTotal() {
		let order = this.$props.order;
		let goodses = this.$props.order.goodses;
		let commi = this.$props.order.commi;
		if (order.outState == 3 || order.outState == 4) {
			return Math.ceil(order.purchasePrice * commi.shopSaleDisct / 100) * order.number;
		}else{
			return Math.ceil(order.purchasePrice * order.shopSaleDisct / 100)* order.number;
		}
	}
}
