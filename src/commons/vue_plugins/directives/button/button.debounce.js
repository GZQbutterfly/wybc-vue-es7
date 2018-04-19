import Vue from 'vue';

Vue.directive('debounce', {
    inserted: function (el, binding, vnode) {
        let _tagName = el.tagName;

        //if (/BUTTON/i.test(_tagName)) {
        //console.log(_tagName, binding);
        let _time = binding.value;

        el.addEventListener('click', () => {
            el.setAttribute('disabled', true);
            setTimeout(() => {
                el.removeAttribute('disabled');
            }, _time || 1000);
        })
        //}

    },
    update: function (el, binding) {
        //console.log('update', arguments);
    },
    unbind: function (el) {
        //console.log('unbind', arguments);
    }
});