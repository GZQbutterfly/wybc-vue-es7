
//获取元素的纵坐标 
export function getDomTop(e) {
    var offset = e.offsetTop;
    if (e.offsetParent != null) offset += getDomTop(e.offsetParent);
    return offset;
}


//获取元素的横坐标 
export function getTomLeft(e) {
    var offset = e.offsetLeft;
    if (e.offsetParent != null) offset += getTomLeft(e.offsetParent);
    return offset;
}