
import Vuex from 'vuex';

//路由中大小写风格不统一  此配置统一小写




export default ()=>{
    let store = new Vuex.Store({
        state: {
            hideAllList: {
                'order_submit': true,
                'shop_car': true,
                'userinfo': true,
                'submitorder': true,
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
                'withdraws_list':true,
                'withdraws_detail':true,
                'cms_stock_order':true,
                'cms_stock_order_detail':true,
                'cms_out_order_detail':true,
                'cms_purchase_shop_car':true,
                'message_notice':true,
                'cms_purchase_classify':true,
                'my_team':true,
                'helper':true,

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
    return  store;
};
