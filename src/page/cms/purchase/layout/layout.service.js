// 菜单数据
export default {
    list: [
        {
            path: '/cms_purchase_classify',
            name: 'cms_purchase_classify',
            title: '进货首页',
            imgDefSrc: require('../../../../static/images/newshop/icon.png'),
            imgActSrc: require('../../../../static/images/newshop/icon2.png')
        },
        {
            path: '/cms_purchase_shop_car',
            name: 'cms_purchase_shop_car',
            title: '进货单',
            showTip: true,
            imgDefSrc: require('../../../../static/images/newshop/shopping-cart.png'),
            imgActSrc: require('../../../../static/images/newshop/shopping-cart2.png')
        },
        {
            path: '/cms_purchase_userinfo',
            name: 'cms_purchase_userinfo',
            title: '我的',
            imgDefSrc: require('../../../../static/images/newshop/man-user.png'),
            imgActSrc: require('../../../../static/images/newshop/man-user2.png')
        }
    ]
};
