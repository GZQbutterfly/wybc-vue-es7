
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

        // 6， 配送中列表数据
        queryDeliveringOrderList(data = { page: 1, limit: 10 }) {

            return q('api/q_shopDelivery_list', merge({ state: 1 }, data));

            // return {
            //     data: {
            //         "data":									//店长配送List
            //             [
            //                 {
            //                     "deliveryMoney": 200,		//配送酬金
            //                     "combinOrderNo": 4879878978,  //组合订单号
            //                     "shopId": 488,
            //                     "deliveryTime": '2018-03-10 18:00:00',  //要求送达时间
            //                     "address": "肖迪 成都信息工程学院 15栋501",  //配送员姓名+详细地址字符串
            //                     "sex": 1 | 2,  //男生or 女生宿舍
            //                     "userPhone": 12345678901,   //联系买家电话
            //                     leftTime: 10000,
            //                    punishMen:10
            //                 },
            //                 {
            //                     "deliveryMoney": 200,		//配送酬金
            //                     "combinOrderNo": 4879878978,  //组合订单号
            //                     "shopId": 488,
            //                     "deliveryTime": '2018-03-10 18:00:00',  //要求送达时间
            //                     "address": "肖迪 成都信息工程学院 15栋501",  //配送员姓名+详细地址字符串
            //                     "sex": 1 | 2,  //男生or 女生宿舍
            //                     "userPhone": 12345678901,   //联系买家电话
            //                     leftTime: 100000
            //                 }
            //             ]
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
        },

        //快速仓开启状态 "state": 1    //开启状态   1:开启   2:关闭
        queryShopDeliverySate() {
            return q('api/q_shopDelivery_state');
        },

        // 检测该店主是否填写店长配送信息  "ifHasInfo":true   //是否已经填写店长配送信息   true:已经填写  false:未填写
        // "state": 1   //当且仅当ifHasInfo = true时才有此字段,开启状态   1:开启   2:关闭
        checkShopDeliveryInfo() {
            return q('api/check_fast_delivery_state');
        },

        //开启或者关闭快速仓
        changeFastDeliveryState(data) {
            return q('api/change_fast_delivery_state', data);
        }

    };
}