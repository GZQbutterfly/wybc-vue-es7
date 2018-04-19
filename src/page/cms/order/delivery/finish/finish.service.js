

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
            return q('api/q_delivery_his', data);

            // return {
            //     data: {
            //         "data": [
            //             {
            //                 "deliveryState": 11,			//单子状态
            //                 "combinOrderNo": 1564654879,  	//订单号
            //                 "getAddress": "食堂门口",		//取货地点
            //                 "getAdressDetail": "234234234",			//取货详细地址
            //                 "deliveryAddress": "24243234",		//配送地址
            //                 "deliveryMoney": 200,			//本单收入(分)
            //                 "optTime": "2018-01-02 11:11:11"//完成时间
            //                 ,sex:1
            //             },
            //             {
            //                 "deliveryState": 10,			//单子状态 
            //                 "combinOrderNo": 1564654879,  	//订单号
            //                 "getAddress": "食堂门口",		//取货地点
            //                 "getAdressDetail": "234234",		//取货详细地址
            //                 "deliveryAddress": "234234",		//配送地址
            //                 "deliveryMoney": 200,	    //本单收入 (分)
            //                 "optTime": "2018-01-02 11:11:11" //完成时间
            //                 ,sex:1
            //             },{
            //                 "deliveryState": 11,			//单子状态
            //                 "combinOrderNo": 1564654879,  	//订单号
            //                 "getAddress": "食堂门口",		//取货地点
            //                 "getAdressDetail": "234234234",			//取货详细地址
            //                 "deliveryAddress": "24243234",		//配送地址
            //                 "deliveryMoney": 200,			//本单收入(分)
            //                 "optTime": "2018-01-01 11:11:11" //完成时间
            //                 ,sex:1
            //             },
            //             {
            //                 "deliveryState": 10,			//单子状态 
            //                 "combinOrderNo": 1564654879,  	//订单号
            //                 "getAddress": "食堂门口",		//取货地点
            //                 "getAdressDetail": "234234",		//取货详细地址
            //                 "deliveryAddress": "234234",		//配送地址
            //                 "deliveryMoney": 200,	    //本单收入 (分)
            //                 "optTime": "2018-01-01 11:11:11" //完成时间
            //                 ,sex:1
            //             },
            //             {
            //                 "deliveryState": 11,			//单子状态
            //                 "combinOrderNo": 1564654879,  	//订单号
            //                 "getAddress": "食堂门口",		//取货地点
            //                 "getAdressDetail": "234234234",			//取货详细地址
            //                 "deliveryAddress": "24243234",		//配送地址
            //                 "deliveryMoney": 200,			//本单收入(分)
            //                 "optTime": "2017-12-31 11:11:11" //完成时间
            //                 ,sex:1
            //             },
            //             {
            //                 "deliveryState": 10,			//单子状态 
            //                 "combinOrderNo": 1564654879,  	//订单号
            //                 "getAddress": "食堂门口",		//取货地点
            //                 "getAdressDetail": "234234",		//取货详细地址
            //                 "deliveryAddress": "234234",		//配送地址
            //                 "deliveryMoney": 200,	    //本单收入 (分)
            //                 "optTime": "2017-12-31 11:11:11" //完成时间
            //                 ,sex:1
            //             }
            //         ]
            //     }
            // }
        },

        queryDeliveryFinishDetail(data) {
            return q('api/q_delivery_detail', data);
            // return {
            //     data: {
            //         "delivery": {
            //             "combinOrderNo": "25299812194340",
            //             "totalMoney": 1200,
            //             "receiveUserId": 113,
            //             "receiveUserName": null,
            //             "receiveUserPhone": null,
            //             "receiveWdName": null,
            //             "getAddress": "老食堂门口",
            //             "getAddressDetail": "老食堂门口2号门",
            //             "deliveryAddress": "西南民族大学（航空港校区）南区一栋考虑考虑",
            //             "receiveTime": "2018-02-07 15:33:19",
            //             sex:1,
            //             "receiveType": 1,
            //             "deliveryState": 11,
            //             "campusId": 9,
            //             "branchId": 1,
            //             "deliveryMoney": 0,
            //             "sortUserId": null,
            //             "branchUserId": null,
            //             "branchUserName": null,
            //             "branchUserPhone": null,
            //             "buyerName": null,
            //             "buyerPhone": null,
            //             "autoReceiveTime": null,
            //             "version": null,
            //             "optTime": null
            //         },
            //         "orders": [
            //             {
            //                 "number": 1,
            //                 "moneyPrice": 1200,
            //                 "goodsName": "卤惑铺子鸭翅"
            //             },
            //             {
            //                 "number": 1,
            //                 "moneyPrice": 1200,
            //                 "goodsName": "卤惑铺子鸭翅"
            //             }
            //         ]
            //     }
            // }
        }
    }
}