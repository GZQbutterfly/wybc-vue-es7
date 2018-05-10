import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './passwordset.service';
import passwordInput from '../../../../../commons/vue_plugins/components/pay/input.vue';
import {
    stringMD5
} from 'common.env';

import './passwordset.scss';


@Component({
    template: require('./passwordset.html'),
    components: {
        psinput: passwordInput,
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


    passwordOver(text) {
        if (this.currentStep == 1) { //第一次设置密码
            if (this.checkContinuous(text) || this.checkRepeat(text)) {
                let _self = this;
                this.$store.state.$dialog({
                    dialogObj: {
                        title: '提示',
                        content: '不能设置为连续或重复数字',
                        type: 'error',
                        mainBtn: '确认',
                        mainFn() {
                            _self.currentStep = 1;
                        }
                    }
                });
            } else {
                this.fristPassword = text;
                this.currentStep = 2;
            }
        } else {
            if (!this.equalsArray(this.fristPassword, text)) {
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
                let _password = text;
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
                            _self.$store.state.$dialog({
                                dialogObj: {
                                    title: '',
                                    content: '支付密码设置成功',
                                    type: 'info',
                                    mainBtn: '确认',
                                    mainFn() {
                                        if (_self.$route.query.toPay) {
                                            _self.payOrder();
                                        } else {
                                            _self.$router.back();
                                        }
                                    }
                                }
                            });
                        }
                    })
            }
        }
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

    payOrder() {
        let _param = {
            combinOrderNo: this.$route.query.combinOrderNo,
            payType: 'SYS',
        }

        let _self = this;
        this._$service.payCMSOrder(_param)
            .then(res => {
                let _data = res.data;
                if (!_data || _data.errorCode) {
                    let dialogObj = {
                        title: '提示',
                        content: _data.msg ? _data.msg : '系统错误',
                        assistBtn: '',
                        type: 'info',
                        mainBtn: '确定',
                        assistFn() {},
                        mainFn() {}
                    }
                    _self.$store.state.$dialog({
                        dialogObj
                    });
                    return;
                } else {
                    let _sign = _data.sign;
                    let _query = _self.$route.query;
                    let _toQuery = {
                        combinOrderNo: _query.combinOrderNo,
                        totalMoney: _query.orderTotalMoney,
                        sign: _sign
                    }
                    _self.$router.replace({
                        path: 'sys_pay',
                        query: _toQuery
                    })
                }
            })
    }
}