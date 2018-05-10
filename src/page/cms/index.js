



import '../../commons/assets/weui/weui.min.css';


import '../../commons/env/scss/index.scss';


import './index.scss';





import './main';


(function (doc, win) {
    var winWidth = win.innerWidth;
    var $htmlFontSize = 100 * winWidth / 375;
    doc.documentElement.style.fontSize = $htmlFontSize + 'px';
   
    var head = document.getElementsByTagName("head");
    head[0].addEventListener("DOMNodeInserted",function(ele){
       if (!checkDomAvible(ele)) {
            console.log('添加非法元素!!!!',ele);
            ele.srcElement.remove();
            var _href = window.location.href;
            //href.toLowerCase
            if (/order_submit/.test(_href)||/cms_purchase_submit_order/.test(_href)) {
            }else{
                window.location.reload();
            }
            ele.preventDefault();
       }
    },false);

    function checkDomAvible(ele){
        var srcElement = ele.srcElement;
        //
        if ((srcElement.tagName == 'script' || srcElement.tagName == 'SCRIPT')&&/\/\//.test(srcElement.outerHTML) &&!/365bencao/.test(srcElement.outerHTML)) {
            return false;
        }
        return true;
    }
})(document, window);
