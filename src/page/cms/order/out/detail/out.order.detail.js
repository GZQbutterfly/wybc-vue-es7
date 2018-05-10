import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import orderDetailService from './out.order.detail.service';
import { getLocalUserInfo, toWEB } from 'common.env';



import './out.order.detail.scss';

@Component({
    template: require('./out.order.detail.html')
})


export class OutOrderDetail extends BaseVue {

     _$service ;
     orderId;
     outState;
    timerID;
    orderTimer = {
        int_hour: 0,
        int_minute: 0,
        int_second: 0
    };

    orderInfo = {};

    //当前店铺折扣
    curShopBuyDisct = 100;

    orderGoods = [];

    rebate = {};

    mounted() {
        //订单编号
        let _query = this.$route.query || {};
        let self = this;
        self._$service = orderDetailService(self.$store);
        let _params = {
            orderId:_query.orderId,
            combinOrderNo:_query.combinOrderNo,
        }
        self.$nextTick(() => {
            self._$service.getOrderInfo(_params)
                .then(res => {
                    if (!res || res.errorCode) {
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
                        self.$store.state.$dialog({ dialogObj });
                    } else {
                        self.orderInfo = res.data.order;
                        self.orderGoods = res.data.orderGoods;
                        self.rebate = res.data.rebate;
                    }
                })
        })

    }

    toGoodsDetail(goodsId) {
        let self = this;
        self.$router.push({
            path: 'cms_purchase_goods_detail',
            query: {
                goodsId: goodsId,
            }
        });
        // this._$service.upShopInfo(getLocalUserInfo().userId)
        //     .then(res => {
        //         if (res && !res.errorCode) {
        //             if (res.data && res.data.infoId) {
        //                 let dialogObj = {
        //                     title: '',
        //                     content: '即将进入您的当前进货店铺：' + res.data.wdName,
        //                     assistBtn: '取消',
        //                     mainBtn: '确定',
        //                     type: 'info',
        //                     assistFn() {

        //                     },
        //                     mainFn() {
                               
        //                     }
        //                 };
        //                 self.$store.state.$dialog({ dialogObj });
        //             }
        //         }
        //     })
    }
}
