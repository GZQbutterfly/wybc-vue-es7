import { Component } from 'vue-property-decorator';// 路由权限监控
import { closeDialog, isNotLogin, toLogin } from 'common.env';
import BaseVue from 'base.vue';
import service from './task.service';
import './task.scss';

@Component({
    template: require('./task.html')
})

export class DayTask extends BaseVue {
    data_friend = [];
    data_goods = {
        'data': [],
        'securableGold': 0
    };
    user = {};

    mounted() {
        let _self = this;
        document.title = "每日任务";
        _self.user = _self.$store.state.workVO.user;
        _self._$service = service(_self.$store);
        _self.$nextTick(() => {
            _self.getTaskList();
        });
    }

    /**
     * 获取任务列表
     */
    async getTaskList() {
        let _self = this;
        let res_goods = await _self._$service.getTaskListGoods();
        res_goods = res_goods.data;
        if (res_goods.data) {
            _self.data_goods.data = res_goods.data;
            _self.data_goods.securableGold = res_goods.securableGold;
        }
        let res_friend = await _self._$service.getTaskListFirend();
        res_friend = res_friend.data;
        if (!res_friend.errorCode) {
            _self.data_friend = res_friend.data;
        }
    }

    /**
     * 查看规则
     */
    toRules(state) {
        let _self = this;
        _self.$router.push({ path: 'day_task_rules', query: {state: state}});
    }

    /**
     * 去做任务
     */
    toShare() {
        let _self = this;
        //判断是否绑定微信号
        // if(_self.user.openid){
        _self.$router.push('day_task_share');
        // }else{
        //     let dialogObj = {
        //         title: '提示',
        //         content: '您的帐号未绑定微信号，不可分享。',
        //         type: 'info',
        //         mainBtn: '确定',
        //         assistFn() {
        //         },
        //         mainFn() {
        //         }
        //     };
        //     _self.$store.state.$dialog({ dialogObj });
        // }
    }

    /**
     * 
     */
    toHome() {
        let _self = this;
        _self.$router.push('home');
    }

    /**
     * 领取奖励
     */
    async getGold(index, isDayTask = true) {
        let _self = this;
        let dayTaskId = (isDayTask ? _self.data_goods.data[index] : _self.data_friend[index]).dayTaskId;
        let data = {
            dayTaskId: dayTaskId
        }
        let res = await _self._$service.getTaskGold(data);
        if (res.data && res.data.success) {
            let dialogObj = {
                title: '领取奖励',
                content: '领取奖励成功',
                type: 'success',
                mainBtn: '',
                assistFn() {
                },
                mainFn() {
                }
            };
            _self.$store.state.$dialog({ dialogObj });
            setTimeout(() => {
                closeDialog();
                _self.getTaskList();
            }, 1000);
        } else {
            let dialogObj = {
                title: '提示',
                content: res.data.msg || '系统错误',
                type: 'error',
                mainBtn: '确定',
                assistFn() {
                },
                mainFn() {
                    _self.getTaskList();
                }
            };
            _self.$store.state.$dialog({ dialogObj });
        }
    }
}