<template>
    <div class="search_box">
        <!-- search formBar -->
        <div class="search_bar">
            <div class="weui-cells">
                <div class="weui-cell">
                    <div class="weui-cell__bd">
                        <form class="frm_search iconfont" @submit="func_search_form_submit" :class="{'frm_noKeyword':!txt_search_keyword}">
                            <input type="text" class="ipt_search_keyword" autocomplete="off" spellcheck="false" ref="ipt_search" :placeholder="txt_search_placeholder"
                                v-model="txt_search_keyword" @focus="func_search_iptFocus">
                            <mark class="btn_search_clear" @click="func_search_clear" v-show="bool_search_searching&&txt_search_keyword">
                                <i class="weui-icon-clear"></i>
                            </mark>
                        </form>
                    </div>
                    <div class="weui-cell__ft">
                        <p class="btn_search" @click="func_search_btnClick" v-text="bool_search_searching?'搜索':'取消'"></p>
                    </div>
                </div>
            </div>
        </div>
        <!-- search before -->
        <div class="search_beforePage" v-show="func_search_isState(1)">
            <slot name="_search_beforePage">搜索等待 vue</slot>
        </div>
        <!-- search prompt -->
        <div class="search_keywordList" v-show="func_search_isState(2)">
            <slot name="_search_keywordList">
                <div class="weui-cells">
                    <div class="weui-cell" v-for="val in arr_saerch_hint" :key="val">
                        <div class="weui-cell__bd" @click="func_search_wordClick" v-text="val"></div>
                    </div>
                </div>
            </slot>
        </div>
        <!-- search after -->
        <div class="search_afterPage" v-show="func_search_isState(3)">
            <slot name="_search_afterPage">搜索结果</slot>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.search_box{
    .search_bar{
        .weui-cells{
            margin-top: 0;
            .weui-cell{
                font-size: 15px;
                .weui-cell__bd{
                    .frm_search{
                        position: relative;
                        &.frm_noKeyword{
                            &:before{
                                content: '\E62F';
                            }
                            .ipt_search_keyword{
                                text-indent: 40px;
                            }
                        }
                        &:before{
                            content: '';
                            position: absolute;
                            top: 0.01rem;
                            left: 0.15rem;
                            z-index: 999;
                            font-size: 0.2rem;
                            color: #808080;
                        }
                        .ipt_search_keyword{
                            width: 304.5px;
                            height: 30px;
                            background: #f2f2f2;
                            border-radius: 15px;
                            border: 0;
                            outline: none;
                            text-indent: 20px;
                            position: relative;
                        }
                        .btn_search_clear{
                            width: .3rem;
                            background: transparent;
                            text-align: center;
                            position: absolute;
                            top: 4px;
                            right: 12px;
                        }
                    }
                }
                .weui-cell__ft{
                    line-height: 30px;
                    color: #333;
                    .btn_search{
                        font-weight: 600;
                    }
                }
            }
        }
    }
    .search_keywordList{
        .weui-cells{
            margin-top: 0px;
            .weui-cell{
                &:before{
                    left: 0;
                }
                .weui-cell__bd{
                    font-size: 15px;
                    color: #808080;
                }
            }
        }
    }
}
</style>
<script>
    import Component from 'vue-class-component';
    import Vuex from 'vuex';
    import { debounce } from 'lodash';

    export default {

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

        computed: {
             /**
             * 得到格式化的输入框关键词
             */
            txt_search_keyword_format : function() {
                return this.txt_search_keyword.replace(/\s+/g, ' ').trim();
            },
        },

        mounted() {
            let _self = this;
            _self.txt_search_placeholder = _self.$props._txt_search_placeholder;
            _self.bool_search_hasHint = _self.$props._bool_search_hasHint;
            let _change = debounce(async () => {
                if (_self.txt_search_keyword_format === '') {
                    _self.arr_saerch_hint = [];
                } else {
                    let res = await _self.$props._func_search_change();
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
        },

        data() {
            return {
                //待搜索关键字 
                txt_search_keyword : '',
                //搜索占位词语
                txt_search_placeholder : '',
                //是否正在搜索(搜索前和搜索提示)
                bool_search_searching : true,
                //是否有搜索提示词 
                bool_search_hasHint : false,
                //搜索提示列表
                arr_saerch_hint : [],
            }
        },

        methods:{

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
            },

            /**
             * 点击表单搜索框事件
             */
            func_search_iptFocus() {
                this.bool_search_searching = true;
            },

            /**
             * 清空搜索关键词
             */
            func_search_clear() {
                this.txt_search_keyword = '';
            },

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
            },

            /**
             * 单项点击提交(热搜,历史,关键词等)
             */
            func_search_wordClick(e) {
                this.txt_search_keyword = e.target.innerText;
                this.func_search_form_submit();
            },

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
            },

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
            },

            /**
             * 搜索控件搜索得到数据初始化与事件
             */
            func_search_getData_init() {
                let _self = this;
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
        },
    }
</script>