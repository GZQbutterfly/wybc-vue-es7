export default (store) => {
    let q = store.state.$http;

    return {
        /**
         * 公告
         * @param {*} data 
         */
        queryTopNotice(data) {
            return q('api/wd_vip/q_notice_user', data);
        },
        /**
         * banner
         * @param {*} data 
         */
        queryBannerList(data) {
            return q('api/q_store_ads', data);
        },
        /**
         * icon list
         * @param {*} data 
         */
        queryIconList(data) {
            return q('api/q_icons', data);
        },

        /**
        * 登陆用户检测是否已经领取过新手大礼包
        */
        queryCheckHasGift() {
            return q('api/activites/check_has_gifts');
        },
        checksGiftAvalid() {
            return q('api/activites/check_first_gifts_avalid')
        },
        /**
        * 拆新手礼包
        * @param {String} code 
        */
        async takeGiftPack(couponId) {
            return q('api/activites/get_gifts', { couponId });
            // return {
            //     data: {
            //         "gifts": [
            //             {
            //                 "couponId": 1,					//优惠券Id
            //                 "couponName": "新手大礼包",    //优惠券名称
            //                 "moneyPrice": 1500,        //优惠券面值
            //                 "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //                 "expiryDate": "2018-09-01",    //有效期
            //                 "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //                 "valid": 0,                    //0:作废   1:有效
            //                 "couponType": 0				//0:所有商品通用  1:部分商品可用
            //             },
            //             {
            //                 "couponId": 1,					//优惠券Id
            //                 "couponName": "新手大礼包",    //优惠券名称
            //                 "moneyPrice": 1500,        //优惠券面值
            //                 "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //                 "expiryDate": "2018-09-01",    //有效期
            //                 "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //                 "valid": 0,                    //0:作废   1:有效
            //                 "couponType": 0				//0:所有商品通用  1:部分商品可用
            //             },
            //         ]    //false:已经领取过; true:  还没有领取过
            //     }
            // }
        },
        /**
         * 领取优惠券
         */
        async takeCounpon(couponId, shopId) {
            return q('api/activites/user_get_coupon', { couponId, shopId });
            // return {
            //     data: {
            //         "gifts": [
            //             {
            //                 "couponId": 1,					//优惠券Id
            //                 "couponName": "优惠券名称",    //优惠券名称
            //                 "moneyPrice": 1500,        //优惠券面值
            //                 "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //                 "expiryDate": "2018-09-01",    //有效期
            //                 "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //                 "valid": 0,                    //0:作废   1:有效
            //                 "couponType": 0				//0:所有商品通用  1:部分商品可用
            //             },
            //             {
            //                 "couponId": 1,					//优惠券Id
            //                 "couponName": "优惠券名称",    //优惠券名称
            //                 "moneyPrice": 1500,        //优惠券面值
            //                 "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //                 "expiryDate": "2018-09-01",    //有效期
            //                 "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //                 "valid": 0,                    //0:作废   1:有效
            //                 "couponType": 0				//0:所有商品通用  1:部分商品可用
            //             },
            //         ]    //false:已经领取过; true:  还没有领取过
            //     }
            // }
        }

    }
}