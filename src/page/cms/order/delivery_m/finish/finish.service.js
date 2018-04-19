

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

        queryDeliveryOrderSucceedList(data) {
            return q('api/q_shopDelivery_list', { state: 2, ...data });

            // return {
            //     data: {
            //         "data":									//店长配送List
            //             [
            //                 {
            //                     "deliveryState": 1,            //单子状态
            //                     "deliveryMoney": 200,		//配送酬金
            //                     "combinOrderNo": 4879878978,  //组合订单号
            //                     "shopId": 488,
            //                     "deliveryTime": '2018-03-10 18:00:00',  //要求送达时间
            //                     "address": "肖迪 成都信息工程学院 15栋501",  //配送员姓名+详细地址字符串
            //                     "sex": 1 | 2,  //男生or 女生宿舍
            //                     "userPhone": 12345678901,   //联系买家电话
            //                     leftTime: 10000,
            //                     finishTime: '2018-03-10 17:00:00'
            //                 },
            //                 {
            //                     "deliveryState": 2,            //单子状态
            //                     "deliveryMoney": 200,		//配送酬金
            //                     "combinOrderNo": 4879878978,  //组合订单号
            //                     "shopId": 488,
            //                     "deliveryTime": '2018-03-10 18:00:00',  //要求送达时间
            //                     "address": "肖迪 成都信息工程学院 15栋501",  //配送员姓名+详细地址字符串
            //                     "sex": 1 | 2,  //男生or 女生宿舍
            //                     "userPhone": 12345678901,   //联系买家电话
            //                     leftTime: 100000,
            //                     finishTime: '2018-03-10 22:00:00'
            //                 }
            //             ]
            //     }
            // };
        },

        queryDeliveryFinishDetail(data) {
            return q('api/q_fastDelivery_detail', data);
            // return {
            //     data: {
            //         "leftTime": 1000,   //剩余时间的时间戳
            //         "deliveryTime": 1520663168666, //
            //         "finishTime": 1520663188666,
            //         "delivery": {
            //             "combinOrderNo": "25299812194340",
            //             "totalMoney": 1200,                   //订单总价
            //             "receiveUserId": 113,
            //             "receiveWdName": null,
            //             "getAddress": "老食堂门口",
            //             "getAddressDetail": "老食堂门口2号门",
            //             "address": "西南民族大学（航空港校区）南区一栋考虑考虑",
            //             "deliveryState": 1,			//配送状态  1:配送中  2:配送完成
            //             "campusId": 9,
            //             "branchId": 1,
            //             "deliveryMoney": 2,//本单收入
            //             "sex": 1,						//1: 男生宿舍，2: 女生宿舍
            //             "buyerPhone": 12345678901   //买家电话
            //         },
            //         "orders": [
            //             {
            //                 "number": 1,
            //                 "moneyPrice": 1200,	//实际价格  RMB消费（用户消费）：原价==实际价格，金币购：原价不一定==实际价格
            //                 "goodsName": "卤惑铺子鸭翅",
            //                 "purchasePrice": 1300,	//原价
            //                 "consuType": 1,      //消费方式
            //             },
            //             {
            //                 "number": 1,
            //                 "moneyPrice": 1200,
            //                 "goodsName": "卤惑铺子鸭翅",
            //                 "purchasePrice": 1300,	//原价
            //                 "consuType": 1,      //消费方式
            //             }
            //         ]
            //     }
            // }
        },


        // 11 联系卖家
        queryBuyerPhone(data) {
            return q('api/q_buyer_info', data);
        },

        // 12 确认送达

        confirmationOfDelivery(data) {
            return q('api/confirm_finish_delivery', data);
        }
    };
}