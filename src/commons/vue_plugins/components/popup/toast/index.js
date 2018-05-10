import Vue from 'vue'
import ToastComponent  from './toast.vue';
import { merge } from 'lodash';


const Toast = Vue.extend(ToastComponent);

export default function (opts) {

    const instance = new Toast({
        el: document.createElement('div')
    });

    instance.title = opts.title;
    instance.time = opts.time || 800;
    instance.success = opts.success == null ? true : false;
    instance.mode = false;
    merge(instance, opts);
    Vue.nextTick(() => {
        document.body.appendChild(instance.$el);
        instance.show = true;
    });

    return {
        close() {
            instance.$el.remove();
        }
    }
}
