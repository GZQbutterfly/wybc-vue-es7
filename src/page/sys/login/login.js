import {
    Component, Watch
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import {
    get,
    merge,
    debounce
} from 'lodash';

import {
    cleanLocalUserInfo,
    getLocalUserInfo,
    setLocalUserInfo,
    xhrGetStream,
    createObjectURL
} from 'common.env';

import {
    CacheLogin
} from './cache/login.cache';

import loginService from './login.service';
import './login.scss';
// ==>
@Component({
    template: require('./login.html'),
    components: {
        CacheLogin
    }
})
export class Login extends BaseVue {
    loginCache = false;
    loginScope = {
        phone: '',
        code: '',
        imgcode: '',
    };
    msg = {
        show: false,
        value: ''
    };
    // 获取验证码的btn
    disbtn = true;
    // 输入验证码的文本框
    encode = false;
    imgcode = false;
    reqImg = false;
    imgsrc = '';
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
    cachePhone = '';
    inputPhone() {
        let loginScope = this.loginScope;
        let _flag = (loginScope.phone.length !== 11);
        if(!this.loopFlag){
            // this.disbtn = _flag;
            if (!_flag) {
                this.msg.show = false;
            }else{
                //输入手机号码 ，判断验证码是否开启，校验
                this.encode = false;    
            }
            if(!this.imgsrc){
                this.disbtn = _flag;
            }
            // this.cleanImgCode();
        }
    }

    cleanImgCode(){
        if(this.reqImg && this.loginScope.imgcode.length){
            // this.imgsrc = '';
            this.loginScope.imgcode = '';
            this.queryImgCode();
        }
    }

    blurPhone() {
        let loginScope = this.loginScope;
        if (loginScope.phone.length !== 11) {
            this.msg.value = '请输入正确的手机号';
            this.msg.show = true;
        }
    }


    clickToQueryImgCode(){
        if(this.reqImg){
            this.$store.state.$toast({
                success: null,
                title: '需要图形码校验',
                time: 1500
            });
            this.disbtn = true;
            this.queryImgCode();
        }else{
            if(!this.loopFlag){
                this.queryCode();
            }
        }
    }

    /**
     * 获取图形码
     */
    queryImgCode(){
        this.cachePhone = this.loginScope.phone;
        xhrGetStream('api/g_img_auth_code', {phone: this.loginScope.phone}).then(({currentTarget})=>{
            let _response = currentTarget.response;
            if(!currentTarget || /^(4|5)/.test(currentTarget.status)  || /json/.test(_response.type)){
                this.msg.value = '图形码获取失败！';
                this.msg.show = true;
            }else{
                this.imgsrc = createObjectURL(_response);
                this.imgcode = true;
            }
            console.log(currentTarget);
        }).catch(()=>{
            this.msg.value = '图形码获取失败！';
            this.msg.show = true;
        });
    }


    /**
     * 获取验证码
     */
    queryCode() {
        let _self = this;
        _self.loopCode();
        _self.encode = true;
        _self._$service.getSecurityCode({
            phone: _self.loginScope.phone
        }).then(res=>{
            let _result = res.data;
            if (_result && _result.errorCode) {
                this.msg.value = _result.msg || '服务异常！';
                this.msg.show = true;
                // _self.$store.state.$dialog({
                //     dialogObj: {
                //         title: '提示',
                //         content: res.data.msg || '服务异常！',
                //         type: 'error',
                //         mainBtn: '知道啦',
                //         mainFn() { }
                //     }
                // });
            }else{
                if(/true/.test(_result.reqImg)){
                    _self.reqImg = true;
                    _self.imgcode = true;
                    _self.btnMsg = '获取验证码';
                    window.clearInterval(_self.timer);
                    _self.disbtn = true;
                    _self.loopFlag = false;
                    _self.clickToQueryImgCode();
                }
            }
        });
    }
    /**
     * 验证码重新获取刷新时间
     */
    loopFlag = false;
    loopCode() {
        let _self = this;
        let count = 59;
        let msg = '重新获取';
        _self.btnMsg = `${msg}(${count}s)`;
        _self.disbtn = true;
        window.clearInterval(_self.timer);
        this.loopFlag = true;
        _self.timer = window.setInterval(() => {
            if (!count) {
                _self.btnMsg = '获取验证码';
                window.clearInterval(_self.timer);
                _self.disbtn = false;
                this.loopFlag = false;
            } else {
                _self.btnMsg = `${msg}(${count--}s)`;
            }
        }, 1000);
    }
    /**
     * 监听图形码输入
     */
    inputImgCode(){
        let _self = this;
        let loginScope = _self.loginScope;
        let _flag = (loginScope.imgcode.length === 4);
        if(_flag){
            if (loginScope.phone.length !== 11) {
                this.msg.value = '请输入正确的手机号';
                this.msg.show = true;
                this.cleanImgCode();
                return;
            }
            this.msg.show = false;
            // 校验图形码 可以启动验证码
            this.checkImgCode(this, loginScope.phone, loginScope.imgcode);
        }else{
            _self.encode = false;
        }
    }

    checkImgCode = debounce((_self, phone, imgCode)=>{
        _self._$service.checkImgCode({phone, imgCode}).then((res)=>{
            let _result = res.data;
            if(!_result || _result.errorCode){
                // 
                _self.msg.value =  get(_result, 'msg') || '请输入正确的图形码';
                _self.msg.show = true;
                _self.queryImgCode();
                this.cleanImgCode();
            }else{
                _self.$store.state.$toast({
                    success: null,
                    title: '手机验证码已发送，请注意获取~',
                    width: 270
                    // time: 1500
                });
                _self.imgcode = false;
                _self.encode = true;
                // 倒计时开启
                _self.loopCode();
            }
        });
    }, 500);

    /**
     * 监听验证码 输入
     */
    inputCode() {
        let loginScope = this.loginScope;
        this.sbtn = (loginScope.code.length === 6);
    }
    login() {
        sessionStorage.removeItem('_loginInput');
        let _self = this;
        let loginScope = _self.loginScope;
        _self._$service.doLogion(loginScope).then(async (res) => {
            let _result = res.data;
            if (_result.errorCode) {
                _self.msg.value = _result.msg;
                _self.msg.show = true;
            } else {
                //记录当前店铺信息
                let localWdInfo = await _self.$store.dispatch('CHECK_WD_INFO');
                if (localWdInfo && localWdInfo.infoId != null) {
                    _self._$service.addShopHistory();
                }
                _self.setUser(_result);
                this.$router.replace({
                    path: 'login_back',
                    query: this._query
                });
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
        // cleanLocalUserInfo(); // 不清除本地缓存
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