import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './payoptions.service';

@Component({
    template: require('./payoptions.html'),
})


export class PayOptions extends BaseVue {

    _$service ;

    hasPassword = false;

    mounted(){
        this._$service = service(this.$store);
        this.$nextTick(() => {
            this.initPage();
        });
    }

    async initPage() {
        let _result = await this._$service.queryPasswordState();
        if (_result && !_result.errorCode) {
            this.hasPassword = _result.data.status;
        }
    }

    setPayPassWord(){
        this.$router.replace({path:"password",query:{step:1}});
    }

    changePayPassWord(){
        this.$router.replace({path:"password_check"});
    }
    
}