export default [
    //for api需要id和token

    /* 提交订单服务 */
    'api/cart/q_cart_goodses',
    'api/address/q_address',
    'api/cart/q_muti_goods',
    'api/order/pay_order',
    'api/order/a_order',
    'api/order/a_cart_order',
    'api/order/a_package_order',
    'api/address/a_address',
    'api/address/u_address',
    'api/address/d_address',
    'api/address/q_addresses',
    'api/order_whole/a_cart_order',
    /* 申请退款 */
    'api/order/q_refund_goods',
    'api/order/cancel_refund',
    /*购物车*/
    'api/shopcart/q_cart_goodses',
    'api/shopcart/d_cart_goodses',
    'api/shopcart/u_goods_number',
    'api/shopcart/a_cart_goodses',
    'api/shopcart/q_muti_goods',
    'api/wholecart/q_muti_whole_goods',
    'api/wholecart/q_whole_cart_goodses',
    'api/wholecart/d_whole_cart_goodses',
    'api/wholecart/u_whole_goods_number',
    'api/wholecart/a_whole_cart_goodses',
    //实名认证
    'api/q_real_name',
    /* 请求用户额度 */
    'api/wallet/q_wallet',
    /* 请求用户订单数量 */
    'api/order/q_order_count',
    "api/order_whole/q_order_count",
    /*全部订单*/
    "api/order/q_orders",
    "api/order_whole/q_orders",
    /*订单详情*/
    "api/order/q_order",
    'api/order_whole/q_order',
    "api/order/q_combin_order",
    'api/order_whole/q_combin_order',
    /*删除并退款*/
    'api/order/d_order_with_refund',
    /* 取消订单 */
    "api/order/cancel_order",
    'api/order_whole/cancel_order',
    /* 确认收货订单*/
    "api/order/confirm_receipt",
    /* 出货订单 */
    "api/order_out/q_orders",
    "api/order_out/q_order",
    /* 拒绝备货 */
    "api/order_out/throw_order",
    /* vip grade */
    'api/wd_vip/myGrade',
    'api/wd_vip/myUpGrade',
    'api/wd_vip/tryToUp',
    'api/wd_vip/wd_unlock',
    'api/wd_vip/wd_pay_bail',
    /*实名认证*/
    'api/q_real_name',
    /*我要进货  提交订单*/
    "api/order_whole/a_order",
    "api/order_whole/pay_order",
    /* 申请开店 */
    'api/wd_vip/ifHasWd',
    'api/wd_vip/wdRegister',
    /* 我的钱包 提现 */
    'api/q_api_wallet_by_userId',
    'api/a_api_withdraw',
    'api/q_api_withdraw',
    /* 获取推广码  */
    'api/wd_vip/myInviteCode',
    /*获取店信息*/
    "api/q_wdInfo_by_userId",
    /* 我的库存 */
    "api/order_out/q_wait_orders",
    'api/q_api_goods_stock_order',
    /* 上级店铺信息 */
    'api/wd_vip/q_up_wdinfo' ,

    /* 消息通知 */
    'api/wd_vip/q_wd_msg',
    'api/wd_vip/q_wd_msgnum',
    'api/wd_vip/q_user_msg',
    'api/wd_vip/q_user_msgnum',

    'api/q_ten_shop_history',
    'api/a_ten_shop_history'

];