// 实名认证
import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';
import distributorService from './distributor.real.name.service';
import { getLocalUserInfo } from 'common.env';
import './distributor.real.name.scss';

@Component({
    template: require('./distributor.real.name.html'),
})

export class DistributorRealName extends BaseVue {
    _$service;
    hasErr = false;

    mounted() {
        document.title = '配送员实名认证';
        let _self = this;
        _self._$service = distributorService(_self.$store);
        _self.$nextTick(() => {
            _self.checkRealName();
        })
    }

    async toForm() {
        let _self = this;
        if(_self.hasErr){
            _self.$router.push('cms_home');
        }else{
            let res = await _self._$service.queryDistributorRealName();
            res = res.data;
            if(res.errorCode){
                let dialogObj = {
                    title: '提示',
                    content: res.msg || '服务器错误，请稍后重试!',
                    type: 'error',
                    mainBtn: '确定',
                    assistFn() {
                    },
                    mainFn() {
                        _self.$router.push('cms_home');
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
            }
            else if(res.pledgeFlag){
                _self.$router.push('distributor_realname_form');
            }else{
                _self.$router.push('distributor_deposit');
            }
        }
    }

    async checkRealName(){
        let _self = this;
        let res = await _self._$service.queryRealName();
        res = res.data;
        if(res.errorCode){
            _self.hasErr = true;
        }else if(res.state != 4){
            let dialogObj = {
                title: '提示',
                content: '您未实名认证，不能申请配送员认证！',
                type: 'info',
                mainBtn: '立即认证',
                assistFn() {
                },
                mainFn() {
                    if (res.state == 0 || res.state == 3) {
                        _self.$router.push('realname');
                    } else {
                        _self.$router.push({ path: 'realname_result', query: {result: res}});
                    }
                }
            };
            _self.$store.state.$dialog({ dialogObj });
        }
    }
}
