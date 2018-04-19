import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isNotLogin, toLogin } from 'common.env';
import service from "./detail.service";
import './detail.scss';
@Component({
    template: require('./detail.html')
})
export class MoneyGoldDetail extends BaseVue {
    moneyDetailList = ["产生记录", "消费记录"];
    //当前显示下标 
    showIndex = 0;
    //记录
    produceRecord = { goldAmount: 0, nowGold: 0, goldDetails: [] };
    //页码
    page = 1;
    goldType = 1;
    firstLoad = true;
    firstswitch = true;
    _$service;
    mounted() {
        document.title = "金币明细";
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
            toLogin(_self.$router, { toPath: 'money_detail', realTo: 'money_detail' });
            //     }
            // };
            // _self.$store.state.$dialog({ dialogObj });
            return;
        }
        this.goldType = this.$route.query.type;
        if (!this.goldType) {
            this.goldType = 1;
        }
        _self.initPage(this.goldType);
    }
    //初始化
    async initPage(goldType) {
        this.page = 1;
        this.firstLoad = true;
        this.produceRecord = { goldAmount: 0, nowGold: 0, goldDetails: [] };
        this.showIndex = Number(goldType) - 1;
        let _data = {
            goldType: goldType,			//金币途径类型（产生：1，消费：2）
            page: 1,
            limit: 10
        }
        let _result = (await this._$service.getMoneyDetail(_data)).data;
        if (_result.errorCode) {
            return;
        }
        _result.goldAmount = ("" + _result.goldAmount).replace(/\-/, "");
        this.produceRecord = _result;
        this.firstLoad = false;
    }
    //刷新
    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.goldType = _self.$route.query.type;
            if (!_self.goldType) {
                _self.goldType = 1;
            }
            _self.initPage(_self.goldType);
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
        this.goldType = i + 1;
        this.$router.replace({ path: 'money_gold_detail', query: { type: i + 1 } });
        // if(this.firstswitch){

        //     this.firstswitch = false;
        // }

    }
    //加载更多
    loadMore(done) {
        this.page++;
        if (this.page < 2) {
            this.page = 2;
        }
        let _self = this;
        let _data = {
            goldType: _self.goldType,			//金币途径类型（产生：1，消费：2）
            page: _self.page,
            limit: 10
        }
        this._$service.getMoneyDetail(_data).then(res => {
            if (res.data.goldDetails.length == 0) {
                _self.page--;
                done(true);
            } else {
                _self.produceRecord.goldDetails.push(...res.data.goldDetails);
                done(false)
            }
        })
    }
}