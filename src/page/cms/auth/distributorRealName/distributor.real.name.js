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

    toForm() {
        if(this.hasErr){
            this.$router.push('cms_home');
        }else{
            this.$router.push('distributor_realname_form');
        }
    }

    async checkRealName(){
        let _self = this;
        let res = await _self._$service.queryRealName();
        res = res.data;
        console.log(11111,res.data)
        if(res.errorCode){
            _self.hasErr = true;
        }else if(res.data.state != 4){
            let dialogObj = {
                title: '提示',
                content: '您未实名认证，不能申请配送员认证！',
                type: 'info',
                mainBtn: '立即认证',
                assistFn() {
                },
                mainFn() {
                    if (res.data.state == 0 || res.data.state == 3) {
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
