import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './fastStore.service';

import './fastStore.scss';

@Component({
    template: require('./fastStore.html'),
})

export class FastStore extends BaseVue {


    fastDeliveryInfo = {};

    isShowPEITU = false;

    mounted() {
        this._$service = service(this.$store);
        let _self = this;
        this.$nextTick(() => {
            _self.initPage();
        });
    }

    async initPage(){
        let result = await this._$service.checkFastDeliveryState();
        if (!result||!result.data||result.data.errorCode) {
             
        }else{
            this.fastDeliveryInfo = result.data;
            this.isShowPEITU = true;
        }
    }

    changeState(){
        
        let _self = this;
        let state = true;
        if (this.fastDeliveryInfo.state) {
            state = false;
        }
        
        let dialogObj = {
            title: '',
            content: state?'确定开启快速仓?':'确认关闭快速仓?',
            type: 'info',
            assistBtn: '取消',
            mainBtn: '确认',
            assistFn() {
            },
            mainFn() {
                _self._$service.changeState({state:state})
                .then(res=>{
                    if(!res||res.errorCode){
                        let dialogObj = {
                            title: '',
                            content: res.msg,
                            type: 'info',
                            assistBtn: '取消',
                            mainBtn: '确认',
                            assistFn() {
                            },
                            mainFn() {
                            }
                        };
                        _state.$dialog({ dialogObj });
                    }else{
                        window.history.back();
                    }
                }) ;
            }
        };
        this.$store.state.$dialog({ dialogObj });
              
    }
    
    goEdit(){
        this.$router.push({ path: 'faststore_info',query:{from:this.$route.query.from}});
    }

    checkinfoNotNull(){
        return this.fastDeliveryInfo != {};
    }
}