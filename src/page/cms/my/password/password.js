import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './password.service';
import {
    isNotLogin,xhrGetStream, createObjectURL
} from 'common.env';
import {
    debounce,get
} from 'lodash';
import './password.scss';

@Component({
    template: require('./password.html'),
})


export class PayPassWord extends BaseVue {


    _$service;


    code = '';

    btnMsg = '获取验证码';

    //验证码获取按钮禁用状态
    disbtn = false;

    phone = '';

    displayPhone = '';

    timer;

    imgsrc = '';

    imgCodeShow = false;

    imgCode = '';

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
        this.$nextTick(()=>{
            document.title = "支付设置";
        })
    }

    inputImgCode() {
        if(this.imgCode.length === 4){
            this.checkImgCode(this, this.phone, this.imgCode);
        }
    }

    checkImgCode = debounce((_self, phone, imgCode)=>{
        _self._$service.checkImgCode({phone, imgCode}).then((res)=>{
            let _result = res.data;
            if(!_result || _result.errorCode){
                // 
                _self.msg.value =  get(_result, 'msg') || '请输入正确的图形码';
                _self.msg.show = true;
                _self.cleanImgCode();
                _self.queryImgCode();
            }else{
                _self.$store.state.$toast({
                    success: null,
                    title: '手机验证码已发送，请注意获取~',
                    width: 270
                    // time: 1500
                });
                _self.imgCodeShow = false;
                // 倒计时开启
                _self.loopCode();
            }
        });
    }, 500);

    cleanImgCode(){
        if(this.imgCodeShow && this.imgCode.length){
            this.imgCode = '';
        }
    }

    inputCode() {
        this.sbtn = (this.code.length === 6);
    }


    /**
     * 获取图形码
     */
    queryImgCode(){
        xhrGetStream('api/g_img_auth_code', {phone: this.phone}).then(({currentTarget})=>{
            let _response = currentTarget.response;
            if(!currentTarget || /^(4|5)/.test(currentTarget.status)  || /json/.test(_response.type)){
                this.msg.value = '图形码获取失败！';
                this.msg.show = true;
            }else{
                this.imgsrc = createObjectURL(_response);
                this.imgCodeShow = true;
            }
        }).catch(()=>{
            this.msg.value = '图形码获取失败！';
            this.msg.show = true;
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
                _self.msg.show = false;
                _self.msg.value = _result.msg;
            }else{
                if(/true/.test(_result.reqImg)){
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
                let _query = _self.$route.query;
                _query.sign = _result.sign;
                _self.$router.replace({path:'password_set',query:_query});
                _self.msg.show = false;
            }else{
                _self.msg.show = true;
                _self.msg.value = _result.msg;
            }
        })
    }
}