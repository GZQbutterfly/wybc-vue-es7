import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { toLogin } from 'common.env';
import service from './options.service';

import './options.scss';

@Component({
    template: require('./options.html'),
})

export class Options extends BaseVue {
    mounted() {
        this._$service = service(this.$store);
    }
    changeAccount(){
        let _self = this;
        let dialogObj = {
            title: '切换账号',
            content: '确认切换账号？',
            type: 'info',
            assistBtn: '取消',
            mainBtn: '确认',
            assistFn() {
            },
            mainFn() {
                toLogin(_self.$router, { toPath: 'cms_home' })
            }
        };
        this.$store.state.$dialog({ dialogObj });
    }

    gofastStore(){
        let _self = this;
        this._$service.checkFastDeliveryState()
        .then(res=>{
            if (!res||!res.data||res.data.errorCode) {
                
            }else if(res.data.ifHasInfo){
                _self.$router.push({ path: 'faststore_info' ,query:{from:'options'}});
            }else{
                _self.$router.push({ path: 'fast_store',query:{from:'options'} })
            }
        })
    }
    changePayPassWord(){
        this.$router.push({path:'payoptions'});
    }
}