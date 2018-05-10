// History  Events
import { isString } from 'lodash';
import { clientEnv, match } from '../common.env';
let _CMSFlag = clientEnv.cms;

/**
 * auth history back to page
 */
window.addEventListener('popstate', (event) => {
    // Browser back
    if (_CMSFlag) {
        CMSHistory();
    } else {
        WEBHistory();
    }
});

// ==> history back function
let webPath = {
    'order_detail': { noBacks: ['order_submit', 'pay_list'], to: 'user_order' },
    'user_order': { noBacks: ['order_submit', 'sys_pay_list', 'sys_pay', 'pay_list'], to: 'userinfo' },
    'pay_list': { noBacks: ['order_submit'], to: 'user_order?listValue=1' },
    'shop_chief': { noBacks: ['search'], to: "home" },
    // 限时购页面
    'money_timelimit_list': { noBacks: ['order_submit', 'money_timelimit_detail'], to: 'home' },
    'wybc_protocol': { noBacks: ['login'], to: 'login' }, // 登录页面存在参数，默认将参数存入sessionStorage里
    '*': { noBacks: ['login', 'login_back'], to: 'home' }
};

/**
 * web-app no hash
 */
function WEBHistory() {
    let toPathName = location.pathname.replace('/', '').split('?')[0];
    let formPathName = localStorage._activePathname.replace('/', ''); // this value in 'commons/auth/router' has set
    // console.log('to  route  name: ', toPathName);
    // console.log('form  route name: ', formPathName);
    if (/login/.test(toPathName)) {
        to(localStorage._prevPath);
    } else {
        parse(toPathName, formPathName, webPath);
    }
}

let cmsPath = {
    'cms_stock_order': { noBacks: ['cms_purchase_submit_order', 'sys_pay_list'], to: 'cms_goods_shelves' },
    'cms_purchase_order_detail': { noBacks: ['cms_purchase_submit_order', 'sys_pay_list'], to: 'cms_goods_shelves' },
    'grade': { noBacks: ['grade_up'], to: 'cms_home' },
    'cms_home': { noBacks: ['realname_form', 'faststore_info'], to: 'cms_home' },
    // 实名认证结果页面
    'realname_result': { noBacks: ['realname_form'], to: 'cms_home' },
    'faststore_info': { noBacks: ['fast_store'], to: 'cms_home' },
    'options': { noBacks: ['faststore_info', 'password_set'], to: 'cms_home' },
    'delivery_m_order': { noBacks: ['faststore_info'], to: 'cms_home' },
    'sys_pay_list': { noBacks: ['cms_purchase_submit_order', 'cms_purchase_goods_detail'], to: 'cms_stock_order?listValue=1' },
    'sys_pay': { noBacks: ['cms_purchase_submit_order', 'cms_purchase_goods_detail'], to: 'cms_stock_order?listValue=1' },
    'password': { noBacks: ['cms_purchase_submit_order','cms_goods_shelves'], to: 'cms_stock_order?listValue=1' },
    // 配送员认证结果页面
    'distributor_realname_result': { noBacks: ['distributor_realname_form'], to: 'cms_home' },
    '*': { noBacks: ['login', 'login_back'], to: 'cms_home' }
};

/**
 * cms-app  has hash
 */
function CMSHistory() {
    let thisPathName = location.pathname.replace('/', '').split('?')[0];
    let thisHashPathName = location.hash.replace('#/', '').split('?')[0];
    let formPathName = localStorage._activePathname.replace('/', ''); // this value in 'commons/auth/router' has set
    let toPathName = thisHashPathName;
    if (match(thisPathName, cmsPath['*'].noBacks)) {
        toPathName = thisPathName;
    }
    if (/cms_goods_shelves/.test(formPathName)) {
        to('cms_home');
    } else {
        parse(toPathName, formPathName, cmsPath);
    }
}

// ==> util
function parse(toPathName, formPathName, mapPath) {
    if (toPathName !== formPathName) {
        let _path = mapPath[formPathName];
        if (_path && match(toPathName, _path.noBacks)) {
            to(_path.to);
        } else {
            _path = mapPath['*'];
            if (match(toPathName, _path.noBacks)) {
                to(_path.to);
            }
        }
    }
}

function to(path) {
    let _targetPath = getPath(path);
    history.replaceState(_targetPath, null, _targetPath);
}

function getContentPath() {
    if (_CMSFlag) {
        return location.origin + '/cms/#';
    } else {
        return location.origin;
    }
}

function getPath(toPath) {
    return getContentPath() + '/' + toPath.replace('/', '');
}
