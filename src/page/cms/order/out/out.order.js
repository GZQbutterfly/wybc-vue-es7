// 出貨訂單
import BaseVue from 'base.vue';
import {
    Component
} from 'vue-property-decorator';
import shipOrderListService from './out.order.service';
import {
    OutOrderItem
} from './item/out.order.item';

import {
    QuickOrderItem
} from './item/quick.order.item';



import './out.order.scss';
@Component({
    template: require('./out.order.html'),
    components: {
        oi: OutOrderItem,
        qoi: QuickOrderItem,
    }
})
export class OutOrder extends BaseVue {

    _$service;

    //正常出货订单数据(用户订单&&出货订单)
    dataShipmentList = [{
        index: 0,
        state: 0, //0 待返利;1已返利
        page: 0,
        data: []
    }, {
        index: 1,
        state: 1, //0 待返利;1已返利
        page: 0,
        data: []
    }];

    //快速订单
    dataQuickList = [
        {
            index:0,
            state:4,
            data:[],
            page:0
        },{
            index:1,
            state:5,
            data:[],
            page:0
        }
    ];

    tabs = ['普通订单', '快速订单']

    custStyle = {
        lineColor: '#f2f2f2',
        itemColor: '#FFFFFF',
        lineOnColor: '#7ecc44',
        itemOnColor: '#7ecc44',
        textColor: '#333333',
        textOnColor: '#FFFFFF'
    }

    nomalTabs = ['待返利', '已返利'];

    quickTabs = ['待配送', '交易完成'];

    tabIndex = 0;

    userSubIndex = 0;

    quickSubIndex = 0;

    mounted() {
        this._$service = shipOrderListService(this.$store);
        let self = this;
        this.$nextTick(() => {
            if (Number(self.$route.query.listValue)) {
                let listValue = Number(self.$route.query.listValue);
                if (listValue >= 2) {
                    self.tabIndex = 1;
                    self.quickSubIndex = listValue % 2;
                } else  {
                    self.tabIndex = 0;
                    self.userSubIndex = listValue % 2;
                }
            }
        })
    }

    onTabChange(index) {
        this.tabIndex = index;
        this.$router.replace({
            path: 'cms_out_order',
            query: {
                listValue: this.transIndex()
            }
        });
    }

    transIndex() {
        let listValue;
        if (this.tabIndex == 0) {
            listValue = this.userSubIndex;
        } else if (this.tabIndex == 1) {
            listValue = 2 + this.quickSubIndex;
        }
        return listValue;
    }

    formatServerData(res) {
        let data = res.data;
        let orderList = [];
        let orders = data.orders;
        if (orders) {
            //商品列表
            let goodses = data.orderGoods;
            //提成信息
            let rebate = data.rebate;
            for (let i = 0; i < orders.length; ++i) {
                let order = orders[i];
				order.goodses = new Array();
                order.orders = new Array();
                order.rebates = new Array();
				let combinOrderNo = order.combinOrderNo;
				//组合订单
				if (combinOrderNo) {
					while (orders[i] && (combinOrderNo == orders[i].combinOrderNo)) {
						order.orders.push(orders[i]);
						for (let k = 0; k < goodses.length; ++k) {
							let goods = goodses[k]
							if (goods.orderId == orders[i].orderId) {
								order.goodses.push(goods);
							}
                        }
                        
                        for (let b = 0; b < rebate.length; ++b) {
							let _rebate = rebate[b]
							if (_rebate.orderId == orders[i].orderId) {
								order.rebates.push(_rebate);
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
                    for (let b = 0; b < rebate.length; ++b) {
                        let _rebate = rebate[b]
                        if (_rebate.orderId == order.orderId) {
                            order.rebates.push(_rebate);
                        }
                    }
                }
                
                orderList.push(order);
            }
        }
        return orderList;
    }

    fetchOrdersData(index, state, page, done) {
        let _self = this;
        this._$service.shipOrderListIndex(state, page)
            .then((res) => {
                let _toast = _self.$store.state.$toast;
                if (res.errorCode) {
                    _toast({
                        title: '获取数据失败',
                        success: false
                    });
                    if (done) {
                        done(false);
                    }
                } else {
                    let orders = _self.formatServerData(res, state);
                    let _tab = _self.dataShipmentList[index];
                    if (page == 1) {
                        _tab.data = orders;
                    } else {
                        _tab.data.push(...orders);
                    }
                    if (orders && orders.length > 0) {
                        _tab.page = page;
                    }
                    if (done) {
                        done(true);
                    }
                }
            }).catch((res) => {
                done(true);
            });
    }

    fetchQuickOrdersData(index,state, page, done) {
        console.log('快速订单参数',index,state,page);
        let _self = this;
        this._$service.queryQuickOrdersData({
                orderState: state,
                page: page,
                limit: 10
            })
            .then(res => {
                if (!res.data || res.data.errorCode) {
                    let _toast = _self.$store.state.$toast;
                    _toast({
                        title: '获取数据失败',
                        success: false
                    });
                    if (done) {
                        done(false);
                    }
                } else {
                    let orders = res.data.orders;
                    if (orders && orders.length > 0) {
                        if (page == 1) {
                            _self.dataQuickList[index].data = orders;
                        } else {
                            _self.dataQuickList[index].data.push(...orders);
                        }
                        _self.dataQuickList[index].page = page;
                    }

                    if (done) {
                        done(true);
                    }
                }
            })
    }

    refresh(done) {
        let _self = this;
        setTimeout(() => {
            if (_self.tabIndex == 0) { //用户单数据
                let index = _self.tabIndex * 2 + _self.userSubIndex;
                let _tab = _self.dataShipmentList[_self.userSubIndex];
                _self.fetchOrdersData(_tab.index, _tab.state, 1, done);
            } else if (_self.tabIndex == 1) { //快速订单
                let _tab = _self.dataQuickList[_self.quickSubIndex];
                _self.fetchQuickOrdersData(_tab.index,_tab.state, 1, done);
            }
        }, 500)
    }


    infinite(done) {
        let _self = this;
        setTimeout(() => {
            if (_self.tabIndex == 0) { //用户单数据
                let index = _self.tabIndex * 2 + _self.userSubIndex;
                let _tab = _self.dataShipmentList[_self.userSubIndex];
                _self.fetchOrdersData(_tab.index, _tab.state, _tab.page + 1, done);
            } else if (_self.tabIndex == 1) { //快速订单
                let _tab = _self.dataQuickList[_self.quickSubIndex];
                _self.fetchQuickOrdersData(_tab.index, _tab.state, _tab.page + 1, done);
            }
        }, 500)
    }

    onUserTabChange(index) {
        this.userSubIndex = index;
        this.$router.replace({
            path: 'cms_out_order',
            query: {
                listValue: this.transIndex()
            }
        });
    }

    onOutTabChange(index) {
        this.outSubIndex = index;
        this.$router.replace({
            path: 'cms_out_order',
            query: {
                listValue: this.transIndex()
            }
        });
    }

    onQuickTabChange(index) {
        this.quickSubIndex = index;
        this.$router.replace({
            path: 'cms_out_order',
            query: {
                listValue: this.transIndex()
            }
        });
    }
}