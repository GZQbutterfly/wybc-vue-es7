import Vue from 'vue';

const nowifiHTML = require('./nowifi.html');
// v-nowifi:testNowifi="testNowifi"   // 保证对象名称一次性，以便监听值的变化
// testNowifi = { callBack: () => { }, show: false };
Vue.directive('nowifi', {
    // 当被绑定的元素插入到 DOM 中时……
    inserted: function (el, binding, vnode) {
        let key = binding.arg;
        let opts = binding.value;
        console.log('bind', binding);
        let parent = el.parentElement ? el.parentElement : el.parentNode;
        if (parent) {
            let width = el.clientWidth;
            let top = getTop(el);
            let left = getLeft(el);
            let newDiv = document.createElement('div');
            newDiv.innerHTML = nowifiHTML;
            parent.appendChild(newDiv);
            let _container = newDiv.querySelector('.nowifi-container');
            if (_container) {
                setHideClass(_container, opts.show);
                _container.style.top = top + 'px';
                _container.style.left = left + 'px';
                _container.style.width = width + 'px';
                let _btn = _container.querySelector('.weui-btn');
                if (_btn) {
                    _btn.addEventListener('click', (e) => {
                        setHideClass(_container, false);
                        opts.callBack && opts.callBack();
                    });
                }
                let context = vnode.context;
                if (context) {
                    context.$watch(key + '.show', (value) => {
                        setHideClass(_container, value);
                    })
                }
            }
        }
        //console.log('inserted', arguments);
    },
    update: function (el, binding) {
        //console.log('update', arguments);
    },
    unbind: function (el) {
        //console.log('unbind', arguments);
    }
});

function setHideClass(el, show) {
    if (el) {
        show ? el.classList.remove('hide') : el.classList.add('hide');
    }
}

//获取元素的纵坐标 
function getTop(e) {
    var offset = e.offsetTop;
    if (e.offsetParent != null) offset += getTop(e.offsetParent);
    return offset;
}
//获取元素的横坐标 
function getLeft(e) {
    var offset = e.offsetLeft;
    if (e.offsetParent != null) offset += getLeft(e.offsetParent);
    return offset;
}