import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './password.service';
import {
    isNotLogin,xhrGetStream
} from 'common.env';
import './password.scss';

@Component({
    template: require('./password.html'),
})


export class PayPassWord extends BaseVue {


    _$service;

    imgcode =false;

    code = '';

    btnMsg = '获取验证码';

    //验证码获取按钮禁用状态
    disbtn = false;

    phone = '';

    displayPhone = '';

    timer;

    //验证按钮可用状态
    sbtn = false;

    msg = {
        show:false,
        value:''
    }

    mounted() {
        this._$service = service(this.$store);
        let _userInfo = this.$store.state.workVO.user;
        this.phone = _userInfo.phone;
        this.displayPhone = _userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }

    inputImgCode() {

    }

    inputCode() {
        this.sbtn = (this.code.length === 6);
    }

    queryImgCode() {
        xhrGetStream('api/g_img_auth_code', {
            phone: this.phone
        }).then(({
            currentTarget
        }) => {
            let _response = currentTarget.response;
            this.imgsrc = createObjectURL(_response);
            this.imgcode = true;
        }).catch(() => {
        });
    }

    queryCode(){
        let _self = this;
        this.loopCode();
        this.msg.show = false;
        this.msg.value = '';
        this._$service.getSecurityCode({
            phone: _self.phone
        }).then(res=>{
            let _result = res.data;
            if (_result && _result.errorCode) {
               
            }else{
                if(/true/.test(_result.reqImg)){
                    _self.imgcode = true;
                    _self.btnMsg = '获取验证码';
                    window.clearInterval(_self.timer);
                    _self.disbtn = true;
                    _self.queryImgCode();
                }
            }
        });
    }

    loopCode() {
        let _self = this;
        let count = 59;
        let msg = '重新获取';
        _self.btnMsg = `${msg}(${count}s)`;
        _self.disbtn = true;
        window.clearInterval(_self.timer);
        _self.timer = window.setInterval(() => {
            if (count<=0) {
                _self.btnMsg = '获取验证码';
                window.clearInterval(_self.timer);
                _self.disbtn = false;
            } else {
                _self.btnMsg = `${msg}(${count--}s)`;
            }
        }, 1000);
        
    }

    //验证验证码
    checkCode(){
        let _data = {
            phone:this.phone,
            code:this.code,
        }
        let _self = this;
        this._$service.checkCodeAvible(_data)
        .then(res=>{
            let _result = res.data;
            if (_result && !_result.errorCode) {
                _self.$router.replace({path:'password_set',query:{sign:_result.sign}});
                _self.msg.show = false;
            }else{
                _self.msg.show = true;
                _self.msg.value = _result.msg;
            }
        })
    }
}