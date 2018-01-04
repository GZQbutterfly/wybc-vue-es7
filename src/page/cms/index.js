



import '../../commons/assets/weui/weui.min.css';


import '../../commons/env/scss/icon.scss';


import './index.scss';





import './main';


(function (doc, win) {
    var winWidth = win.innerWidth;
    var $htmlFontSize = 100 * winWidth / 375;
    doc.documentElement.style.fontSize = $htmlFontSize + 'px';
})(document, window);
