// 我的库存
import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';
import InventoryListService from './inventory.list.service';

import './inventory.list.scss';
@Component({
    template: require('./inventory.list.html')
})

export class MyInventoryList extends BaseVue {
    //key
    keyword = '';
    //搜索框的文本
    ipt_search = '';
    //搜索结果的页码
    search_page = 0;
    //一页一条数据
    search_limit = 10;
    //搜索是否有下一页
    search_flag = true;
    //界面上显示的商品数据
    goodsData = { 'data': [] };
    _$service;

    mounted() {
        //注册服务
        this._$service = InventoryListService(this.$store);

        this.$nextTick(() => {
            document.title = "我的库存";
            this.initPage();
        });
    }

    /**
     * 初始化网页
     */
    initPage() {
        //初始化search
        //this.search_init();
        //监听路由变化
        this.$watch('$route', () => {
            console.log('\n\n正在改变路由', this.$route.fullPath);
            let search = this.$route.query.search || '';
            this.ipt_search = search;
            this.search_init();
        });
    }

    /**
     * 点击搜索
     */
    func_search() {
        let search = this.ipt_format;
        //判断数据有效
        // if (search) {
        // hash  =>  解决相同路由相同参数连续查询
        let hash = this.$route.query.hash;
        // '==' for undefined
        hash = (hash == '1' ? '0' : '1');
        let query = { search: search, hash: hash };
        //replace url
        this.$router.replace({ path: 'my_inventory_list', query: query });
        // }
        event.preventDefault();
        window.event.returnValue = false;
        return false;
    }

    /**
     * 跳转到商品详情
     */
    goGoods(goodsId) {
        this.$router.push({ path: 'cms_purchase_goods_detail', query: { goodsId: goodsId } })
        event.stopPropagation();
    }

    /**
     * 跳转到库存详情
     */
    goDetail(goodsId) {
        this.$router.push({ path: 'my_inventory_detail', query: { goodsId: goodsId } })
    }

    //输入框文字格式化
    get ipt_format() {
        return this.ipt_search.replace(/\s+/g, ' ').trim();
    }

    //初始化搜索结果  在提交关键词和下拉刷新时
    search_init(callBack = null) {
        console.log('正在初始化查询关键字:', this.ipt_format, '(为空则查询所有)');
        //TODO page=0
        this.search_page = 0;
        //this.goodsData = { 'data': [] };
        return this.search_next(callBack);
    }

    //得到下一页搜索结果
    search_next(callBack = null) {
        let _self = this;
        //TODO page++ and  showpage
        this.search_page++;
        return new Promise((reslove, reject) => {
            this._$service.queryStockList(this.ipt_format, this.search_page, this.search_limit).then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    reslove([]);
                } else {
                    reslove(_result.data);
                }
                callBack && callBack();
            }).catch(() => {
                reslove([]);
            });
        });
    }
    setStockList(datas, flag = false) {
        (flag ? (this.goodsData.data= datas) : (this.goodsData.data.push(...datas)));
    }
    /**
     * 下拉刷新
     */
    refresh(done) {
        let _self = this;
        let _result = _self.search_init();
        setTimeout(function () {
            _result.then((datas) => {
                _self.setStockList(datas, true);
                done(true);
            });
        }, 500);
    }

    /**
     * 上拉加载
     */
    infinite(done) {
        let _self = this;
        if (this.search_flag) {
            let _result = this.search_next();
            setTimeout(function () {
                _result.then((datas) => {
                    _self.setStockList(datas);
                    done(true);
                });
            }, 500);
        } else {
            done(true);
        }
    }
}
