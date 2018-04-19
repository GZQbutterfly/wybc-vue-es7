// import sse from './delivery.sse';

import { merge } from 'lodash';

export default (store) => {

    let _state = store.state;
    let _http = _state.$http;
    let _cache = _state.cache;
    let _key = 'delivery_order';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    let _timer = 0;

    return {
        // 1， 配送员信息
        // "checkState"://审核状态("配送员审核未提交",0),("配送员审核未处理",1),("配送员审核成功",2),("配送员审核未通过",3)
        async queryDelivererInfo(data) {
            let _result = (await q('api/q_shoper_delivery_check', data)).data;
            if (!_result || _result.errorCode) {
                return { checkState: 0, errorCode: _result.errorCode };
            } else {
                return _result;
            }
        },

        //查询后用户状态（("未提交申请",0),  ("未处理",1),    ("认证未通过",2),   ("异常",3),   ("认证成功",4);）
        async queryRealName(data) {
            let _result = (await q('api/q_real_name', data)).data;
            if (!_result || _result.errorCode) {
                return { state: 0, errorCode: _result.errorCode };
            } else {
                return _result;
            }
        },

        // 2， 实时查询认证结果
        // "checkState"://审核状态("配送员审核未提交",0),("配送员审核未处理",1),("配送员审核成功",2),("配送员审核未通过",3)
        queryAuthResult(data) {

            return this.queryDelivererInfo(data);
        },

        // 3， 配送单数量，（待抢单， 待取货， 配送中） 这个数量是提示在，刷新对应的列表时，应当重新请求再处理
        async queryDeliveryTabsNum(data) {
            let result = (await q('api/q_delivery_num', data)).data;
            if (result && !result.errorCode) {
                _state.deliveryVO.robNum = (+result.waitreceive) ? result.waitreceive : 0;
                _state.deliveryVO.pickupNum = (+result.waitgoods) ? result.waitgoods : 0;
                _state.deliveryVO.deliveringNum = (+result.onDelivery) ? result.onDelivery : 0;
            }
            return result;
        },

        // 4， 待抢单列表数据
        // 配送订单状态   2:待接单  6:待取货  7:配送中
        queryRobOrderList(data = { page: 1, limit: 10 }) {
            this.queryDeliveryTabsNum();

            return q('api/q_waite_orders', merge({ deliveryState: 2 }, data));

            // return {data:{data:[
            //     {
            //         "deliveryState": 5,			//单子状态 
            //         "combinOrderNo": "1564654879",  	//订单号
            //         "getAddress": "食堂门口",		//取货地点
            //         "getAddressDetail": "1231",			//取货详细地址
            //         "deliveryAddress": "123123123",			//配送地址
            //         "sex":1,
            //         "deliveryMoney": 200 		//本单收入
            //     },
            //     {
            //         "deliveryState": 6,			//单子状态 
            //         "combinOrderNo": "123465465",  	//订单号
            //         "getAddress": "食堂门口",		//取货地点
            //         "getAddressDetail": "123123",			//取货详细地址
            //         "deliveryAddress": "12313",		//配送地址
            //         "deliveryMoney": 200 		//本单收入
            //     }
            // ]}}

        },

        // 5， 待取货列表数据
        queryPickupOrderList(data = { page: 1, limit: 10 }) {
            return this.queryRobOrderList(merge({ deliveryState: 6 }, data));
        },

        // 6， 配送中列表数据
        queryDeliveringOrderList(data = { page: 1, limit: 10 }) {
            return this.queryRobOrderList(merge({ deliveryState: 7 }, data));
        },

        // 7， 抢单推送
        robOrderEventSource(url, data, callBack) {
            //return sse.sent(url, data, callBack);
            let timNum = Math.floor(Math.random() * 6000 + 5000);
            console.log('获取抢单信息：定时器 ', timNum);
            _timer = setInterval(async () => {
                if (!_state.deliveryVO.lockNotice) {
                    let _result = (await q(url, data));
                    console.log('rob', _result);
                    // if (!_result.data) {
                    //     _result = {
                    //         data: {
                    //             "totalMoney": 18.8, // 金额,
                    //             "getAddress": "建设路",  //取货地址名
                    //             "getAddressDetail": "建设路11号", //取货具体地址"
                    //             "deliveryAddress": "送货地址",
                    //             "combinOrderNo": "123465465", //订单号
                    //             "countDownTime": 15,
                    //             sex:2
                    //         }
                    //     }
                    // }
                    callBack(_result);
                }
            }, timNum);
            return {
                close() {
                    window.clearInterval(_timer);
                }
            }
        },

        // 8， 接单结果
        receivedOrderResult(data) {
            return q('api/rob_delivery_order', data);
        },

        // 9 取货接口
        updatedDeliverOrderState(data) {
            return q('api/get_delivery_goods', data);
        },

        // 10 联系商家

        queryMerchantsPhone(data) {
            return q('api/q_sorted_phone', data);
        },


        // 11 联系卖家
        queryBuyerPhone(data) {
            return q('api/q_buyer_info', data);
        },

        // 12 确认送达

        confirmationOfDelivery(data) {
            return q('api/confirm_receipt', data);
        }

    };
}