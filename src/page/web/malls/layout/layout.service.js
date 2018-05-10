// 菜单数据
//import axios from 'axios';
import { getUrlParams, getLocalUserInfo, isNotLogin } from 'common.env';
import { isArray } from 'lodash';
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    const wdInfo = 'api/wd_vip/queryWdInfo';
    const wdrecodeUser = 'api/a_ten_shop_history';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        list: [
            // {
            //     path: '/home',
            //     name: 'home',
            //     title: '首页',
            //     imgDefSrc: require('../../../../static/images/newshop/house2.png'),
            //     imgActSrc: require('../../../../static/images/newshop/house.png')
            // },
            {
                path: '/home',
                name: 'home',
                title: '首页',
                imgDefSrc: require('../../../../static/images/newshop/house2.png'),
                imgActSrc: require('../../../../static/images/newshop/house.png')
            },
            {
                path: '/classify',
                name: 'classify',
                title: '店长直营',
                imgDefSrc: require('../../../../static/images/shop-4.6/dianzhang1.png'),
                imgActSrc: require('../../../../static/images/shop-4.6/dianzhang2.png')
            },
            // {
            //     path: '/information',
            //     name: 'information',
            //     title: '资讯',
            //     imgDefSrc: require('../../../../static/images/newshop/newspaper.png'),
            //     imgActSrc: require('../../../../static/images/newshop/newspaper3.png')
            // },
            {
                path: '/shop_car',
                name: 'shop_car',
                title: '购物车',
                showBadge: true,
                imgDefSrc: require('../../../../static/images/newshop/shopping-cart.png'),
                imgActSrc: require('../../../../static/images/newshop/shopping-cart2.png')
            },
            {
                path: '/userinfo',
                name: 'userinfo',
                title: '我的',
                imgDefSrc: require('../../../../static/images/newshop/man-user.png'),
                imgActSrc: require('../../../../static/images/newshop/man-user2.png')
            }
        ],
        shopInfo() {
            let promsi = new Promise(function (resolve, reject) {
                let params = getUrlParams();
                let _shopId = params.shopId;
                let _user = _store.state.workVO.user;
                if (isArray(_shopId)) {
                    _shopId = _shopId[0];
                }
                let localWdInfo = _store.getters.GET_WD_INFO();;
                if (params.user == 'own' && _user.userId != localWdInfo.infoId) {
                    _store.dispatch('CHECK_WD_INFO', {shopId: _user.userId}).then((data)=>{
                        resolve(data);
                    });    
                } else if (_shopId != null && (localWdInfo.infoId != _shopId)) {
                    // _store.commit('ADD_HISTORY_SHOP', _shopId);
                    _store.dispatch('CHECK_WD_INFO',  {shopId: _shopId}).then((data)=>{
                        resolve(data);
                    });  
                } else if (localWdInfo.infoId == null) {
                    _store.dispatch('CHECK_WD_INFO', localWdInfo.infoId).then((data)=>{
                        resolve(data);
                    });   
                } else {
                    return resolve(localWdInfo);
                }
            });
            return promsi;
        },
        followShop(data){
            return q("api/wd_vip/check_if_attention",data);
        },
        queryUserFollowNum() {
            return q("api/wd_vip/q_my_attention_wd_count");
        }
    }
};
