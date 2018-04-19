import Vue from 'vue';

/**
 * 转大写
 */
Vue.filter('uppercase', (value) => {
    if (!value) { return '' }
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
});

/**
 * 转小写
 */
Vue.filter('lowercase', (value) => {
    if (!value) { return '' }
    value = value.toString();
    return value.charAt(0).toLowerCase() + value.slice(1);
});

/**
 * JSON.stringify
 */
Vue.filter('json', (value) => {
    if (!value) { return '' }
    return JSON.stringify(value);
});


/**
 * 格式金额
 * @param value 值
 * @param _currency 单位
 * @param decimals 小数位
 */
let digitsRE = /(\d{3})(?=\d)/g;

let _currency = (value, _u = '¥', decimals = 2) => {
    value = parseFloat(value);
    if (!isFinite(value) || !value && value !== 0) return '';
    let stringified = Math.abs(value).toFixed(decimals);
    let _int = decimals ? stringified.slice(0, -1 - decimals) : stringified;
    let i = _int.length % 3;
    let head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
    let _float = decimals ? stringified.slice(-1 - decimals) : '';
    let sign = value < 0 ? '-' : '';
    return sign + _u + head + _int.slice(i).replace(digitsRE, '$1,') + _float;
};

Vue.filter('currency', _currency);



/**
 * 格式化local money 金额（后台默认给分的数据，前台要除以100得到展示以元的数据）
 */
Vue.filter('localMoney', (value, _u) => {
    value = Number(value);
    if (value) {
        return _currency(value / 100, _u);
    } else {
        return _currency(0, _u);
    }
});

/**
 * 商城券/100
 */
Vue.filter('localVolume', (value) => {
    value = Number(value);
    if (value) {
        return value / 100;
    } else {
        return 0;
    }
});



/**
 * 日期格式化
 * @param {Date} date
 * @param {String} fmt 'yyyy-MM-dd'
 */
function padLeftZero(str) {
    return ('00' + str).substr(str.length);
};
Vue.filter('date', (date, fmt = 'yyyy-MM-dd') => {
    if (isFinite(date)) {
        date = new Date(date);
    }
    if (!(date instanceof Date)) {
        return date;
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            let str = o[k] + '';
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
        }
    }
    return fmt;
});

Vue.filter('fmtPhone',(value = '')=>{
    return (value + '').replace(/(\d{3})\d+(\d{4})/, '$1****$2');
});