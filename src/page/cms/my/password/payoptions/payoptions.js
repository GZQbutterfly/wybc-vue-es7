import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './payoptions.service';

@Component({
    template: require('./payoptions.html'),
})


export class PayOptions extends BaseVue {

    _$service ;

    hasPassword = false;

    passwordAble = false;

    mounted(){
        this._$service = service(this.$store);
        let _self = this;
        this.$nextTick(() => {
            document.title = '支付设置';
            _self.initPage();
        });
    }

    async initPage() {
        let _result = await this._$service.queryPasswordState();
        if (_result && !_result.errorCode) {
            this.hasPassword = _result.data.status;
        }

        let _lock = await this._$service.queryLockState();
        if (_lock && !_lock.errorCode) {
            this.passwordAble = !_lock.data.isLock;
        }
    }

    setPayPassWord(){
        this.$router.replace({path:"password",query:{step:1}});
    }

    changePayPassWord(){
        this.$router.replace({path:"password_check"});
    }
    
}