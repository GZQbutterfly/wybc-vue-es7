import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { GoodsList } from '../../web/malls/goods_list/goods_list';
import { debounce } from 'lodash';
import searchService from './search.service';
import './search.scss';
import finishToCar from "../../web/malls/shop_car/finishToCar";
@Component({
    template: require('./search.html'), components: { "list-goods": GoodsList }
})

export class Search extends BaseVue {
    ipt_search = '';
    frm_push = false;
    data_hot = [];
    data_history = [];
    data_keyword = [];
    data_goods = { 'data': [] };
    data_goods_arr = [[], []];
    search_page = 0;
    search_pages_arr = [1, 1]
    search_limit = 10;
    search_flag = false;
    _$service;
    navIndex = -1;
    status = 'agentmalls';
    magType = 0;//搜索状态 0是代理 1是直营
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
            //  this._$service.setHistory(this.ipt_format);
        } else {
            //初始化输入框聚焦
            _self.$refs.searchRef.focus();
            this.frm_push = false;
            //document.getElementById('ipt-search').focus();
        }

    }


    //搜索来源 默认选中哪一个
    entryMode(data_goods_arr) {
        let _origin = this.$route.query.origin;
        if (this.navIndex != -1) {
            // 第一次的 搜索来源 默认选中哪一个
            return;
        }
        if (_origin == 'home' || _origin == 'classify') {
            if (data_goods_arr[0].length != 0) {
                this.navIndex = 0;
            } else if (data_goods_arr[0].length == 0 && data_goods_arr[1].length != 0) {
                this.navIndex = 1;
            } else {
                this.navIndex = 0;
            }
        } else {
            if (data_goods_arr[1].length != 0) {
                this.navIndex = 1;
            } else if (data_goods_arr[1].length == 0 && data_goods_arr[0].length != 0) {
                this.navIndex = 0;
            } else {
                this.navIndex = 1;
            }
        }

        this.status = this.navIndex == 0 ? 'agentmalls' : 'officialmalls';
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
                setTimeout(() => {
                    this.$router.push({ path: 'search', query: query });
                }, 100);
               
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
        this.search_pages_arr = [1, 1]
        this.data_goods_arr = [[], []];
        // this.data_goods = { 'data': [] };
        this.search_flag = true;
        this.search_next(callBack);
    }

    //得到下一页搜索结果
    async search_next(callBack) {
        let _self = this;
        //TODO page++ and  showpage
        let directmalls = (await this._$service.getGoods(this.ipt_format, 1, this.search_limit, 1)).data;
        let agentmalls = (await this._$service.getGoods(this.ipt_format, 1, this.search_limit, 0)).data;

        if (!directmalls.direct) {
            directmalls.direct = [];
        } else {
            directmalls.direct.forEach(element => {
                element.warehouseFlag = 1
            });
        }
        if (!agentmalls.agent) {
            agentmalls.agent = [];
        } else {
            agentmalls.agent.forEach(element => {
                element.warehouseFlag = 0
            });
        }
        _self.$set(_self.data_goods_arr, 0, _self.data_goods_arr[0].concat(directmalls.direct));
        _self.$set(_self.data_goods_arr, 1, _self.data_goods_arr[1].concat(agentmalls.agent));

        if (_self.ipt_format&&(directmalls.direct.length != 0 || agentmalls.agent.length != 0)) {
            //保存到历史记录
            _self._$service.setHistory(_self.ipt_format);
        }
        //默认加载哪一项
        _self.entryMode(_self.data_goods_arr);

        _self.data_goods.data = _self.data_goods_arr[_self.navIndex];
        //检查是否有下一页
        _self.search_flag = true;
        callBack && callBack();
        return true;
    }
    async search_next_directmalls(callBack) {
        this.search_pages_arr[0]++;
        if (this.search_pages_arr[0] == 1) {
            this.search_pages_arr[0] = 2;
        }
        let directmalls = (await this._$service.getGoods(this.ipt_format, this.search_pages_arr[0], this.search_limit, 1)).data;
        if (!directmalls.direct || directmalls.direct.length == 0) {
            directmalls.direct = [];
        } else {
            directmalls.direct.forEach(element => {
                element.warehouseFlag = 1
            });
        }
        this.$set(this.data_goods_arr, 0, this.data_goods_arr[0].concat(directmalls.direct));
        this.data_goods.data = this.data_goods_arr[this.navIndex];
        callBack && callBack();
    }

    async search_next_agentmalls(callBack) {
        this.search_pages_arr[1]++;
        if (this.search_pages_arr[1] == 1) {
            this.search_pages_arr[1] = 2;
        }
        let agentmalls = (await this._$service.getGoods(this.ipt_format, this.search_pages_arr[1], this.search_limit, 0)).data;
        if (!agentmalls.agent || agentmalls.agent.length == 0) {
            agentmalls.agent = [];
        } else {
            agentmalls.agent.forEach(element => {
                element.warehouseFlag = 0
            });
        }
        this.$set(this.data_goods_arr, 1, this.data_goods_arr[1].concat(agentmalls.agent));
        this.data_goods.data = this.data_goods_arr[this.navIndex];
        callBack && callBack();
    }

    joinCar(item) {
        // console.log(item.warehouseFlag);
        finishToCar(this.$store).finishToCar(this, item, "search", item.warehouseFlag);
    }
    //刷新
    refresh(done) {
        setTimeout(() => {
            this.search_init(done);
        }, 500)
    }

    //加载
    infinite(done) {
        let _self = this;
        if (this.search_flag) {
            if (this.navIndex == 0) {
                setTimeout(() => {
                    _self.search_next_directmalls(done(true));
                }, 500)
            } else {
                setTimeout(() => {
                    _self.search_next_agentmalls(done(true));
                }, 500)
            }

        } else {
            done(true);
        }
    }
    swichNav(index) {
        this.navIndex = index;
        this.data_goods.data = this.data_goods_arr[index];
        this.status = index == 0 ? 'agentmalls' : 'officialmalls';
    }
}
// done(!(_self.search_flag && _self.search_next()));
