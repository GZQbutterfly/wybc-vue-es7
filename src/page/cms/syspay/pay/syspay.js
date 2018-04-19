import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './syspay.service';


import passwordInput from '../../../../commons/vue_plugins/components/pay/input.vue';
import keyboard from '../../../../commons/vue_plugins/components/pay/keyboard.vue';
import {
    stringMD5,
    get,
    toCMS,
    qs
} from 'common.env';

import './syspay.scss';


@Component({
    template: require('./syspay.html'),
    components: {
        psinput: passwordInput,
        keyboard: keyboard
    }
})


export class SysPay extends BaseVue {


    _$service;

    query = {};

    password = [];

    msg = {
        show: false,
        value: '',
    }

    mounted() {
        this.query = this.$route.query;
        this._$service = service(this.$store)

    }

    keyUpHandle(text) {
        this.password.push(text);
        if (this.password.length >= 6) {
            //TODO 支付
            this.pay(this.password.join(''));
            this.password = [];
        }
    }

    pay(password) {
        let _self = this;
        let _param = {
            sign: this.query.sign,
            orderNo: '1_' + this.query.combinOrderNo,
            pwd: stringMD5(this.query.sign + stringMD5(password))
        }

        this._$service.payOrder(_param).then(res => {
            let _data = res.data;
            if (_data && _data.errorCode == 230) {
                if (_data.keepCount <= 0) { //密码锁定
                    let dialogObj = {
                        title: '钱包被锁定',
                        content: '支付密码错误过多，将锁定' + _data.timeLimit + '小时。建议您找回密码',
                        assistBtn: '取消',
                        type: 'error',
                        mainBtn: '找回密码',
                        assistFn() {
                            _self.$router.replace({path:'cms_stock_order', query:{listValue: 1}});
                        },
                        mainFn() {
                            _self.$router.replace('password');
                        }
                    }
                    _self.$store.state.$dialog({
                        dialogObj
                    });
                } else {
                    _self.msg.show = true;
                    _self.msg.value = _data.msg;
                }

            } else if (_data && !_data.errorCode) {
                if (_self.query.toPath) {
                    location.href = `${location.origin}/${_self.query.toPath}`
                } else {
                    _self.$router.replace({path:'cms_stock_order', query:{listValue: 2}});
                }
            } else {
                let dialogObj = {
                    title: '提示',
                    content: _data.msg?_data.msg:'系统错误',
                    assistBtn: '',
                    type: 'info',
                    mainBtn: '确定',
                    assistFn() {
                    },
                    mainFn() {
                    }
                }
                _self.$store.state.$dialog({
                    dialogObj
                });
            }
        });
    }

    delHandle(text) {
        this.password.pop();
    }

}