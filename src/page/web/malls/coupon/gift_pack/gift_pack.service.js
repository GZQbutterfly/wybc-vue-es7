

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
         * 获取礼包
         */
        queryGiftPack() {
            return q('');
        },
        /**
         * 获取优惠券
         * @param {String} code 
         */
        queryCoupon(code) {
            return q('', { code });
        },
        /**
         * 拆礼包
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
            //             {
            //                 "couponId": 1,					//优惠券Id
            //                 "couponName": "新手大礼包",    //优惠券名称
            //                 "moneyPrice": 1500,        //优惠券面值
            //                 "minOrderPrice": 1500,    //使用最小金额限制    如果null则没有限制
            //                 "expiryDate": "2018-09-01",    //有效期
            //                 "validTimeDay": 24,          //24天内有效   validTimeDay和expiryDate二者有一个为空
            //                 "valid": 0,                    //0:作废   1:有效
            //                 "couponType": 0				//0:所有商品通用  1:部分商品可用
            //             }
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
            //         "coupon": [
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
};
