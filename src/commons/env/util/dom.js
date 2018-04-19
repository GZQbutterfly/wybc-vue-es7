
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


export function getParentDomHeight(e) {
    var h = e.parentElement ? e.parentElement.offsetHeight : e.offsetHeight;
    return h ? h : getParentDomHeight(e.parentElement);
}

export function parents(dom, className = '', rootName = 'app-container') {
    var isFind = dom.parentElement ? dom.parentElement.classList.contains(className.replace(/^\./, '')) : false;
    if (dom.classList.contains(rootName) || /body/i.test(dom.tagName)) {
        return isFind;
    }
    return !isFind ? parents(dom.parentElement, className) : true;
}