import {Component} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import {get, merge} from 'lodash';

import {cleanLocalUserInfo, getLocalUserInfo, setLocalUserInfo} from 'common.env';

import {CacheLogin} from './cache/login.cache';

import loginService from './login.service';
import './login.scss';
// ==>
@Component({template: require('./login.html'), components: {
        CacheLogin
    }})
export class Login extends BaseVue {
    loginCache = false;
    loginScope = {
        phone: '',
        code: ''
    };
    msg = {
        show: false,
        value: ''
    };
    // 获取验证码的btn
    disbtn = true;
    // 输入验证码的文本框
    encode = false;
    // 登录按钮
    sbtn = false;
    btnMsg = '获取验证码';
    timer = -1;
    _$service;
    _query;
    data() {
        return {};
    }
    mounted() {
        // 注册服务   
        this._$service = loginService(this.$store);
        // 页面执行
        this.$nextTick(() => {
            let loginInput = sessionStorage._loginInput;
            if (loginInput) {
                loginInput = JSON.parse(loginInput);
                this.loginScope.phone = loginInput.phone;
                if (loginInput.phone) {
                    this.disbtn = false;
                }
                if (loginInput.code) {
                    this.loginScope.code = loginInput.code;
                    this.encode = true;
                    this.sbtn = true;
                }
                sessionStorage.removeItem('_loginInput');
            } else {
                this.checkLogin();
            }
            let _query = sessionStorage._query;
            if (_query) {
                this._query = JSON.parse(_query);
                sessionStorage.removeItem('_query');
            } else {
                this._query = this.$route.query;
            }
        });
    }
    // 判断 是否有缓存信息
    checkLogin() {
        let _self = this;
        let _user = getLocalUserInfo();
        if (_user && _user.userId) {
            // 有缓存
            _self.loginCache = true;
        } else {
            // 无缓存
            _self.toLogin();
        }
    }
    // 监听手机号输入框，11号时启动验证码btn
    inputPhone() {
        let loginScope = this.loginScope;
        this.disbtn = (loginScope.phone.length !== 11);
        if (!this.disbtn) {
            this.msg.show = false;
        }
    }
    blurPhone() {
        let loginScope = this.loginScope;
        if (loginScope.phone.length !== 11) {
            this.msg.value = '请输入正确的手机号';
            this.msg.show = true;
        }
    }
    queryCode() {
        let _self = this;
        _self.loopCode();
        _self.encode = true;
        _self._$service.getSecurityCode({phone: _self.loginScope.phone});
    }
    /**
    * 验证码重新获取刷新时间
    */
    loopCode() {
        let _self = this;
        let count = 59;
        let msg = '重新获取';
        _self.btnMsg = `${msg}(${count}s)`;
        _self.disbtn = true;
        _self.timer = window.setInterval(() => {
            if (!count) {
                _self.btnMsg = '获取验证码';
                window.clearInterval(_self.timer);
                _self.disbtn = false;
            } else {
                _self.btnMsg = `${msg}(${count--}s)`;
            }
        }, 1000);
    }
    inputCode() {
        let loginScope = this.loginScope;
        this.sbtn = (loginScope.code.length === 6);
    }
    login() {
        sessionStorage.removeItem('_loginInput');
        let _self = this;
        let loginScope = _self.loginScope;
        _self._$service.doLogion(loginScope).then((res) => {
            let _reuslt = res.data;
            if (_reuslt.errorCode) {
                _self.msg.value = _reuslt.msg;
                _self.msg.show = true;
            } else {
                _self.setUser(_reuslt);
                this.$router.replace({path: 'login_back', query: this._query});
            }
        });
    }
    setUser(user) {
        setLocalUserInfo(user, false);
        this.$store.state.workVO.user = user;
    }
    /**
    * 切换到登录页面
    */
    toLogin() {
        // to登录界面
        this.loginCache = false;
        cleanLocalUserInfo();
    }
    toProtocol() {
        // console.log('无忧本草 协议', this.loginScope);
        sessionStorage._loginInput = JSON.stringify(this.loginScope);
        sessionStorage._query = JSON.stringify(this._query);
        this.$router.push('wybc_protocol');
    }
    /**
     * 组件销毁
     */
    destroyed() {
        window.clearInterval(this.timer);
    }
}
