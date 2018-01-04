
//因为存在软键盘显示而屏幕大小还没被改变，所以以窗体（屏幕显示）大小改变为准
window.addEventListener("resize", function () {
    //焦点元素滚动到可视范围的底部(false为底部)

    // 1 ----- 利用捕获事件监听输入框等focus动作
    scrollIntoView()
});

function scrollIntoView() {
    let activeElement = document.activeElement;
    if (/input/i.test(activeElement.tagName)) {
        if (activeElement.scrollIntoViewIfNeeded) {
            activeElement.scrollIntoViewIfNeeded(true);
        } else {
            activeElement.scrollIntoView(true);
        }
    }
}
