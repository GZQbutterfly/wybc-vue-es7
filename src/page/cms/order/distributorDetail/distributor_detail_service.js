

export default (store) => {
    let _state = store.state;
    let _http = _state.$http;
    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    return {

        async queryDeliveryOrderDetail(data) {
            return q('api/q_delivery_detail', data);

            // return {
            //     data:
            //         {
            //             "delivery": {
            //                 "combinOrderNo": "25299812194340",
            //                 "totalMoney": 1200,
            //                 "receiveUserId": 113,
            //                 "receiveUserName": null,
            //                 "receiveUserPhone": null,
            //                 "receiveWdName": null,
            //                 "getAddress": "老食堂门口",
            //                 "getAddressDetail": "老食堂门口2号门",
            //                 "deliveryAddress": "西南民族大学（航空港校区）南区一栋考虑考虑",
            //                 sex:2,
            //                 "receiveTime": "2018-02-07 15:33:19",
            //                 "receiveType": 1,
            //                 "deliveryState":11,
            //                 "campusId": 9,
            //                 "branchId": 1,
            //                 "deliveryMoney": 0,
            //                 "sortUserId": null,
            //                 "branchUserId": null,
            //                 "branchUserName": null,
            //                 "branchUserPhone": null,
            //                 "buyerName": null,
            //                 "buyerPhone": null,
            //                 "autoReceiveTime": null,
            //                 "version": null,
            //                 "optTime": null
            //             },
            //             "orders": [
            //                 {
            //                     "number": 1,
            //                     "moneyPrice": 1200,
            //                     "goodsName": "卤惑铺子鸭翅"
            //                 },
            //                 {
            //                     "number": 1,
            //                     "moneyPrice": 1200,
            //                     "goodsName": "卤惑铺子鸭翅"
            //                 }
            //             ]
            //         }

            // }
        },
        // 接单结果
        receivedOrderResult(data) {
            data.shopId = _state.workVO.user.userId;
            return q('api/rob_delivery_order', data);
        },

        // 取货接口
        updatedDeliverOrderState(data) {
            data.shopId = _state.workVO.user.userId;
            return q('api/get_delivery_goods', data);
        },
        //确认送达
        confirmationOfDelivery(data) {
            return q('api/confirm_receipt', data);
        }
    }
}