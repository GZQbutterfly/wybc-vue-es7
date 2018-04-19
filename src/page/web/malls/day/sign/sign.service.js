export default (store) => {
    let _state = store.state;
    let _http = _state.$http;

    function q(url, data, type = 'post') {
        return _http({
            data: data,
            url: url,
            method: type
        });
    }

    return {
        /**
         * 签到开关
         * @return {"success": true,  //请求状态"status": 0   //签到开关：0：关闭 1：开启}
         */
        querySignSwitchStatus() {
            return q('api/sign/q_switch_status');
        },
        /**
         * 查询签到信息
         * @param {*} data 
         */
        querySignStatus(data) {
            let userId = _state.workVO.user.userId;
            return q(`api/sign/today_is_sign/${userId}`, { ...data }, 'get');
            // return {
            //     data: {
            //         "signRulesDay": {
            //             "daySignRulesId": 167,  //签到奖励id
            //             "day": 3,      //签到日期 （3号）
            //             "awardType": 0,   //奖品类型（0：金币；1：优惠券）
            //             "awardInfo": 100, //奖励数量，优惠券id等,目前就是奖励金币数量
            //             "awardName": "金币"  //奖励名称
            //         },
            //         "state": false   //用户今日签到状态 true:已签到，false:未签到
            //     }
            // }
        },
        /**
         * 用户签到
         * @param {*} data {userId}
         */
        setSignIn(data) {
            return q('api/sign/user_sign', data)
        },

        /**
         * 点击领取累计签到奖励
         * @param {*} data 
         */
        getSignGold(data) {
            return q('api/sign/to_get_days_award', data)
        },

        /**
         * 查询签到记录
         * @param {*} data {userId, type}
         * userId : 1, //用户id
         * type : 1,  // type:1 查询当月的签到记录；type:2 查询本月和上一月的签到记录
         */
        querySignDays(data) {
            return q('api/sign/q_sign_record_lists', data, 'get');
            // return {
            //     data: {
            //         "awardTotal": 100,   //累计获取数量
            //         "signRecordList": [
            //             {
            //                 "signRecordId": 3, //签到记录id
            //                 "userId": 1106, //用户id 
            //                 "signTime": "2018-04-03 14:13:31", //签到时间
            //                 "getTime": null,  //领取累计奖励时间，为空，则是每日签到      不为空，则是领取累计签到奖励
            //                 "signRulesId": 167,  //签到规则id
            //                 "awardType": 0,  //奖品类型（0：金币；1：优惠券）
            //                 "awardInfo": 100, //奖励数量，优惠券id等,目前就是奖励金币数量
            //                 "awardName": "金币", //奖励名称
            //                 "state": true, //签到状态
            //                 day: 1
            //             },
            //             {
            //                 "signRecordId": 3, //签到记录id
            //                 "userId": 1106, //用户id 
            //                 "signTime": "2018-04-03 14:13:31", //签到时间
            //                 "getTime": '2018-04-03 14:13:31',  //领取累计奖励时间，为空，则是每日签到      不为空，则是领取累计签到奖励
            //                 "signRulesId": 167,  //签到规则id
            //                 "awardType": 0,  //奖品类型（0：金币；1：优惠券）
            //                 "awardInfo": 100, //奖励数量，优惠券id等,目前就是奖励金币数量
            //                 "awardName": "金币", //奖励名称
            //                 "state": true, //签到状态
            //                 day: 2
            //             }
            //         ],
            //         "signCount": 1  //本月累计签到天数
            //     }
            // }
        },
        /**
         * 获取当月累计签到奖励数据
         * @param {*} data 
         */
        querySignAwardList(data) {
            return q(`api/sign/q_sign_award_lists`, data, 'get');
            // return {
            //     data: {
            //         "signAwardDaysList": [
            //             {
            //                 "daysSignRulesId": 13,  //签到奖励规则id
            //                 "daysCount": 7,  //需累计签到的天数
            //                 "awardType": 0, //奖品类型（0：金币；1：优惠券）
            //                 "awardInfo": 2,   //奖励数量，优惠券id等,目前就是奖励金币数量
            //                 "awardName": "金币",   //奖励名称
            //                 "is_get": true //是否领取
            //             },
            //             {
            //                 "daysSignRulesId": 13,  //签到奖励规则id
            //                 "daysCount": 7,  //需累计签到的天数
            //                 "awardType": 0, //奖品类型（0：金币；1：优惠券）
            //                 "awardInfo": 5,   //奖励数量，优惠券id等,目前就是奖励金币数量
            //                 "awardName": "金币",   //奖励名称
            //                 "is_get": true //是否领取
            //             },
            //             {
            //                 "daysSignRulesId": 14,
            //                 "daysCount": 1,
            //                 "awardType": 0,
            //                 "awardInfo": 50,
            //                 "awardName": "金币",
            //                 "is_get": false
            //             },
            //             {
            //                 "daysSignRulesId": 15,
            //                 "daysCount": 30,
            //                 "awardType": 0,
            //                 "awardInfo": 110,
            //                 "awardName": "金币",
            //                 "is_get": false
            //             }
            //         ],
            //         "signCount": 1  //本月累计签到天数
            //     }
            // }
        }
    };
}