import BaseVue from 'base.vue';
import { Component } from 'vue-property-decorator';
import './my_recommendation.scss';
import { isNotLogin, toLogin } from 'common.env';

import service from './my_recommendation.service';

@Component({
    template: require('./my_recommendation.html')
})

export class MyRecommendation extends BaseVue {
    recordsTotal = 0;
    totalGold = 0;
    dataList = [];
    queryPage = 0;
    queryLimit = 10;
    queryFlag = true;
    _$service;

    mounted() {
        document.title="我的推荐";
        let _self = this;
        let flag = isNotLogin();
        if (flag) {
            // let dialogObj = {
            //     title: "提示",
            //     content: '请登录',
            //     assistBtn: '',
            //     mainBtn: '确定',
            //     type: 'info',
            //     assistFn() { },
            //     mainFn() {
            toLogin(_self.$router, { toPath: 'my_recommendation', realTo: 'my_recommendation' });
            //     }
            // };
            // _self.$store.state.$dialog({ dialogObj });
            return;
        }
       
        // 注册服务
        this._$service = service(this.$store);
        // DOM加载完成
        this.$nextTick(() => {
            _self.queryTeamList();
        });
    }

    queryTeamList(cb = null) {
        let _self = this;
        this._$service.queryTeamList().then((res) => {
            if (!res.data.errorCode) {
                _self.dataList = res.data.data;
                _self.totalGold = res.data.totalGold;
                _self.recordsTotal = res.data.recordsTotal;
                cb && cb();
            }
        });
    }

    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.queryTeamList(done(true));
        }, 500)
    }

    infinite(done) {
        done(true);
    }



    //暂时不要分页
    // /**
    //  * 初始化
    //  */
    // queryTeamDataInit(cb){
    //     this.queryPage = 0;
    //     this.queryFlag = true;
    //     this.queryTeamDataNext(cb);
    // }

    // /**
    //  * 下一页
    //  */
    // queryTeamDataNext(cb){
    //     let _self:any = this;
    //     _self.queryPage++;
    //     let data = {
    //         level: _self.level,
    //         page: _self.queryPage,
    //         limit: _self.queryLimit
    //     }
    //     _self._$service.queryTeamList().then((res) => {
    //         if(!this.queryFlag){
    //             return;
    //         }
    //         cb && cb();
    //     });
    // }

    // //刷新
    // refresh(done) {
    //     let _self = this;
    //     setTimeout(() => {
    //         _self.queryTeamDataNext(done());
    //     }, 500)
    // }

    // //加载
    // infinite(done) {
    //     let _self = this;
    //     if (this.queryFlag) {
    //         setTimeout(() => {
    //             _self.queryTeamDataNext(done(false));
    //         }, 500)
    //     } else {
    //         done(true);
    //     }
    // }
}
