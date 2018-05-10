import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './syspay.service';


import passwordInput from '../../../../commons/vue_plugins/components/pay/input.vue';
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
    }
})


export class SysPay extends BaseVue {


    _$service;

    query = {};

    userMoney = 0;

    msg = {
        show: false,
        value: '',
    }

    mounted() {
        this.query = this.$route.query;
        this._$service = service(this.$store)
        let _self = this;
        this.$nextTick(async () => {
            document.title = "支付";
            let _result = (await _self._$service.queryWallet()).data;
            _self.userMoney = _result.money;
        })

    }


    passwordOver(text) {
        this.pay(text);
    }

    pay(password) {
        let _self = this;
        let _param = {
            sign: this.query.sign,
            orderNo: '1_' + this.query.combinOrderNo,
            pwd: stringMD5(this.query.sign + stringMD5(password))
        }

        let loadding = this.$store.state.$loadding();
        this._$service.payOrder(_param).then(res => {
            let _data = res.data;
            if (_data && _data.errorCode == 230) {
                if (_data.keepCount <= 0) { //密码锁定
                    let dialogObj = {
                        title: '钱包被锁定',
                        content: _data.msg? _data.msg:'支付密码错误过多，将锁定' + _data.timeLimit + '小时。建议您找回密码',
                        assistBtn: '取消',
                        type: 'error',
                        mainBtn: '找回密码',
                        assistFn() {
                            _self.toOrderDetail(1);
                        },
                        mainFn() {
                            let _stilquery = {
                                toPay: true,
                                orderSign: _self.query.sign,
                                orderTotalMoney: _self.query.totalMoney,
                                combinOrderNo: _self.query.combinOrderNo
                            }
                            _self.$router.replace({
                                path: 'password',
                                query: _stilquery
                            });
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
                _self.toOrderDetail(0);
            } else if (_data && _data.errorCode) {
                let dialogObj = {
                    title: '提示',
                    content: _data.msg ? _data.msg : '系统错误',
                    assistBtn: '',
                    type: 'info',
                    mainBtn: '确定',
                    assistFn() { },
                    mainFn() {
                        _self.toOrderDetail(1);
                    }
                }
                _self.$store.state.$dialog({
                    dialogObj
                });
            } else {
                let dialogObj = {
                    title: '提示',
                    content: _data.msg ? _data.msg : '系统错误',
                    assistBtn: '',
                    type: 'info',
                    mainBtn: '确定',
                    assistFn() { },
                    mainFn() { }
                }
                _self.$store.state.$dialog({
                    dialogObj
                });
            }
            loadding.close();
        });
    }


    toOrderDetail(listValue = 0) {
        document.activeElement.blur();
        setTimeout(() => {
            this.$router.replace({
                path: 'cms_stock_order',
                query: { listValue }
            });
        }, 100);
    }

}