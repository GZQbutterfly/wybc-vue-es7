import mutations from './mutations';
import actions from './actions';
import getters from './getters';

import { isNotLogin } from 'common.env';

import { isEmpty } from 'lodash';

// 用户未登录时 获取上次临时存入本地缓存的
let localCache = isNotLogin() ? localStorage.wdVipInfo : sessionStorage.wdVipInfo;

let currentShop = JSON.parse(localCache || null) || {};
let shopMap = {};

if (!isEmpty(currentShop)) {
    shopMap[currentShop.infoId] = { result: Promise.resolve(currentShop) }
}

// ==>
export default {
    state: {
        cache: {
            shopMap,
            currentShop
        }
    },
    mutations,
    getters,
    actions
}