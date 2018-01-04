
let _ua = window.navigator.userAgent;

//判断是否微信登陆
export function isWeiXin() {
    return /MicroMessenger/i.test(_ua);
}

//是否为移动终端;
export function isApp() {
    return /AppleWebKit.*Mobile.*/.test(_ua) || /AppleWebKit/.test(_ua);
}

//是否为android终端 
export function isAndroid() {
    return _ua.indexOf('Android') > -1 || _ua.indexOf('Adr') > -1;
}

//是否为ios终端
export function isiOS() {
    return !!_ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}



//判断QQ浏览器
export function isQQBrowser() {
    return /MQQbrowser/i.test(_ua);
}

/**
 * 
 */
export function isCMS(){
    return /cms/.test(location.pathname);
}

/**
 * 
 */
export function isWEP(){
    return !/#/.test(location.href);
}