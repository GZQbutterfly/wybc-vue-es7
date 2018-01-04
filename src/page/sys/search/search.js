import { Component } from 'vue-property-decorator';
import  BaseVue  from 'base.vue';

import { GoodsList } from '../../web/malls/goods_list/goods_list';


import { debounce } from 'lodash';

import searchService from './search.service';
import './search.scss';

@Component({
    template: require('./search.html'), components: { "list-goods": GoodsList }
})
export class Search extends BaseVue {
    ipt_search = '';
    frm_push = false;
    data_hot= [];
    data_history = [];
    data_keyword = [];
    data_goods = { 'data': [] };

    search_page = 0;
    search_limit = 10;

    search_flag = true;
    _$service;

    created() {

    }

    mounted() {
        //注册服务
        this._$service = searchService(this.$store);
        let _self = this;
        //输入框的改变
        let _change = debounce(function () {
            console.log('监听到输入框的值改变...')
            if (_self.ipt_format === '') {
                _self.data_keyword = [];
                _self.data_history = _self._$service.getShowHistory();
                return;
            }
            _self._$service.getKeyWord_list(_self.ipt_format).then((res) => {
                console.log('关键词列表:', res)
                _self.data_keyword = res.data.suggest;
            });
        }, 500);
        this.$watch('ipt_search', () => {
            _change();
        });
        //监听路由变化
        this.$watch('$route', () => {
            console.log('\n\n正在改变路由', this.$route.fullPath);
            this.initSearch();
        });
        //获取热门搜索以及搜索历史
        this._$service.getKeyWord_hot().then((res) => {
            //test
            console.log('热门搜索', res);
            this.data_hot = res.data.data;
        });
        this.data_history = this._$service.getShowHistory();
        //初始化
        this.initSearch();
    }

    //初始化搜索
    initSearch() {
        //init
        this.ipt_search = '';
        let _self = this;
        //ipt-search失焦 去除上一次的聚焦
        document.getElementById('ipt-search').blur();
        // 检查是否为搜索结果
        let search = this.$route.query.search || '';
        if (search) {
            this.ipt_search = search;
            //saerch ...
            this.search_init(null);
            this.frm_push = true;
            //保存到历史记录
            this._$service.setHistory(this.ipt_format);
        } else {
            //初始化输入框聚焦
            _self.$refs.searchRef.focus();
            //document.getElementById('ipt-search').focus();
        }
    }

    //输入框文字格式化
    get ipt_format() {
        return this.ipt_search.replace(/\s+/g, ' ').trim();
    }

    //输入框聚焦
    ipt_focus() {
        this.frm_push && (this.frm_push = false);
    }

    //输入表单提交
    frm_submit() {
        let search = this.ipt_format;
        //判断数据有效
        if (search) {
            // hash  =>  解决相同路由相同参数连续查询
            let hash = this.$route.query.hash;
            // '==' for undefined
            hash = (hash == '1' ? '0' : '1');
            let origin = this.$route.query.origin || 'home';
            let query = { search: search, origin: origin, hash: hash };
            //第一次打开搜索 跳转记录url
            if (this.$route.query.search) {
                this.$router.replace({ path: 'search', query: query });
            } else {
                this.$router.push({ path: 'search', query: query });
            }
        }
        event.preventDefault();
        window.event.returnValue = false;
        return false;
    }

    //搜索栏按钮提交
    btn_click() {
        if (this.frm_push) {
            // origin
            this.$router.push({ path: (this.$route.query.origin || 'home') });
            event.preventDefault();
            window.event.returnValue = false;
            return false;
        }
    }

    //热搜,历史,关键词等点击
    word_click(e) {
        this.ipt_search = e.target.innerText;
        this.frm_submit();
    }

    //删除/清空历史记录
    delKeyWord(e) {
        let res = this._$service.delHistory(e.target);
        if (res) {
            res.then(() => {
                //update
                this.data_history = this._$service.getShowHistory();
            });
        } else {
            this.data_history = this._$service.getShowHistory();
        }
    }

    //清除关键字
    clearKeyWord() {
        this.ipt_search = '';
        document.getElementById('ipt-search').focus();
    }

    //初始化搜索结果  在提交关键词和下拉刷新时
    search_init(callBack) {
        //TODO page=0
        this.search_page = 0;
        this.data_goods = { 'data': [] };
        this.search_flag = true;
        this.search_next(callBack);
    }

    //得到下一页搜索结果
    search_next(callBack) {
        let _self = this;
        //TODO page++ and  showpage
        this.search_page++;
        this._$service.getGoods(this.ipt_format, this.search_page, this.search_limit).then((res) => {
            console.log('第' + this.search_page + '页数据:', res);
            _self.data_goods.data.push.apply(_self.data_goods.data, res.data.data);
            //检查是否有下一页
            this.search_flag = res.data.data && (_self.search_limit == res.data.data.length);
            console.log('当前页码:' + this.search_page
                + ',加载了' + ((res.data.data && res.data.data.length) || 0) + '条数据.'
                + '\n页码容量:' + _self.search_limit
                + '\n总共加载数据数:' + _self.data_goods.data.length);


            callBack && callBack();

        });
        return true;
    }

    //刷新
    refresh(done) {
        setTimeout(() => {
            this.search_init(done());
        }, 500)
    }

    //加载
    infinite(done) {
        let _self = this;
        if (this.search_flag) {
            setTimeout(() => {
                _self.search_next(done(false));
            }, 500)
        } else {
            done(true);
        }
    }

}
// done(!(_self.search_flag && _self.search_next()));
