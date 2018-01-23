import BaseVue  from 'base.vue';
import { Component } from 'vue-property-decorator';
import service from './team.service';
import './team.scss';


@Component({
    template: require('./team.html'),
})

export class MyTeam extends BaseVue {
    teamData = {
        inviteWdInfo: {},
        upperWdInfo: {},
        teamList: [],
        flag: 1,
    };
    teamNum = 0;
     _$service;
     _dialog;

    mounted() {
        let _self = this;
        _self._dialog = _self.$store.state.$dialog;
        _self._$service = service(_self.$store);
        _self.$nextTick(() => {
            _self.queryTeamData();
        });
    }

    /**
     * 查看某个等级的下级
     * @param grade
     */
    toTeamList(grade) {
        this.$router.push({ path: 'team_list', query: { grade: grade } });
    }

    /**
     * 查询我的团队数据
     */
    queryTeamData() {
        let _self = this;
        _self._$service.queryTeamData().then((res) => {
            if (res.data.errorCode) {
                _self._dialog({
                    dialogObj: {
                        title: '提示',
                        type: 'error',
                        content: '服务器错误,请稍后再试！',
                        mainBtn: '返回首页',
                        mainFn() {
                            _self.$router.push('cms_home');
                        }
                    }
                });
            }
            _self.teamData = res.data;
            _self.teamNum = 0;
            for (let i = 0, arr = _self.teamData.teamList, len = arr.length; i < len; i++) {
                _self.teamNum += arr[i].count;
            }
        });
    }
}
