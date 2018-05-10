import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './passwordcheck.service';
import passwordInput from '../../../../../commons/vue_plugins/components/pay/input.vue';
import keyboard from '../../../../../commons/vue_plugins/components/pay/keyboard.vue';
import {
    stringMD5
} from 'common.env';

import './passwordcheck.scss';


@Component({
    template: require('./passwordcheck.html'),
    components: {
        psinput: passwordInput,
    }
})


export class PayPasswordCheck extends BaseVue {
    _$service;

    msg = {
        show: false,
        value: '',
    }

    mounted() {
        this._$service = service(this.$store);
    }

    passwordOver(text){
        let _param = {
            payPassword: stringMD5(text),
        }
        let _self = this;
        this._$service.checkPassword(_param)
            .then(res => {
                let _data = res.data;
                if (!_data.errorCode && _data.status) {
                    this.$router.replace({
                        path: "password_set"
                    });
                } else if (!_data.errorCode && !_data.status) {
                    _self.msg.show = true;
                    _self.msg.value = _data.checkCountMap.msg;

                    if (_data.checkCountMap.keepCount == 0) {
                        let dialogObj = {
                            title: '钱包被锁定',
                            content: _data.checkCountMap.msg,
                            assistBtn: '取消',
                            type: 'error',
                            mainBtn: '找回密码',
                            assistFn() {
                                _self.$router.back();
                            },
                            mainFn() {
                                _self.$router.replace("password");
                            }
                        }
                        _self.$store.state.$dialog({
                            dialogObj
                        });
                    }
                } else {
                    let dialogObj = {
                        title: '提示',
                        content: _data.msg ? _data.msg : '密码校验失败',
                        assistBtn: '',
                        type: 'info',
                        mainBtn: '确定',
                        assistFn() {},
                        mainFn() {
                            _self.password = [];
                        }
                    }
                    _self.$store.state.$dialog({
                        dialogObj
                    });
                }
            })
    }
}