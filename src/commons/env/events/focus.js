import {getDomTop} from '../common.env';

//因为存在软键盘显示而屏幕大小还没被改变，所以以窗体（屏幕显示）大小改变为准
window.addEventListener("resize", function () {
    //焦点元素滚动到可视范围的底部(false为底部)

    // 1 ----- 利用捕获事件监听输入框等focus动作
    scrollIntoView()
});

function scrollIntoView() {
    let activeElement = document.activeElement;
    if (/input/i.test(activeElement.tagName)) {

        console.log(activeElement.offsetTop);
        let dom = closest(activeElement, '._v-container');
        if (dom) {

            // console.log(dom.__scroller)
            let top = getDomTop(activeElement);
            dom.__scroller.scrollTo(0, top - 80);

        }else{
            if (activeElement.scrollIntoViewIfNeeded) {
                activeElement.scrollIntoViewIfNeeded(true);
            } else {
                activeElement.scrollIntoView(true);
            }
        }

    }
}


function closest(el, selector) {
    var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

    while (el) {
        if (matchesSelector.call(el, selector)) {
            break;
        }
        el = el.parentElement;
    }
    return el;
}


/**
 * @param {String} errorMessage  错误信息
 * @param {String} scriptURI   出错的文件
 * @param {Long}  lineNumber   出错代码的行号
 * @param {Long}  columnNumber  出错代码的列号
 * @param {Object} errorObj    错误的详细信息，Anything
 */
window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
    console.group('error message');
    console.debug("错误信息：", errorMessage);
    console.debug("出错文件：", scriptURI);
    console.debug("出错行号：", lineNumber);
    console.debug("出错列号：", columnNumber);
    console.debug("错误详情：", errorObj);
    console.groupEnd();
    return true;
} 
