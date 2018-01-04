import Vue from 'vue'
import  DialogComponent  from './dialog.vue';
import { merge } from 'lodash';

const Dialog = Vue.extend(DialogComponent);

let _dialogInstance = null;

export default function (options = {}) {
    if (_dialogInstance) {
        // 在页面上，默认只有一个弹框提示
        _dialogInstance.showIt = false;
        _dialogInstance.$el.remove();
        _dialogInstance = null;
    }
    const defaultOption = {
        android: false,
        dialogObj: {
            title: 'Title',
            content: 'Content...',
            assistBtn:'',// 'Assist Button',
            mainBtn: '',//'Main button',
            type: '', // success 成功  error 失败   info // 提示（警告）
            assistFn() { console.log('Assist Button') },
            mainFn() { console.log('Main Button') }
        }
    }

    let { android, dialogObj } = merge(defaultOption, options, true);

    const instance = new Dialog({ el: document.createElement('div') });

    instance.android = android;
    instance.dialogObj = dialogObj;
    instance.type = dialogObj.type;
    document.body.appendChild(instance.$el);
    _dialogInstance = instance;
    return instance;
}
