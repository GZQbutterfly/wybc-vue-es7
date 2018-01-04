

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    //  api/q_api_goods_stock_order   api/order_out/q_wait_orders
    let querywaitorders = 'api/q_api_goods_stock_order';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        /**
         * 获取搜索结果
         * @param goodsId 关键词
         * @param page 页码
         * @param limit 单页数据数
         */
        queryWaitOrders(goodsId, page, limit) {
            let data = {
                goodsId: goodsId,
                page: page,
                limit: limit,
                shopId: _state.workVO.user.userId
            };
            return q(querywaitorders, data);
            // let list = {
            //     "data": [													//我的库存中的商品详情-订单部分
            //         // {
            //         //     "orderId": 5,								//订单ID
            //         //     "userId": 1,								//用户Id
            //         //     "shopId": null,							//店铺Id
            //         //     "goodsId": 3,								//商品ID
            //         //     "orderNo": "25206461189065",				//订单号
            //         //     "combinOrderNo": "25206461189060",		//父订单号（支付单号，仅在待支付时有用），如果是查询待支付的把相同的父订单号订单列在一起支付
            //         //     "number": 50,								//数量
            //         //     "moneyPrice": 2,							//单价
            //         //     "totalMoney": 10,							//总价
            //         //     "shopSaleDisct": null,					//商家售卖折扣率
            //         //     "shopBuyDisct": null,						//商家购买折扣率
            //         //     "shopIncome": null,						//商铺收入
            //         //     "acceptStatus": false,					//接受状态
            //         //     "payType": null,							//支付类型
            //         //     "payTime": null,							//支付时间
            //         //     "acceptTime": null,						//接受时间
            //         //     "throwTime": null,						//抛单时间
            //         //     "orderState": 1,							//订单状态
            //         //     "userVipGrade": 1,						//用户店铺VIP等级	//0为普通用户，订单为用户订单，反之为进货订单
            //         //     "saleVipGrade": null,						//售卖店铺VIP等级	//0为商城
            //         //     "buyerName": 'xxxx',							//显示名字，userVipGrade：0 ，用户名字，userVipGrade>1：店铺名字
            //         //     "purchasePrice": 50000,					//原价
            //         //     "punishDisct": 10,							//惩罚折扣率
            //         //     "shopName": 'xxx'							//xxx
            //         // },
            //         // {
            //         //     "orderId": 5,								//订单ID
            //         //     "userId": 1,								//用户Id
            //         //     "shopId": null,							//店铺Id
            //         //     "goodsId": 3,								//商品ID
            //         //     "orderNo": "25206461189065",				//订单号
            //         //     "combinOrderNo": "25206461189060",		//父订单号（支付单号，仅在待支付时有用），如果是查询待支付的把相同的父订单号订单列在一起支付
            //         //     "number": 10,								//数量
            //         //     "moneyPrice": 2,							//单价
            //         //     "totalMoney": 10,							//总价
            //         //     "shopSaleDisct": null,					//商家售卖折扣率
            //         //     "shopBuyDisct": null,						//商家购买折扣率
            //         //     "shopIncome": null,						//商铺收入
            //         //     "acceptStatus": false,					//接受状态
            //         //     "payType": null,							//支付类型
            //         //     "payTime": null,							//支付时间
            //         //     "acceptTime": null,						//接受时间
            //         //     "throwTime": null,						//抛单时间
            //         //     "orderState": 1,							//订单状态
            //         //     "userVipGrade": 1,						//用户店铺VIP等级	//0为普通用户，订单为用户订单，反之为进货订单
            //         //     "saleVipGrade": null,						//售卖店铺VIP等级	//0为商城
            //         //     "buyerName": 'xxxx',							//显示名字，userVipGrade：0 ，用户名字，userVipGrade>1：店铺名字
            //         //     "purchasePrice": 50000,					//原价
            //         //     "punishDisct": 10,							//惩罚折扣率
            //         //     "shopName": 'xxx'							//xxx
            //         // },
            //     ],
            //     "discountMoney": 6500,                    //商品折扣价（单位：分）
            //     "minMoney": 55,               //最低进货金额（单位：分）
            //     "flag": false,                                       //判定是否处于升级状态（true，处于升级状态，最低进货金额为：首次最低进货金额。反之，为最低进货金额）
            //     "goods": {													//我的库存中的商品详情-商品部分
            //         "goodsId": 97,											//商品Id
            //         "goodsname": "测试tjl",                                     //商品名称
            //         "coverImg": "http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/cover/420298145112/组 259.png",             //商品图片
            //         "moneyPrice": 10000,									//商品进货价（单位：分）
            //         "amount": 22,										//商品当前库存
            //         "purchase": 22,                                     //商品总需库存
            //         'wholeMaxBuyNum': 333
            //     }
            // };
            // return Promise.resolve({ data: list });
        }
    }
}
