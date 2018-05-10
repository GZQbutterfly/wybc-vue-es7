import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isNotLogin, toLogin } from 'common.env';
import service from "./fans_record.service";
import './fans_record.scss';
@Component({
    template: require('./fans_record.html')
})
export class FansRecord extends BaseVue {
    navLists = ["已关注", "已取关",'已开店'];
    //当前显示下标 
    showIndex = 0;
    //记录
    produceRecord = { recordsTotal: 0, totalGold: 0, data: [] };
    //页码
    page = 1;
    subscribe = 1; 		//1：关注，2：取关
    firstLoad = true;
    firstswitch = true;
    _$service;
    mounted() {
        document.title = "粉丝记录";
        let flag = isNotLogin();
        let _self = this;

        _self._$service = service(_self.$store);
        if (flag) {
            // let dialogObj = {
            //     title: "提示",
            //     content: '请登录',
            //     assistBtn: '',
            //     mainBtn: '确定',
            //     type: 'info',
            //     assistFn() { },
            //     mainFn() {
            toLogin(_self.$router, { toPath: 'fans_record', realTo: 'fans_record' });
            //     }
            // };
            // _self.$store.state.$dialog({ dialogObj });
            return;
        }
        this.subscribe = this.$route.query.type;
        if (!this.subscribe) {
            this.subscribe = 1;
        }
        _self.initPage(this.subscribe);
    }
    //初始化
    async initPage(subscribe) {
        this.page = 1;
        this.firstLoad = true;
        // this.produceRecord = { recordsTotal: 0, totalGold: 0, data: [] };
        this.showIndex = Number(subscribe) - 1;
        let _data = {
            subscribe: subscribe,			//subscribe:1 		//1：关注，2：取关
            page: 1,
            limit: 10
        }
        if (subscribe==3){
            _data.hasShop=1;
        }
        let _result = (await this._$service.getMoneyDetail(_data)).data;
        if (_result.errorCode) {
            return;
        }
        this.produceRecord = _result;
        if(_result.data&&_result.data.length){
            this.firstLoad = false;
        }
      
    }
    //刷新
    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.subscribe = _self.$route.query.type;
            if (!_self.subscribe) {
                _self.subscribe = 1;
            }
            _self.initPage(_self.subscribe);
            done(true);
        }, 500);
    }
    //加载
    infinite(done) {
        let _self = this;
        if (_self.firstLoad) {
            done(true);
            return;
        }
        setTimeout(() => {
            _self.loadMore(done);
        }, 500);
    }
    //切换
    switchtab(i) {
        this.showIndex = i;
        this.initPage(i + 1);
        this.subscribe = i + 1;
        this.$router.replace({ path: 'fans_record', query: { type: i + 1 } });
    }
    //加载更多
    loadMore(done) {
        this.page++;
        if (this.page < 2) {
            this.page = 2;
        }
        let _self = this;
        let _data = {
            subscribe: _self.subscribe,			//subscribe:1 		//1：关注，2：取关
            page: _self.page,
            limit: 10
        }
        if (_self.subscribe == 3) {
            _data.hasShop = 1;
        }
        this._$service.getMoneyDetail(_data).then(res => {
            if (!res.data || !res.data.data || res.data.data.length == 0) {
                _self.page--;
                done(true);
            } else {
                _self.produceRecord.data.push(...res.data.data);
                done(false);
            }
        })
    }
}