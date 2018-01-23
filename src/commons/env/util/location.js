import { qs } from './env';


/**
 * 微店管理端
 * @param name
 */
export function toCMS(name = '', query) {
    location.href = 'cms/#/' + (name.replace(/^\//, '')) + (query ? '?' + qs.stringify(query) : '');
}

/**
 * 微店前端
 */
export function toWEB(name = '', query) {
    location.href = '/' + (name.replace(/^\//, '')) + (query ? '?' + qs.stringify(query) : '');
}


/**
 * 获取url上的参数
 * @param {Boolean} hashFlag  默认不取hash后的参数
 */
export function getUrlParams(hashFlag = false) {
    let _result = '';
    let _hsQs = false;
    if (hashFlag) {
        _hsQs = /\?/.test(location.hash);
        _result = _hsQs ? location.hash.split('?')[1] : '';
    } else {
        _hsQs = /\?/.test(location.search);
        _result = _hsQs ? location.search.split('?')[1].replace('/', '') : '';
    }
    return qs.parse(_result);
}


export function appendParams(params) {
    let url = location.href;
    if (url.indexOf('?') != -1) {
        for (var key in params) {
            url += '&';
            url += key + '=';
            url += params[key];
        }
    } else {
        url += '?';
        for (var key in params) {
            url += key + '=';
            url += params[key];
            url += '&';
        }
    }
    return url;
}

export function getParamsWithUrl(url) {
    let _result = {};
    let _params = url.substring(url.indexOf('?') + 1).split('&');
    for (let i = 0, len = _params.length; i < len; i++) {
        let _param = _params[i];
        if (_param) {
            let attrs = _param.split('=');
            _result[attrs[0]] = attrs[1];
        }
    }
    return _result;
}
