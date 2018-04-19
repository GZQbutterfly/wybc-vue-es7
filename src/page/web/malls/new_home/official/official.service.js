export default (store) => {
    let q = store.state.$http;

    return {
        /**
         * 
         * @param {*} data 
         */
        async queryGoodsList(data) {

            return q('api/directSale/q_offcial_recommend', data);

            // return {
            //     data:
            //         {
            //             "goods": [
            //                 {
            //                     coverImg: "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420516183218/WebApp-goods-cover-420505183164-3.png",
            //                     coverImgDescription: "miaosu",
            //                     goodsId: 151,
            //                     goodsName: "tjl0225",
            //                     moneyPrice: 10037,
            //                     purchasePrice: 10037,
            //                     stockPrice: 10037,
            //                     couponCount: 1     //可用优惠券个数
            //                 },
            //                 {
            //                     coverImg: "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420516183218/WebApp-goods-cover-420505183164-3.png",
            //                     coverImgDescription: "miaosu",
            //                     goodsId: 151,
            //                     goodsName: "tjl0225",
            //                     moneyPrice: 10037,
            //                     purchasePrice: 10037,
            //                     stockPrice: 10037,
            //                     couponCount: 1     //可用优惠券个数
            //                 }
            //             ],
            //             "banner":			//
            //                 [{
            //                     "imgUrl": 'http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goodsClassify/ad/jpg/201801/1515742930178.jpg',
            //                     "goodsId": 193
            //                 }]
            //         }
            // };
        }

    };

}