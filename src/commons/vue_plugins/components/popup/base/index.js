import Vue from 'vue';
import PopupComponent  from './popup.base.vue';

import { get, set, merge, isEmpty } from 'lodash';
/**
 * options:
 *  title        : '标题''
 *  close        : true        关闭按钮 默认true
 *  closeBefore  : fn          关闭事件 before
 *  closeAfter   : fn          关闭事件 after
 *  mode         : true        遮布 默认为true
 *  content      : '内容'   内容和组件 任选其一，默认为content
 *  components   : {template:''} or vue.components
 *  const Popup = Vue.extend(Popup)
 */
export default (options) => {
    let _options = {
        title: '',
        icon: '',
        width: '',
        height: '',
        close: true,
        closeBefore: () => { },
        closeAfter: () => { },
        mode: true,
        content: '',
        components: {},
        algin: 'center',
        direction: 'h',
        assistBtn: '',// 辅助操作
        mainBtn: '',// 主操作
        assistFn() {

        },
        mainFn() {

        },
        beforeCreate() {

        }
    };

    merge(_options, options);

    let _newDiv = document.createElement('div')
    document.body.appendChild(_newDiv);


    let _template = '<dialog-popup :options="options">';

    let opts = {
        el: _newDiv,
        data() {
            return {
                name: 'dialog-popup',
                options: _options
            }
        },
        template: '<dialog-popup :options="options"></dialog-popup>',
        components: {
            'dialog-popup': PopupComponent
        }
    };
    let _components = _options.components;
    if (_components && !isEmpty(_components)) {
        // 引用组件
        for (let key in _components) {
            opts.components[key] = _components[key];
            // 组件模版不支持参数
            _template += `<${key}></${key}>`;
        }
    } else {
        _template += _options.content; // <div v-html="options.content"></div>
    }

    _template += '</dialog-popup>';

    opts.template = _template;

    // 在创建popup时调用 beforeCreate 可额外添加vue依赖的组件，过滤器，数据
    if (_options.beforeCreate) {
        _options.beforeCreate(opts);
    }

    // 渲染Popup
    let _popup = new Vue(opts);

    // end
    return {
        close() {
            _popup.$el.remove();
        }
    };
};
