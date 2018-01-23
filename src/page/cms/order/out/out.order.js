// 出貨訂單
import BaseVue  from 'base.vue';
import { Component } from 'vue-property-decorator';
import  MultiTab  from '../../../../commons/vue_plugins/components/multitab/multitab.vue';
import shipOrderListService from './out.order.service';
import { OutOrderItem } from './item/out.order.item';


import './out.order.scss';
@Component({
    template: require('./out.order.html'),
    components: {
        multitab: MultiTab,
        oi: OutOrderItem
    }
})
export class OutOrder extends BaseVue {

    _$service;

    tabIndex = 0;

    subTableIndex = 0;

    dataShipmentList = [[], [], [], []];

    noDataList = [false, false, false, false];

    pageList = [0, 0, 0, 0];

    data() {
        if (Number(this.$route.query.listValue) && Number(this.$route.query.listValue) >= 2) {
            this.tabIndex = 2;
        } else {
            this.tabIndex = Number(this.$route.query.listValue) ? Number(this.$route.query.listValue) : 0;
        }
        this.subTableIndex = Number(this.$route.query.listValue) >= 2 ? Number(this.$route.query.listValue) - 2 : 0;

        return {
            tabs: ['待进货', '交易完成', '返利订单'],
            custStyle: {
                lineColor: '#f2f2f2',
                itemColor: '#FFFFFF',
                lineOnColor: '#7ecc44',
                itemOnColor: '#7ecc44',
                textColor: '#333333',
                textOnColor: '#FFFFFF'
            },
            tabIndex: this.tabIndex,
            subTableIndex: this.subTableIndex,
            subTabs: ['进行中', '已返利'],
        }
    }

    mounted() {
        this._$service = shipOrderListService(this.$store);

        let self = this;
        this.$nextTick(() => {
            if (Number(self.$route.query.listValue) && Number(self.$route.query.listValue) >= 2) {
                self.tabIndex = 2;
            } else {
                self.tabIndex = Number(self.$route.query.listValue) ? Number(self.$route.query.listValue) : 0;
            }
            self.subTableIndex = Number(self.$route.query.listValue) >= 2 ? Number(self.$route.query.listValue) - 2 : 0;
        })
    }

    resetAllData() {
        this.dataShipmentList = [[], [], [], []];
        this.noDataList = [false, false, false, false];
        this.pageList = [0, 0, 0, 0];
        this.fetchOrdersData('', this.currentOrderState(), 1, null);
    }

    onTabChange(index) {
        this.tabIndex = index;
        this.$router.replace({
            path: 'cms_out_order',
            query: {
                listValue: this.tabIndex + this.subTableIndex,
            }
        })

        if (this.pageList[this.currentOrderState() - 1] == 0) {
            this.fetchOrdersData('', this.currentOrderState(), 1, null);
        }
    }

    onSubTabChange(index) {
        this.subTableIndex = index;
        this.$router.replace({
            path: 'cms_out_order',
            query: {
                listValue: this.tabIndex + this.subTableIndex,
            }
        })
        if (this.pageList[this.currentOrderState() - 1] == 0) {
            this.fetchOrdersData('', this.currentOrderState(), 1, null);
        }
    }

    formatServerData(res, outState) {
        let data = res.data;
        let orderList = [];
        let orders = data.orderWhole;
        if (orders) {
            //商品列表
            let goodses = data.orderGoods;
            //提成信息
            let commi = data.orderCommi;
            for (let i = 0; i < orders.length; ++i) {
                let order = orders[i];
                order.goodses = new Array();
                for (let k = 0; k < goodses.length; ++k) {
                    let goods = goodses[k]
                    if (goods.orderId == order.orderId) {
                        goods.moneyPrice = order.moneyPrice;
                        order.goodses.push(goods);
                    }
                }

                if (commi && commi.length > 0) {
                    for (var index = 0; index < commi.length; index++) {
                        var element = commi[index];
                        if (element.orderId == order.orderId) {
                            order.commi = element;
                            break;
                        }
                    }
                }
                order.outState = outState;
                orderList.push(order);
            }
        }
        return orderList;
    }

    fetchOrdersData(keyword, state, page, done) {
        let self = this;
        this._$service.shipOrderListIndex(keyword, state, page)
            .then((res) => {
                let _toast = self.$store.state.$toast;
                if (res.errorCode) {
                    _toast({ title: '获取数据失败', success: false });
                    if (done) {
                        done(false);
                    }
                } else {
                    let orders = self.formatServerData(res, state);
                    if (orders.length < 10) {
                        self.noDataList[state - 1] = true;
                    } else {
                        self.noDataList[state - 1] = false;
                    }
                    if (page == 1) {
                        self.$set(self.dataShipmentList, state - 1, orders);
                    } else {
                        self.$set(self.dataShipmentList, state - 1, self.dataShipmentList[state - 1].concat(orders));
                    }
                    self.pageList[state - 1] = page;
                    if (done) {
                        done(true);
                    }
                }
            }).catch((res) => {
                done(true);
            });
    }

    currentOrderState() {
        if (this.tabIndex == 2) {
            return this.tabIndex + 1 + this.subTableIndex;
        } else {
            return this.tabIndex + 1;
        }
    }

    refresh(done) {
        let self = this;
        setTimeout(() => {
            self.$set(self.dataShipmentList,self.currentOrderState()-1,[]);
            self.fetchOrdersData('', self.currentOrderState(), 1, done);
        }, 500)
    }

    infinite(done) {
        let self = this;
        setTimeout(() => {
            if (self.noDataList[self.currentOrderState() - 1]) {
                done(true);
            } else {
                self.fetchOrdersData('', self.currentOrderState(), self.pageList[self.currentOrderState() - 1] + 1, done);
            }
        }, 500)
    }
}
