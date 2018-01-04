// 菜单数据
//import axios from 'axios';

export default ()=>{

    return {
        list: [
            {
                path: '/home',
                name: 'home',
                title: '首页',
                imgDefSrc: 'static/images/newshop/house2.png',
                imgActSrc: 'static/images/newshop/house.png'
            },
            {
                path: '/classify',
                name: 'classify',
                title: '分类',
                imgDefSrc: 'static/images/newshop/icon.png',
                imgActSrc: 'static/images/newshop/icon2.png'
            },
            {
                path: '/shop_car',
                name: 'shop_car',
                title: '购物车',
                showBadge: true,
                imgDefSrc: 'static/images/newshop/shopping-cart.png',
                imgActSrc: 'static/images/newshop/shopping-cart2.png'
            },
            {
                path: '/userinfo',
                name: 'userinfo',
                title: '我的',
                imgDefSrc: 'static/images/newshop/man-user.png',
                imgActSrc: 'static/images/newshop/man-user2.png'
            }
        ],
        // getWdInfo(data) {
        //     return axios.post("api/q_wdInfo_by_userId", data);
        // },
        // records(data){
        //     return axios.post("api/a_shopId_by_openId", data);
        // }
    }
};
