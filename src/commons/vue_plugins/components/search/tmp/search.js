import Component from 'vue-class-component';
import BaseVue from 'base.vue';
import Vuex from 'vuex';
import { debounce } from 'lodash';
import './search.scss';

@Component({
    props: {
        /**
         * 搜索事件触发
         */
        _func_search_init: {
            type: Function,
            default: () => { }
        },
        /**
         * 搜索输入提示事件
         */
        _func_search_change: {
            type: Function,
            default: (keyword) => { return [] }
        },
        /**
         * 搜索表单提交后处理初始事件
         */
        _func_search_getData_init: {
            type: Function,
            default: (keyword) => { }
        },
        /**
         * 输入框placeHolder
         */
        _txt_search_placeholder: {
            type: String,
            default: '请输入搜索内容'
        },
        /**
         * 输入框是否有关键词提示功能
         */
        _bool_search_hasHint: {
            type: Boolean,
            default: true
        },
    },
    template: require('./search.html')
})

/**
 * 接收事件
 *  搜索初始化事件(显示历史/热门搜索等搜索前视图)
 *  搜索关键词提示事件(若空则表示没有)
 *  搜索提交事件(增加搜索历史,处理搜索结果视图)
 * 接收属性
 *  placeholder
 */

export class searchBar extends BaseVue {
    //待搜索关键字 
    txt_search_keyword = '';
    //搜索占位词语
    txt_search_placeholder = '';
    //是否正在搜索(搜索前和搜索提示)
    bool_search_searching = true;
    //是否有搜索提示词 
    bool_search_hasHint = false;
    //搜索提示列表
    arr_saerch_hint = [];

    mounted() {
        let _self = this;
        _self.txt_search_placeholder = _self.$props._txt_search_placeholder;
        _self.bool_search_hasHint = _self.$props._bool_search_hasHint;
        let _change = debounce(async () => {
            if (_self.txt_search_keyword_format === '') {
                _self.arr_saerch_hint = [];
            } else {
                let res = await _self.$props._func_search_change();
                res = ['test', 'hello', 'world'];
                _self.arr_saerch_hint = res;
            }
        }, 300);
        if (_self.bool_search_hasHint) {
            _self.$watch('txt_search_keyword', () => {
                _change();
            });
        }
        _self.$watch('$route', () => {
            _self.func_search_getData_init();
        });
        _self.func_search_getData_init();
    }

    /**
     * 得到当前搜索控件的操作状态
     */
    func_search_isState(state = 0){
        let _self = this;
        switch(state){
            case 1:
                return _self.bool_search_searching&&(!_self.txt_search_keyword_format||!_self.bool_search_hasHint);
            case 2:
                return _self.bool_search_hasHint&&_self.bool_search_searching&&_self.txt_search_keyword_format;
            case 3:
                return !_self.bool_search_searching;
            default:
                return false;
        }
    }

    /**
     * 得到格式化的输入框关键词
     */
    get txt_search_keyword_format() {
        return this.txt_search_keyword.replace(/\s+/g, ' ').trim();
    }

    /**
     * 点击表单搜索框事件
     */
    func_search_iptFocus() {
        this.bool_search_searching = true;
    }

    /**
     * 清空搜索关键词
     */
    func_search_clear() {
        this.txt_search_keyword = '';
    }

    /**
     * 搜索表单提交事件
     */
    func_search_form_submit() {
        let keyword = this.txt_search_keyword_format;
        if (keyword) {
            let hash = (this.$route.query.hash == 'X' ? 'Y' : 'X');
            let keyword = this.txt_search_keyword_format;
            let origin = this.func_search_getLocalOrigin();
            let query = {
                keyword: keyword,
                origin: origin,
                hash: hash
            };
            let path = this.$route.path.split('/');
            path = path[path.length - 1];
            //首次搜索 push
            if (this.$route.query.keyword) {
                this.$router.replace({ path: path, query: query });
            } else {
                this.$router.push({ path: path, query: query });
            }
        }
        event.preventDefault();
    }

    /**
     * 单项点击提交(热搜,历史,关键词等)
     */
    func_search_wordClick(e) {
        this.txt_search_keyword = e.target.innerText;
        this.func_search_form_submit();
    }

    /**
     * 搜索表单提交按钮点击事件
     */
    func_search_btnClick() {
        if (this.bool_search_searching) {
            this.func_search_form_submit();
        } else {
            let origin = this.func_search_getLocalOrigin();
            this.$router.push({ path: origin });
        }
    }

    /**
     * 获取搜索页前置页地址
     */
    func_search_getLocalOrigin() {
        let origin = this.$route.query.origin;
        if (!origin) {
            let path = this.$route.path;
            origin = (path.indexOf('#') != -1) ? 'cms_goods_shelves' : 'home';
        }
        return origin;
    }

    /**
     * 搜索控件搜索得到数据初始化与事件
     */
    func_search_getData_init() {
        let _self = this;
        console.log(111,_self.txt_search_keyword)
        if(_self.$route.query.keyword){
            _self.$refs.ipt_search.blur();
            _self.txt_search_keyword = _self.$route.query.keyword;
            _self.bool_search_searching = false;
            let keyword = _self.txt_search_keyword_format;
            _self.$props._func_search_getData_init(keyword);
        }else{
            _self.$refs.ipt_search.focus();
        }
    }

}