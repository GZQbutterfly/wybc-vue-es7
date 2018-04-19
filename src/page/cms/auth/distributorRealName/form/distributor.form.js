// 实名认证
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { timeout, isAndroid } from 'common.env';
import service from './distributor.form.service';
import './distributor.form.scss';
import { setTimeout } from 'timers';

@Component({
    template: require('./distributor.form.html')
})

export class DistributorRealNameForm extends BaseVue {
    loaded = -1;
    maxSize = 0;    // 表单校验
    formstate = {};
    steps = [
        {
            name: '缴纳押金',
            success: true,
        },
        {
            name: '提交审核',
            success: false
        }
    ];
    userInfo = {
        college: '',
        major: '',
        grade: '',
        studentNo: '',
        deliveryPhone: '',
        schoolAt: '',
        dorm: ''
    };
    upImg = '';
    footerStyle = { position: 'fixed', bottom: 0 };
    resizeFlag = false;
    clickFlag = true;//防止多次点击
    data_max = '';
    _$service;

    mounted() {
        let _self = this;
        _self._$service = service(_self.$store);
        _self.data_max = (new Date())
            .toLocaleDateString()
            .replace(/\/(\d{1})([^\d]*)/g, '-0$1$2')
            .replace(/\/(\d{1})([^\d]*)/g, '-0$1$2');
        _self.$nextTick(() => {
            document.title = '配送员实名认证';
            window.addEventListener('resize', _self.resizeWin);
            //window.addEventListener('resize', _self.lis);
            window.addEventListener('click', _self.lis);
            _self.loadPage();
        });
    }

    async loadPage() {
        let _self = this;
        let _res = (await _self._$service.queryDistributorRealName()).data;
        if (_res.errorCode) {
            //系统错误 包括未实名认证
            let dialogObj = {
                title: '提示',
                content: _res.msg || '服务异常',
                assistBtn: '',
                mainBtn: '知道啦',
                type: 'error',
                assistFn() { },
                mainFn() { }
            };
            _self.$store.state.$dialog({ dialogObj });
        } else if (!_res.pledgeFlag) {
            //未缴纳押金
            _self.$router.push('distributor_deposit');
        }
    }

    lis() {
        if (isAndroid()) {
            let activeElement = document.activeElement;
            if (/input|textarea/i.test(activeElement.tagName)) {
                window.setTimeout(function () {
                    activeElement.scrollIntoViewIfNeeded();
                }, 0);
            }
        }
    }

    resizeWin() {

        let _self = this;
        console.log(_self.resizeFlag);
        let _footerRef = _self.$refs.footerRef;
        let activeElement = document.activeElement;
        if (/input|textarea/i.test(activeElement.tagName)) {
            if (_self.resizeFlag) {
                _self.resizeFlag = false;
                _self.footerStyle = { position: 'fixed', bottom: 0 };
            } else {
                _self.resizeFlag = true;
                _self.footerStyle = { position: 'absolute', bottom: '0', 'z-index': -1 };
            }
        } else {
            _self.resizeFlag = false;
            _self.footerStyle = { position: 'fixed', bottom: 0 };
        }
        this.lis();
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
        freader.onloadstart = function () {
            _self.loaded = 0;
            _self.maxSize = _file.size * 1.0;
        }
        freader.onprogress = function (ev) {
            _self.loaded = ev.loaded;
        }
        freader.onload = function (ev) {
            _self.loaded = -1;
            _self.upImg = ev.target.result;
        }
        _self.userInfo.file = _file;
    }

    removeFile() {
        let _self = this;
        _self.upImg = '';
        let _fileBtn = this.$refs.fileBtn;
        _fileBtn.files.clear();
    }

    async submitInfo() {
        let _self = this;
        _self.clickFlag = false;
        let _userInfo = _self.userInfo;
        let _formstate = _self.formstate;
        if (_formstate.$invalid) {
            _self.clickFlag = true;
            return;
        }
        if (!_userInfo.file) {
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
            let _result = await _self._$service.save(_userInfo);
            if (_result.errorCode) {
                _self.errorResult(_result.msg === 'null' ? '' : _result.msg);
            } else {
                let _res = await _self._$service.queryDistributorRealName();
                _self.successResult(_res.data);
            }
        }
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

    successResult(result) {
        this.$router.push({ path: 'distributor_realname_result', query: { result: result } });
    }

    beforeDestroy() {
        window.removeEventListener('resize', this.resizeWin);
        //window.removeEventListener('resize', this.lis);
        window.removeEventListener('click', this.lis);
    }
}
