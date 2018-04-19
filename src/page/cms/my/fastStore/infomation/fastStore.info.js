import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './fastStore.info.service';

import './fastStore.info.scss';

@Component({
    template: require('./fastStore.info.html'),
})

export class FastStoreInfo extends BaseVue {

    floorList = [];

    formScope = {campusName:'',building:'',dormitory:'', deliverierName:'',shopPhone:'',code:''}

    campusInfo = {};

    currentStep = 0;

    isEdit = false;

    btnMsg = '获取验证码';

    disbtn = true;

    isTostCodeShow = false;

    _$service;

    secondCount = 0;

    infoComplate = true;

    waringText = '';

    //修改手机号
    modifyPhone = '';

    //修改的code
    modifyCode = '';

    steps = [
        {
            name: '快速仓地址',
            success: true,
        },
        {
            name: '店长配送信息',
            success: false
        }
    ];

    mounted() {
        this._$service = service(this.$store);
        let _self = this;
        this.$nextTick(() => {
            document.title = '开启快速仓';
            _self.initPage();
        });
    }

    async initPage(){
        this.campusInfo = await this._$service.checkFastDeliveryState();
        let data = (await this._$service.queryDeliverierInfo());
        this.formScope.campusName = this.campusInfo.campusName;
        if (data && data.deliverierInfo) {
            this.isEdit = true;
            this.formScope.building = data.deliverierInfo.building;
            this.formScope.campusName = data.deliverierInfo.campusName;
            this.formScope.dormitory = data.deliverierInfo.dormitory;
            this.formScope.deliverierName = data.deliverierInfo.deliverierName;
            this.formScope.shopPhone = data.deliverierInfo.shopPhone;
        }
        this.checkInfoComplate();
    }

    nextStep(){
        if (this.currentStep==0) {//下一步
            let _toast = this.$store.state.$toast;
            if (!this.formScope.dormitory||!this.formScope.building) {
                _toast({ title: '信息不完整', success: false });
                return;
            }
            this.currentStep=1;
        }else{//提交信息
            if (!this.infoComplate) {
                let _toast = this.$store.state.$toast;
                _toast({ title: this.waringText, success: false });
            }else{
                let _self = this;
                let dialogObj = {
                    title: '',
                    content: _self.isEdit?'确定提交修改?':'确定提交信息?',
                    type: 'info',
                    assistBtn: '取消',
                    mainBtn: '确认',
                    assistFn() {
                    },
                    mainFn() {
                        _self._$service.submitDeliverierInfo(_self.formScope)
                        .then(res=>{
                            if (!res||!res.data||res.data.errorCode) {
                                let _toast = _self.$store.state.$toast;
                                _toast({ title: res.data.msg, success: false });
                            }else{
                                if (_self.$route.query.from) {
                                    _self.$router.push({ path:_self.$route.query.from})
                                }else if (_self.isEdit) {
                                    window.history.back();
                                }else{
                                    _self.$router.push({ path: 'cms_home'});
                                }
                            }
                        });
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
            }
        }
    }

    queryCode(editModel) {
        let _self = this;
        _self.loopCode();
        _self._$service.getPhoneCode({phone: editModel?this.modifyPhone:this.formScope.shopPhone})
        .then((res)=>{
            if (!res||!res.data||res.data.errCode) {
            }
        });
    }

    loopCode() {
        let _self = this;
        this.secondCount = 59;
        let msg = '重新获取';
        _self.btnMsg = `${msg}(${this.secondCount}s)`;
        _self.disbtn = true;
        _self.timer = window.setInterval(() => {
            if (_self.secondCount<=0) {
                _self.btnMsg = '获取验证码';
                window.clearInterval(_self.timer);
                _self.disbtn = false;
            } else {
                _self.btnMsg = `${msg}(${_self.secondCount--}s)`;
            }
        }, 1000);
    }

    checkInfoComplate(){
        let phone = this.formScope.shopPhone;
        let name = this.formScope.deliverierName;
        let code = this.formScope.code;
        if (name.length<=0) {
            this.infoComplate = false;
            this.waringText = '配送人信息为空,请完善';
        }else if(phone.length!=11){
            this.infoComplate = false;
            this.waringText = '请输入正确格式的手机号码';
        }else if(!this.isEdit&&code.length!=6){
            this.infoComplate = false;
            this.waringText = '请输入正确格式的验证码';
        }else {
            this.infoComplate = true;
        }
    }

    inputPhone() {
        let phone = this.formScope.shopPhone;
        this.checkInfoComplate();
        this.disbtn = (phone.length !== 11)||this.secondCount>0;
    }

    inputModifyPhone(){
        let phone = this.modifyPhone;
        this.disbtn = (phone.length !== 11)||this.secondCount>0;
    }

    inputName(){
       this.checkInfoComplate();
    }

    inputCode() {
        this.checkInfoComplate();
    }
    
    blurPhone() {
        let phone = this.formScope.shopPhone;
        if (phone.length !== 11) {

        }
    }

    changePhone(){
        this.isTostCodeShow = true;
    }

    changePhoneSure(){
        let phone = this.modifyPhone;
        let code = this.modifyCode;
        let _toast = this.$store.state.$toast;
        let _self = this;
        if (!phone||phone.length!=11) {
            _toast({ title: '请输入正确格式的手机号码', success: false });
        }else if(code.length!=6){
            _toast({ title: '请输入正确格式的验证码', success: false });
        }else{
            //校验验证码
            this._$service.checkPhone({
                phone:phone,
                code:code
            })
            .then(res=>{
                if (res&&res.data&&res.data.errorCode) {
                    _toast({ title: res.data.msg, success: false });
                }else if(res&&res.data){
                    _self.formScope.shopPhone = phone;
                    _self.formScope.code = code;
                    _self.isTostCodeShow = false;
                    _self.checkInfoComplate();
                    _toast({ title: '手机号码验证成功', success: true });
                }else{
                    _toast({ title: '服务器异常', success: false });
                }
            })
        }
    }

    closeToast(){
        this.isTostCodeShow = false;
    }

}