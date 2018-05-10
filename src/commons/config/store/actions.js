import { get, set, isEmpty, isObject, isArray } from 'lodash';

import { clientEnv, isNotLogin } from 'common.env';

export default {
    /**
     * 检查店铺信息
     */
    'CHECK_WD_INFO': async function ({ dispatch, state, commit, getters }, shop) {
        let _shopId = await dispatch('CHECK_ROUTER_SHOP', shop);
        console.log('shopid: ', _shopId);
        let _shop = getters.GET_WD_INFO(_shopId);
        let result = null;
        if (isEmpty(_shop)) {
            result = dispatch('QUERY_WD_INFO', _shopId);
            state.cache.shopMap[_shopId] = { result };
        } else {
            result = _shop.result || Promise.resolve(_shop);
        }
        result.then((data)=>{
            !get(shop, 'noset') && commit('SET_WD_INFO', data);
        });
        return result;
    },
    /**
     * 检查自己店铺信息
     */
    'CHECK_MY_WD_INFO': async function ({ dispatch, rootState }) {
        return dispatch('CHECK_WD_INFO', { shopId: rootState.workVO.user.userId, noset: true });
    },
    /**
     * 检查上级店铺信息 或者 获取普通店信息 不写入sessionStorage
     */
    'CHECK_UP_WD_INFO': async function ({ dispatch, rootState }, shopId) {
        return dispatch('CHECK_WD_INFO', { shopId, noset: true });
    },
    /**
     * 查询店铺信息
     */
    'QUERY_WD_INFO': async function ({ state, rootState, dispatch }, shopId) {
        let _http = rootState.$http;
        let params = {};
        // //请求历史记录
        // if ([null, undefined].includes(shopId) && !isNotLogin()) {
        //     shopId = await dispatch('QUERY_HISTORY_SHOP');
        // }
        // //  不存在时，定义临时shopId
        // if ([null, undefined].includes(shopId)) {
        //     shopId = '_tmp_shopid';
        // }
        if (shopId !== '_tmp_shopid') {
            params.shopId = shopId;
        }
        let _result = (await _http('api/wd_vip/queryWdInfo', params)).data;
        if (_result && !_result.errorCode) {
            let wdVipInfo = _result.wdVipInfo;
            wdVipInfo.shopId = wdVipInfo.infoId;
            wdVipInfo.gradeName = _result.gradeName;
            if (shopId === '_tmp_shopid') {
                state.cache.shopMap[wdVipInfo.infoId] = state.cache.shopMap['_tmp_shopid'];
            }
            return _result.wdVipInfo;
        }
        return _result;
    },
    /**
     * 检查路由shopId
     */
    'CHECK_ROUTER_SHOP': async function ({ rootState, dispatch }, shop) {
        let _route = rootState.route;
        let _query = _route.query;
        let _shopId = shop;
        // 1， 判断参数是否携带shopId or {shopId}
        if (isObject(shop)) {
            _shopId = shop.shopId;
        }
        // 2, 判断是否请求自己店铺信息
        if (_query.user == 'own') {
            _shopId = rootState.workVO.user.userId;
            window.sessionStorage.__env = 'userown';
        }
        // 3，不存在时，取其路由中参数
        if ([null, undefined].includes(_shopId)) {
            _shopId = _query.shopId || _query.infoId;
        }
        if (isArray(_shopId)) {
            _shopId = _shopId[0];
        }
        // 当前环境是否处于访问 自己的店铺
        if ([null, undefined].includes(_shopId) && window.sessionStorage.__env == 'userown') {
            _shopId = rootState.workVO.user.userId;
        }
         //请求历史记录
         if ([null, undefined].includes(_shopId) && !isNotLogin()) {
            _shopId = await dispatch('QUERY_HISTORY_SHOP');
        }
        //  不存在时，定义临时shopId
        if ([null, undefined].includes(_shopId)) {
            _shopId = '_tmp_shopid';
        }
        return _shopId;
    },
    /**
     * 查询历史记录
     */
    'QUERY_HISTORY_SHOP': async function ({ rootState }) {
        let _result = (await rootState.$http('api/q_ten_shop_history')).data;
        if (_result.errorCode || !_result.data || !_result.data.length) {
            return null;
        } else {
            return _result.data[0].infoId;
        }
    }
}