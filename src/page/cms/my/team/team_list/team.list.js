import  BaseVue  from 'base.vue';
import { Component } from 'vue-property-decorator';
import './team.list.scss';

import service from './team.list.service';

@Component({
    template: require('./team.list.html')
})

export class TeamList extends BaseVue {
    grade = 0;

    dataList = [];
    queryPage = 0;
    queryLimit = 10;
    queryFlag = true;
    _$service;

    mounted() {
        let _self = this;
        _self.grade = this.$route.query.grade;
        // 注册服务
        this._$service = service(this.$store);
        // DOM加载完成
        this.$nextTick(() => {
            _self.queryTeamList();
        });
    }

    queryTeamList(cb = null){
        let _self = this;
        _self._$service.queryTeamList(_self.grade).then((res) => {
            _self.dataList = res.data;
            cb && cb();
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
