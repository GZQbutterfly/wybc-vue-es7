//进货订单
import BaseVue from 'base.vue';
import { Component } from 'vue-property-decorator';

import MultiTab from '../../../../commons/vue_plugins/components/multitab/multitab.vue';
import stockOrderService from './stock.order.service';
import { StockOrderItem } from './item/stock.order.item';
import './stock.order.scss';

@Component({
    template: require('./stock.order.html'),
    components: {
        multitab: MultiTab,
        oi: StockOrderItem
    }
})

export class StockOrder extends BaseVue {

    _$service;

    tabIndex = 0;

    dataStockList = [];

    noDataList = [false, false, false, false, false, false];

    pageList = [0, 0, 0, 0, 0, 0];

    data() {
        return {
            tabs: ['全部', '待付款', '待发货', '待收货', '交易完成', '交易关闭'],
            tabsStateList: [0, 1, 3, 4, 5, 6],
            index: this.tabIndex,
        }
    }

    created() {
        document.title = "我的订单";
        this._$service = stockOrderService(this.$store);
        this.tabIndex = Number(this.$route.query.listValue) ? Number(this.$route.query.listValue) : 0;
    }

    resetAllData() {

        this.dataStockList = [];

        this.noDataList = [false, false, false, false, false, false];

        this.pageList = [0, 0, 0, 0, 0, 0];

        this.fetchOrdersData('', this.tabIndex, 1, null);
    }

    onTabChange(index) {
        this.tabIndex = index;
        this.$router.replace({
            path: 'cms_stock_order', query: {
                listValue: this.tabIndex,
            }
        })
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
                orders[i].number = goodses[i].number;
                orders[i].moneyPrice = goodses[i].moneyPrice;
                order.goodses = new Array();
                order.orders = new Array();
                let combinOrderNo = order.combinOrderNo;
                //组合订单
                if (combinOrderNo && (order.orderState == 1 || order.orderState == 6)) {
                    while (orders[i] && orders[i].combinOrderNo && combinOrderNo == orders[i].combinOrderNo) {
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
                        if (element.orderId == order.id) {
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

    fetchOrdersData(keyword, index, page, done) {
        let self = this;
        let state = self.tabsStateList[index];
        this._$service.stockOrderList(keyword, state, page)
            .then((res) => {
                let _toast = self.$store.state.$toast;
                if (res.errorCode) {
                    _toast({ title: '获取数据失败', success: false });
                    if (done) {
                        done(true);
                    }
                } else {
                    let orders = self.formatServerData(res);
                    if (orders.length < 10) {
                        self.noDataList[index] = true;
                    } else {
                        self.noDataList[index] = false;
                    }


                    if (page == 1) {
                        self.$set(self.dataStockList, index, orders);
                    } else {
                        self.$set(self.dataStockList, index, self.dataStockList[index].concat(orders));
                    }

                    self.pageList[index] = page;

                    if (done) {
                        done(true);
                    }
                }
            }).catch((res) => {
                done(true);
            });
    }

    refresh(done) {
        let self = this;
        setTimeout(() => {
            self.fetchOrdersData('', self.tabIndex, 1, done);
        }, 500)
    }

    infinite(done) {
        let self = this;
        setTimeout(() => {
            if (!self.noDataList[self.tabIndex]) {
                self.fetchOrdersData('', self.tabIndex, self.pageList[self.tabIndex] + 1, done);
            } else {
                done(true);
            }
        }, 500)
    }
}
