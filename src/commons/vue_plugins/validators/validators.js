

// 校验手机号码
function checkPhone(value, attrValue, vnode) {
    return /^\d{11}$/.test(value);
}

//校验店名
function checkWdName(value, attrValue, vnode) {
    value = value.replace(/([^\u0000-\u00FF])/g, 'xx')
    return /^[_a-zA-Z0-9]{1,16}$/.test(value);
}

//校验微信号
function checkWechat(value, attrValue, vnode) {
    return /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/.test(value);
}

// 校验手机号码 或者固话
function checkTel(value, attrValue, vnode) {
    return /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value) || checkPhone(value, attrValue, vnode);
}

function checkZipCode(value, attrValue, vnode){
    return /^\d{6}$/.test(value);
}

var aCity = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" }

function isCardID(sId) {
    sId = sId + '';
    let iSum = 0;
    let info = "";
    if (!/^\d{17}(\d|x)$/i.test(sId)) {
        return false;
        //return "你输入的身份证长度或格式错误";
    }
    sId = sId.replace(/x$/i, "a");
    if (aCity[parseInt(sId.substr(0, 2))] == null) {
        return false;
        //return "你的身份证地区非法";
    }
    let sBirthday = sId.substr(6, 4) + "-" + Number(sId.substr(10, 2)) + "-" + Number(sId.substr(12, 2));
    let d = new Date(sBirthday.replace(/-/g, "/"));
    if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) {
        return false;
        //return "身份证上的出生日期非法";
    }
    for (let i = 17; i >= 0; i--) iSum += (Math.pow(2, i) % 11) * parseInt(sId.charAt(17 - i), 11);
    if (iSum % 11 != 1) {
        return false;
        //return "你输入的身份证号非法";
    }
    //console.log(aCity[parseInt(sId.substr(0, 2))] + "," + sBirthday + "," + (sId.substr(16, 1) % 2 ? "男" : "女"));//此次还可以判断出输入的身份证号的人性别
    return true;
}

// 校验身份证
function checkCardId(value, attrValue, vnode) {
    return /^([0-9]){7,18}(x|X)?$/.test(value);   //isCardID(value);
}


const options = {
    validators: {
        //命名只能小写
        'check-phone': checkPhone,
        'check-tel': checkTel,
        'check-card': checkCardId,
        'check-wechat': checkWechat,
        'check-wdname': checkWdName,
        'check-zipcode':checkZipCode
    }
}

export default options;
