
import Vuex from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);
//路由中大小写风格不统一  此配置统一小写

let store = new Vuex.Store({
    //TODO 修改为默认全部隐藏. (隐藏需要大于功能需求)
    state: {
        hideAllList: {
            'order_submit': true,
            'shop_car': true,
            'userinfo': true,
            'submit_order': true,
            'cms_purchase_order_detail': true,
            'orderrefundlayout': true,
            'cms_purchase_submit_order': true,
            'search': true,
            'cms_purchase_shop_car': true,
            'user_address': true,
            'cms_purchase_userinfo': true,
            'login': true,
            'order_detail': true,
            'user_order': true,
            'cms_out_order': true,
            'out_order':true,
            'out_order_detail':true,
            'my_spread': true,
            'apply_shop_campaign': true,
            'apply_shop': true,
            'apply_shop_invitecode':true,
            'cms_purchase_goods_detail': true,
            'grade': true,
            'grade_up': true,
            'grade_guide': true,
            'my_inventory_list':true,
            'my_wallet':true,
            'my_income':true,
            'realname':true,
            'realname_form':true,
            'realname_result':true,
            'distributor_deposit':true,
            'distributor_realname_result':true,
            'distributor_realname_form':true,
            'distributor_realname':true,
            'withdraws_list':true,
            'withdraws_detail':true,
            'cms_stock_order':true,
            'cms_stock_order_detail':true,
            'cms_out_order_detail':true,
            'cms_purchase_shop_car':true,
            'message_notice':true,
            'cms_purchase_classify':true,
            'cms_home':true,
            'my_team':true,
            'helper':true,
            'about':true,
            'coupon_list':true,
            "order_coupon":true,
            "coupon_detail":true,
            "mask_coupon":true,
            "my_coupon_list":true,
            "my_coupon_detail":true,
            'delivery_finish_list': true,
            'delivery_finish_detail': true,
            'delivery_order': true,

            'delivery_m_finish_list': true,
            'delivery_m_finish_detail': true,
            'delivery_m_order': true,

            'day_task':true,
            'day_task_share':true,
            'day_task_rules':true,
            'fast_store':true,
            'faststore_info':true,
            'options':true,
            'lead':true,
            'lead_search':true,

        },
        custShareList:{
            'home':true,
            'classify':true,
            'goods_detail':true,
            'grade':true,
            'info':true,
            'helper':true,
            'cms_stock_info':true,
            'easy_scanner':true,
            'information':true,
            'money_gold_buy':true,
            'money_timelimit_detail':true,
            'user_scanner':true,
        },
        shareConfig: {// 可动态带参存储---
            cmshome: {
                title: '管理我的店铺',
                desc: '快来管理自己的店铺吧！~',
                imgUrl: 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_sp.jpg',
            }
        }
    }
});

export default store;
