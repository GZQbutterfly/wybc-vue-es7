import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './passwordset.service';
import passwordInput from '../../../../../commons/vue_plugins/components/pay/input.vue';
import keyboard from '../../../../../commons/vue_plugins/components/pay/keyboard.vue';
import {
    stringMD5
} from 'common.env';

import './passwordset.scss';


@Component({
    template: require('./passwordset.html'),
    components: {
        psinput: passwordInput,
        keyboard: keyboard
    }
})


export class PayPasswordSet extends BaseVue {

    fristPassword = [];

    secondPassword = [];

    phone;

    //当前设置步数;
    currentStep = 1;

    sign = null;
    _$service;
    mounted() {
        this.sign = this.$route.query.sign;
        let _userInfo = this.$store.state.workVO.user;
        this.phone = _userInfo.phone;
        this._$service = service(this.$store);
    }

    keyUpHandle(text) {
        if (!text) {
            return;
        }
        if (this.currentStep == 1) { //第一次设置密码
            let len = this.fristPassword.length
            this.fristPassword.push(text)
            let _self = this;
            if (this.fristPassword.length >= 6) {
                let _passwordStr = this.fristPassword.join('');
                if (this.checkContinuous(this.fristPassword)||this.checkRepeat(this.fristPassword)) {
                    this.$store.state.$dialog({
                        dialogObj: {
                            title: '提示',
                            content: '不能设置为连续或重复数字',
                            type: 'error',
                            mainBtn: '确认',
                            mainFn() {
                                _self.fristPassword = [];
                                _self.currentStep = 1;
                            }
                        }
                    });
                }else{
                    this.currentStep = 2;
                }
            }
        } else {
            let len = this.secondPassword.length
            this.secondPassword.push(text)
            if (this.secondPassword.length >= 6) {
                if (!this.equalsArray(this.fristPassword, this.secondPassword)) {
                    let _self = this;
                    this.$store.state.$dialog({
                        dialogObj: {
                            title: '提示',
                            content: '两次密码不一致，请重新设置',
                            type: 'error',
                            mainBtn: '确认',
                            mainFn() {
                                _self.fristPassword = [];
                                _self.secondPassword = [];
                                _self.currentStep = 1;
                            }
                        }
                    });
                } else {
                    let _password = this.secondPassword.join('');
                    let _data = {
                        payPassword: stringMD5(_password),
                        phone: this.phone,
                        sign: this.sign,
                        type: this.sign ? 1 : 2,
                    }
                    let _self = this;
                    this._$service.setPassword(_data)
                        .then(res => {
                            if (!res || !res.data || res.data.errorCode) {
                                _self.$store.state.$dialog({
                                    dialogObj: {
                                        title: '提示',
                                        content: res.data.msg ? res.data.msg : '系统错误',
                                        type: 'error',
                                        mainBtn: '确认',
                                        mainFn() {
                                            _self.fristPassword = [];
                                            _self.secondPassword = [];
                                            _self.currentStep = 1;
                                        }
                                    }
                                });
                            } else {
                                _self.$router.back();
                            }
                        })
                }
            }
        }
    }

    delHandle() {
        let _password = this.currentStep == 1 ? this.fristPassword : this.secondPassword;
        if (_password.length <= 0) {
            return false;
        }
        _password.pop();
    }

    equalsArray(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false;
        }
        for (let index = 0; index < arr1.length; index++) {
            const element1 = arr1[index];
            const element2 = arr2[index];
            if (element1 != element2) {
                return false;
            }
        }
        return true;
    }

    checkContinuous(password) {
        let _apt = new Array;
        for (let index = 0; index < password.length - 1; index++) {
            const element = password[index];
            const element1 = password[index + 1];
            let _apt = element - element1;
            if (_apt != 1 && _apt != -1) {
                return false;
            }
        }
        return true;
    }

    checkRepeat(password) {
        let _apt = new Array;
        for (let index = 0; index < password.length - 1; index++) {
            const element = password[index];
            const element1 = password[index + 1];
            let _apt = element - element1;
            if (_apt != 0) {
                return false;
            }
        }
        return true;
    }
}