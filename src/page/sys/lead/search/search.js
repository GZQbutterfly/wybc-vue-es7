import { Component, Watch } from 'vue-property-decorator';
import BaseVue from 'base.vue';


import { debounce, find, isEmpty } from 'lodash';
import ShopBox from 'components/shop_box/shop.box.vue';

import service from './search.service';

import './search.scss';
@Component({
    template: require('./search.html'),
    components: {
        'shop-box': ShopBox
    }
})
export class Search extends BaseVue {
    ipt_search = '';
    frm_push = false;
    key_load = true;
    data_history = [];
    data_keyword = [];
    data_list = [];
    search_page = 0;
    search_limit = 10;
    oldValue = '';
    _$service;
    firstLoad = false;

    mounted() {
        //注册服务
        this._$service = service(this.$store);
        let _self = this;
        //输入框的改变
        let _change = debounce(() => {
            console.log('监听到输入框的值改变...')
            if (_self.ipt_format === '') {
                _self.data_keyword = [];
                _self.data_history = _self._$service.getShowHistory();
                return;
            }
            if (_self.key_load) {
                _self._$service.queryKeyWordList(_self.ipt_format).then((res) => {
                    console.log('关键词列表:', res);
                    _self.data_keyword = res.data.suggest;
                });
            }
            _self.key_load = true;
        }, 500);
        this.$watch('ipt_search', () => {
            _change();
        });
        this.data_history = this._$service.getShowHistory();
        this.updateWxShare({ hideAllItem: true });
        this.$nextTick(() => {
            //初始化
            this.initSearch();
        });
    }

    //初始化搜索
    initSearch() {
        //init
        this.ipt_search = '';
        let _self = this;
        let _cache = JSON.parse(sessionStorage.search_shop_cache || null) || {};
        if (!isEmpty(_cache)) {
            sessionStorage.removeItem('search_shop_cache');
            _self.frm_push = true;
            _self.key_load = false;
            _self.data_list = _cache.data_list;
            _self.search_page = _cache.page;
            _self.ipt_search = _cache.ipt_search;
            _self.firstLoad = !(_self.data_list.length < 10);
        } else {
            _self.$refs.searchRef.focus();
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
    querySearch() {
        let _self = this;
        let search = _self.ipt_format;
        //判断数据有效
        if (search) {
            _self.frm_push = true;
            if (_self.oldValue !== _self.ipt_search) {
                _self.oldValue = _self.ipt_search;
                _self.data_list = [];
                _self._$service.setHistory(_self.ipt_search);
            }
            _self.search_init().then((datas) => {
                _self.setData(datas);
                this.firstLoad = !(datas.length < 10);
            });
        } else {
            _self.frm_push = false;
        }
        _self.$refs.searchRef.blur();
    }

    //热搜,历史,关键词等点击
    word_click(e) {
        this.key_load = false;
        this.ipt_search = e.target.innerText;
        this.querySearch();
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
        return this.search_next(callBack);
    }

    //得到下一页搜索结果
    async search_next(callBack) {
        let _self = this;
        //TODO page++ and  showpage
        this.search_page++;
        let _result = (await this._$service.queryShopList(this.ipt_format, this.search_page, this.search_limit)).data;
        if (_result.errorCode) {
            this.search_page--;
            return [];
        }
        let _list = _result.data;
        if (_list.length < 10) {
            this.search_page--;
        }
        return _list;
    }

    setData(datas, flag) {
        let newList = [];
        for (let i = 0, len = datas.length; i < len; i++) {
            let _data = datas[i];
            let isExist = find(this.data_list, { infoId: _data.infoId });
            isExist || (newList.push(_data));
        }
        newList.length && this.data_list.push(...newList);
    }

    //刷新
    refresh(done) {
        let _self = this;
        let _result = this.search_init();
        this.firstLoad = false;
        setTimeout(() => {
            _result.then((datas) => {
                _self.setData(datas);
                done(true);
            })
        }, 500);
    }

    //加载
    infinite(done) {
        if (!this.firstLoad) {
            this.firstLoad = true;
            done(true);
            return;
        }
        let _self = this;
        let _result = _self.search_next();
        setTimeout(() => {
            _result.then((datas) => {
                _self.setData(datas, true);
                done(true);
            });
        }, 500);
    }

    toHome(item) {
        let cache = {
            ipt_search: this.ipt_search,
            data_list: this.data_list,
            page: this.search_page
        };
        sessionStorage.search_shop_cache = JSON.stringify(cache);

        // 进入页面首页时，将该店铺信息写入缓存

        let localWdInfo = localStorage.wdVipInfo ? JSON.parse(localStorage.wdVipInfo) : {};

        localStorage.wdVipInfo = JSON.stringify(Object.assign(localWdInfo, item));


        this.$router.push({ path: 'home', query: { shopId: item.infoId || item.shopId, from: 'lead' } })
    }
}

