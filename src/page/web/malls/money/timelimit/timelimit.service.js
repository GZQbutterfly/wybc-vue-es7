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
        /**
         * timelimit banner
         * @param {Object} data {campusId}
         */
        queryTimelimitBanner(data) {

            // console.log('loadding queryTimelimitBanner params: ', data);

            return q('api/limited/q_limited_state_goods', data);
            // return {
            //     data: {
            //         state: 1, //限时购总开关   0:关闭  即不显示  1:开启
            //         periodState: 6,  //最近分场的状态   6:进行中  5:未开始
            //         periodStart: 16, //开始时间  16点场
            //         leftTimeStamp: 156879,  //剩余时间或者即将开启时间的时间差
            //         goodsList:	//商品列表
            //             [
            //                 {
            //                     "goodsId": 228,   //商品Id
            //                     "moneyPrice": 100,  //限时购价格
            //                     "purchasePrice": 200, //原价
            //                     "coverImg": 'http://wybc-xhjx.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/goods/jpg/201802/1519452049405.jpg'  //封面图片链接
            //                 },
            //                 {
            //                     "goodsId": 228,   //商品Id
            //                     "moneyPrice": 100,  //限时购价格
            //                     "purchasePrice": 200, //原价
            //                     "coverImg": 'http://wybc-xhjx.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/goods/jpg/201802/1519452049405.jpg'    //封面图片链接
            //                 },
            //                 {
            //                     "goodsId": 228,   //商品Id
            //                     "moneyPrice": 100,  //限时购价格
            //                     "purchasePrice": 200, //原价
            //                     "coverImg": 'http://wybc-xhjx.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/goods/jpg/201802/1519452049405.jpg'    //封面图片链接
            //                 },
            //                 {
            //                     "goodsId": 228,   //商品Id
            //                     "moneyPrice": 100,  //限时购价格
            //                     "purchasePrice": 200, //原价
            //                     "coverImg": 'http://wybc-xhjx.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/goods/jpg/201802/1519452049405.jpg '   //封面图片链接
            //                 }
            //             ]
            //     }
            // }
        },
        /**
         * 查看限时购全部的时段
         * @param {Object} data {campusId}
         */
        queryTimelimitListForTitle(data) {
            return q('api/limited/q_all_period_time', data);
            // return
            // return {
            //     data: {
            //         periodList:  //时段的列表
            //             [
            //                 {
            //                     periodId: 1234,  //分场的Id
            //                     periodDay: '2018-03-22',  //分场年月日
            //                     periodStart: '08:00:00', //分场开启时间
            //                     periodEnd: '09:59:59',   //分场结束时间
            //                     state: 6,  //  分场状态  5:未开始  6:进行中
            //                 },
            //                 {
            //                     periodId: 1234,  //分场的Id
            //                     periodDay: '2018-03-22',  //分场年月日
            //                     periodStart: '10:00:00', //分场开启时间
            //                     periodEnd: '10:59:59',   //分场结束时间
            //                     state: 5,  //  分场状态  5:未开始  6:进行中
            //                 },
            //                 {
            //                     periodId: 1234,  //分场的Id
            //                     periodDay: '2018-03-22',  //分场年月日
            //                     periodStart: '12:00:00', //分场开启时间
            //                     periodEnd: '13:59:59',   //分场结束时间
            //                     state: 5,  //  分场状态  5:未开始  6:进行中
            //                 },
            //                 {
            //                     periodId: 1234,  //分场的Id
            //                     periodDay: '2018-03-22',  //分场年月日
            //                     periodStart: '14:00:00', //分场开启时间
            //                     periodEnd: '14:59:59',   //分场结束时间
            //                     state: 5,  //  分场状态  5:未开始  6:进行中
            //                 }
            //             ]
            //     }
            // }
        },
        /**
         * 根据时间段 查询对应的数据集
         * @param {Object} data {campusId, periodId}
         */
        queryTimelimitListForBody(data) {
            // console.log('loadding queryTimelimitListForBody data: ', data);
            return q('api/limited/q_period_goodsInfo', data);
            // return {
            //     data: {
            //         periodId: 1234,
            //         periodDay: "2018-03-22",  //分场日期
            //         periodStart: "16:00:00",	//分场开启时间
            //         periodEnd: "17:59:59",	//结束时间
            //         periodState: 6,  //分场状态  5:未开始  6:进行中
            //         leftTimeStamp: 156879,  //剩余时间或者即将开启时间的时间差
            //         goodsList:
            //             [
            //                 {
            //                     "goodsId": 228,   //商品Id
            //                     goodsName: "商品",	//商品名
            //                     "moneyPrice": 100,  //限时购价格
            //                     "purchasePrice": 200, //原价
            //                     "coverImg": 'http://wybc-xhjx.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/goods/jpg/201802/1519452049405.jpg',//    //封面图片链接
            //                     "limitedStock": 10,   //分场总库存
            //                     "seldGoods": 8      //已销售库存
            //                 },
            //                 {
            //                     "goodsId": 228,   //商品Id
            //                     goodsName: "商品",	//商品名
            //                     "moneyPrice": 100,  //限时购价格
            //                     "purchasePrice": 200, //原价
            //                     "coverImg": 'http://wybc-xhjx.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/goods/jpg/201802/1519452049405.jpg',//    //封面图片链接
            //                     "limitedStock": 10,   //分场总库存
            //                     "seldGoods": 10      //已销售库存
            //                 },
            //                 {
            //                     "goodsId": 228,   //商品Id
            //                     goodsName: "商品",	//商品名
            //                     "moneyPrice": 100,  //限时购价格
            //                     "purchasePrice": 200, //原价
            //                     "coverImg": 'http://wybc-xhjx.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/goods/jpg/201802/1519452049405.jpg',//    //封面图片链接
            //                     "limitedStock": 10,   //分场总库存
            //                     "seldGoods": 10      //已销售库存
            //                 },
            //                 {
            //                     "goodsId": 228,   //商品Id
            //                     goodsName: "商品",	//商品名
            //                     "moneyPrice": 100,  //限时购价格
            //                     "purchasePrice": 200, //原价
            //                     "coverImg": 'http://wybc-xhjx.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/goods/jpg/201802/1519452049405.jpg',//    //封面图片链接
            //                     "limitedStock": 10,   //分场总库存
            //                     "seldGoods": 8      //已销售库存
            //                 }
            //             ]
            //     }
            // }
        },

        /**
         * 设置提醒
         * @param {*} data  {userId, periodId, goodsId, shopId}
         */
        setLimitedRemind(data) {
            return q('api/limited/set_limited_remind', data);
        },
        /**
         * 取消限时购提醒
         * @param {*} data  {userId, periodId, goodsId, shopId}
         */
        cancelLimitedRemind(data) {
            return q('api/limited/cancel_limited_remind', data);
        },
        /**
         * 提醒列表
         * @param {*} data  {userId,shopId}
         */
        queryUserRemindList(data) {
            return q('api/limited/q_user_remind_list', data);

            // return {
            //     data: {
            //         "data":
            //             [
            //                 {
            //                     periodDay: '2018-03-26',
            //                     periodStart: '12:0000',
            //                     periodEnd: '13:59:59',
            //                     state: 6,	//5:未开始  6:进行中
            //                     goodsList:[
            //                         {
            //                             "goodsName": "商品名",
            //                             "moneyPrice": 200,  //折扣价
            //                             "purchasePrice": 1000,  //原价
            //                             "goodsId": 1,
            //                             "limitedStock": 10, //投入库存
            //                             "leftStock": 2,  // 当state=6进行中时,leftStock表示剩余库存
            //                         },
            //                         {
            //                             "goodsName": "商品名",
            //                             "moneyPrice": 200,  //折扣价
            //                             "purchasePrice": 1000,  //原价
            //                             "goodsId": 1,
            //                             "limitedStock": 10,  //投入库存
            //                             "leftStock": 0  // 当state=6进行中时,leftStock表示剩余库存
            //                         }
            //                     ]
            //                 },
            //                 {
            //                     periodDay: '2018-03-26',
            //                     periodStart: '14:0000',
            //                     periodEnd: '16:59:59',
            //                     state: 5, 	//5:未开始  6:进行中
            //                     goodsList:[
            //                         {
            //                             "goodsName": "商品名",
            //                             "moneyPrice": 200, //折扣价
            //                             "purchasePrice": 1000,  //原价
            //                             "goodsId": 1,
            //                             "limitedStock": 10, //投入库存
            //                             "leftStock": 2,  // 当state=6进行中时,leftStock表示剩余库存
            //                         },
            //                         {
            //                             "goodsName": "商品名",
            //                             "moneyPrice": 200, //折扣价
            //                             "purchasePrice": 1000,  //原价
            //                             "goodsId": 1,
            //                             "limitedStock": 10,  //投入库存
            //                             "leftStock": 2,  // 当state=6进行中时,leftStock表示剩余库存
            //                         }
            //                     ]
            //                 }

            //             ]
            //     }
            // }
        }
    };

}