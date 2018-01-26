// 实名认证
import { Component } from 'vue-property-decorator';
import  BaseVue  from 'base.vue';
import { timeout } from 'common.env';
import service from './distributor.form.service';
import './distributor.form.scss';

@Component({
    template: require('./distributor.form.html')
})
export class DistributorRealNameForm extends BaseVue {
    // 表单校验
    formstate = {};

    userInfo = { idCard: '', realName: '', institute: '', major: '', class: '', studentId: '', enrolmentTime: '', hostelAddress:'' };
    upImg = '';
    footerStyle = { position: 'fixed', bottom: 0 };
    resizeFlag = false;
    clickFlag = true;//防止多次点击 

    _$service;
    mounted() {
        this._$service = service(this.$store);
        this.$nextTick(() => {
            document.title = '配送员认证';
            window.addEventListener('resize', this.resizeWin);
        });
    }
    resizeWin() {
        let _self = this;
        let _footerRef = _self.$refs.footerRef;
        let activeElement = document.activeElement;
        if (/input/i.test(activeElement.tagName)) {
            if (_self.resizeFlag) {
                _self.resizeFlag = false;
                _self.footerStyle = { position: 'fixed', bottom: 0 };
            } else {
                _self.resizeFlag = true;
                _self.footerStyle = { position: 'absolute', bottom: 'inherit' };
            }
        } else {
            _self.resizeFlag = false;
            _self.footerStyle = { position: 'fixed', bottom: 0 };
        }
    }
    /**
     * 选择需要上传的文件
     */
    selectFile() {
        let _fileBtn = this.$refs.fileBtn;
        _fileBtn.click();
        timeout(() => {
            this.resizeFlag = false;
            this.footerStyle = { position: 'fixed', bottom: 0 };
        }, 100);
    }
    changeFile(e) {
        let _self = this;
        let _target = e.target;
        let _file = _target.files[0];
        let freader = new FileReader();
        freader.readAsDataURL(_file);
        freader.onload = function (ev) {
            _self.upImg = ev.target.result;
            // console.log('图片上传。。。。')
        }
        _self.userInfo.file = _file;
    }
    removeFile() {
        let _self = this;
        _self.upImg = '';
        let _fileBtn = this.$refs.fileBtn;
        _fileBtn.files.clear();
    }

    submitInfo() {
        // console.log(this.formstate, this.userInfo);
        let _self = this;
        _self.clickFlag = false;
        this._$service.queryRealName().then((res) => {
            if (res.data.state == 4) {
                let dialogObj = {
                    title: '实名提示',
                    content: '您已通过实名认证，不需要在提交认证申请！',
                    mainBtn: '我知道啦',
                    type: 'info',
                    assistFn() { },
                    mainFn() {
                        _self.$router.push('cms_home');
                        _self.clickFlag = true;
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
                return;
            }
            let _userInfo = this.userInfo;
   
            let _formstate = this.formstate;
            if (_formstate.$invalid) {
                _self.clickFlag = true;
                return;
            }
            if (!_userInfo.file) {
                let _self = this;
                let dialogObj = {
                    title: '上传提示',
                    content: '请上传手持身份证照片!',
                    mainBtn: '知道啦',
                    type: 'info',
                    assistFn() { },
                    mainFn() { 
                        _self.clickFlag = true;
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
            } else {
                this._$service.save(this.userInfo).then((_result) => {
                    if (_result.errorCode) {
                        this.errorResult(_result.msg === 'null' ? '' : _result.msg);
                    } else {
                        this.successResult(_result);
                    }
                }).catch(() => {
                    this.errorResult();
                });
            }
        });
    }
    errorResult(msg) {
        let _self = this;
        let dialogObj = {
            title: '提示',
            content: msg || '服务异常',
            assistBtn: '',
            mainBtn: '知道了',
            type: 'error',
            assistFn() { },
            mainFn() {
                _self.clickFlag = true;
             }
        };
        _self.$store.state.$dialog({ dialogObj });
    }
    successResult(res) {
        let result = { 'data': res };
        this.$router.push({ path: 'realname_result', query: { result: result } });
    }
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeWin);
    }
}
