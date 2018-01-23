// History  Events
import { isString } from 'lodash';
import { clientEnv, match } from '../common.env';
let _CMSFlag =false;// clientEnv.cms;

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
    'order_detail': { noBacks: ['order_submit'], to: 'user_order' },
    'user_order': { noBacks: ['order_submit'], to: 'userinfo' },
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
    parse(toPathName, formPathName, webPath);
}

let cmsPath = {
    'cms_stock_order': { noBacks: ['cms_purchase_submit_order'], to: 'cms_purchase_userinfo' },
    'cms_purchase_order_detail': { noBacks: ['cms_purchase_submit_order'], to: 'cms_purchase_userinfo' },
    'grade': { noBacks: ['grade_up'], to: 'cms_home' },
    'cms_home': { noBacks: ['realname_form'], to: 'cms_home' },
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
    parse(toPathName, formPathName, cmsPath);
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
    history.pushState(_targetPath, null, _targetPath);
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
