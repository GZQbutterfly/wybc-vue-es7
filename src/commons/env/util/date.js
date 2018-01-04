import { merge, isDate, isNumber } from 'lodash';

let cd = { d: getD, h: getH, m: getM, s: getS };

/**
 * 获取倒计时
 * @param {Date|Number} endDate 最后日期 或者时间戳之差
 * @param {String} type  'd'  'h'  'm'  's'
 */
export function getCountDown(endDate, type = 'h') {
    let leftTime = endDate;
    if (isDate(endDate)) {
        let nowData = new Date();
        leftTime = endDate.getTime() - nowData.getTime();
    }
    return leftTime && cd[type](leftTime);
}

/**
 * 计算相差的天数 days  24 * 60 * 60 * 1000
 * @param  {Number} leftTime
 * @return {Object}  {d:'00', h:'00', m:'00', s:'00'}
 */
function getD(leftTime) {
    let d = Math.floor(leftTime / (24 * 60 * 60 * 1000));
    let _d = d * 24 * 60 * 60 * 1000;
    d = d > 0 ? (d < 10 ? '0' + d : d) : '00';
    return merge({ d }, getH(leftTime - _d));
}

/**
 * 计算相差的时间数 hours  60*60*1000
 * @param  {Number} leftTime
 * @return {Object}  { h:'00', m:'00', s:'00'}
 */
function getH(leftTime) {
    let h = Math.floor(leftTime / (60 * 60 * 1000));
    let _h = h * 60 * 60 * 1000;
    h = h > 0 ? (h < 10 ? '0' + h : h) : '00';
    return merge({ h }, getM(leftTime - _h));
}

/**
 * 计算相差的分钟数 minutes  60*1000
 * @param  {Number} leftTime
 * @return {Object}  { m:'00', s:'00'}
 */
function getM(leftTime) {
    let m = Math.floor((leftTime) / (60 * 1000));
    let _m = m * 60 * 1000;
    m = m > 0 ? (m < 10 ? '0' + m : m) : '00';
    return merge({ m }, getS(leftTime - _m));
}

/**
 * 计算相差的秒钟数 seconds  1000
 * @param  {Number} leftTime 
 * @return {Object}  {  s:'00'}
 */
function getS(leftTime) {
    let s = Math.floor((leftTime) / 1000);
    s = s > 0 ? (s < 10 ? '0' + s : s) : '00';
    return { s };
}
