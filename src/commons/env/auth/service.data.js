export default [
    //for api需要id和token

    /* 提交订单服务 */
    'api/cart/q_cart_goodses',
    'api/address/q_address',
    'api/cart/q_muti_goods',
    'api/order/pay_order',
    'api/order/a_order',
    'api/order/a_gold_order',
    'api/order/a_cart_order',
    'api/order/a_package_order',
    'api/address/a_address',
    'api/address/u_address',
    'api/address/d_address',
    'api/address/q_addresses',
    'api/order_whole/a_cart_order',
    'api/q_inside_gold_delivery_config',
    'api/q_gold_delivery_config ',
    'api/order/a_limit_time_order',
    /* 申请退款 */
    'api/order/q_refund_goods',
    'api/order/cancel_refund',
    /*购物车*/
    'api/shopcart/q_cart_goodses',
    'api/shopcart/d_cart_goodses',
    'api/shopcart/u_goods_number',
    'api/shopcart/u_goods_numbers',
    'api/shopcart/a_cart_goodses',
    'api/shopcart/q_muti_goods',
    'api/wholecart/q_muti_whole_goods',
    'api/wholecart/q_whole_cart_goodses',
    'api/wholecart/d_whole_cart_goodses',
    'api/wholecart/u_whole_goods_number',
    'api/wholecart/a_whole_cart_goodses',
    'api/wholecart/a_whole_cart_goods',
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
    "api/order_out/q_ks_order_detail",
    "api/order_out/q_ks_orders",
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
    'api/a_ten_shop_history',
    /*web配送详情*/
    'api/order/q_order_delivery_log',
    /*cms配送详情*/
    'api/q_delivery_detail', 
    /*cms 配送单*/
    'api/q_waite_orders',
    'api/get_delivery_goods',
    'api/q_delivery_his',
    'api/q_delivery_detail',
    'api/confirm_receipt',
    'api/pay_delivery_check',
    /*收益分类获取*/
    'api/q_api_income',
    /*金币明细*/ 
    "api/wallet/q_gold_detail_log",
    //前端 我的 金币查询
    'api/wallet/q_gold_wallet',

    /*快速仓*/
    'api/check_shopDeliv_phone',
    'api/check_fast_delivery_state',
    'api/q_shop_deliveryInfo',
    'api/u_shop_deliveryInfo',
    'api/shop_deli_get_code',

    // 礼包  优惠券
    'api/activites/wd_noefficacy_coupons',
    'api/activites/wd_share_coupons',
    'api/activites/get_gifts',
    'api/activites/check_has_gifts',
    'api/activites/user_get_coupon',
    "api/activites/q_user_coupons",
    "api/activites/q_cart_coupons",
    "api/activites/q_goods_byCouponId",
    "api/activites/q_single_coupon",
    "api/activites/q_order_coupons",
    'api/activites/q_goods_coupon',
    "api/activites/q_goods_byCouponId",
    "api/activites/q_goods_couponInfo",

    // 每日任务
    "api/wx/get_share_qrCode",
    "api/day_task/get_share_goods_task",
    "api/day_task/get_invite_friend_task",
    "api/day_task/get_task_gold",
    "api/day_task/a_share_goods",
    "api/wx/get_share_qrCode",

    "api/q_shopDelivery_state",
    "api/stock/q_pshop_sg_goods_stock",


    //限时购
    'api/limited/q_period_goodsInfo',
    'api/limited/set_limited_remind',
    'api/limited/cancel_limited_remind',
    'api/limited/q_user_remind_list',
    'api/order/q_user_buy_number',

    // 每日签到
    'api/sign/q_sign_record_lists',
    'api/sign/q_sign_award_lists',
    'api/sign/user_sign',
    'api/sign/to_get_days_award',

    //进货端
    "api/activites/q_wd_order_coupons",

    //支付密码
    "api/user_pay/q_wallet_pay_password_status",
    "api/user_pay/setting_pay_password",
    "api/user_pay/check_pay_password",
    "api/pay/order",
];