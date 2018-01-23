import { set, merge, find, get, isEmpty } from 'lodash';
import dialog  from '../../vue_plugins/components/popup/dialog';
import { toWEB } from './location';

/**
 * 判断未登录
 * @returns {Boolean}
 */
export function isNotLogin() {
    let flag = false;
    let _user = getLocalUserInfo();
    if (!isUserValid() || isEmpty(_user)) {
        flag = true;
    }
    return flag;
}

/**
 * 路由转到login  toLogin(router, { toPath: path.name });
 * @param {VueRouter} router
 * @param {Object}    query
 */
export function toLogin(router, query = {}) {
    // cms管理端登录往web端走起
    if (/cms/.test(location.pathname)) {
        query.type = 'cms';
        toWEB('login', query);
    } else {
        router.push({ path: 'login', query });
    }
}

/**
 * 设置登录后的信息
 */
export function setLocalUserInfo(user, flag) {
    localStorage.setItem('_login', '1');
    localStorage.setItem('_token', user.token);
    localStorage.setItem('_user', JSON.stringify(user));
    if (!flag) {
        cleanUserValid();
        cleanCacheLoginFlag();
    }
}


export function getLocalUserInfo() {
    return JSON.parse(localStorage.getItem('_user') || null) || {};
}

let cleanFn = null;
export function cleanLocalUserInfo() {
    let _storage = localStorage;
    _storage.removeItem('_user');
    _storage.removeItem('_login');
    _storage.removeItem('_token');
    cleanFn && cleanFn();
}


/**
 * 返回授权环境的user
 */
export function getAuthUser() {
    return JSON.parse(localStorage.getItem('_authUser') || null) || {};
}

export function setAuthUser(authUser) {
    localStorage.setItem('_authUser', JSON.stringify(authUser || {}))
}

/**
 * 清除用户注销标识
 */
export function cleanUserValid() {
    localStorage.removeItem('_userValid');
}

/**
 * 设置用户注销标识
 */
export function setUserValid() {
    localStorage.setItem('_userValid', 'noValid');
}

/**
 * 获取用户是否有效
 */
export function isUserValid() {
    return localStorage.getItem('_userValid') ? false : true;
}

/**
 * 缓存本地login
 */
export function cacheLogin() {
    let _storage = localStorage;
    if (isEmpty(getLocalUserInfo())) {
        return false;
    } else {
        cleanUserValid();
        _storage.removeItem('_login');
        setCacheLoginFlag();
        return true;
    }
}

export function setCacheLoginFlag() {
    localStorage.setItem('_cacheLogin', 'true');
}

export function getCacheLoginFlag() {
    return localStorage.getItem('_cacheLogin');
}

export function cleanCacheLoginFlag() {
    localStorage.removeItem('_cacheLogin');
}


export function setCleanLocalinfo(fn) {
    cleanFn = fn;
}

/**
 * 登录弹窗
 */
export function loginDialog(msg = '您还未登录，请登录！') {
    return new Promise((res, rej) => {
        let dialogObj = {
            title: '登录提示',
            content: msg,
            type: '',
            assistBtn: '取消',
            mainBtn: '登录',
            assistFn() {
                res(false);
            },
            mainFn() {
                res(true);
            }
        };
        dialog({ dialogObj });
    });
}
