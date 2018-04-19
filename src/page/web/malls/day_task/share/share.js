import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { closeDialog, isNotLogin, toLogin } from 'common.env';
import service from './share.service';
import './share.scss';

@Component({
    template: require('./share.html')
})

export class DayTaskShare extends BaseVue {
    user = {};
    urlCode = '';
    _$service;
    name = '您的好友';

    mounted() {
        let _self = this;
        document.title = "每日任务";
        _self._$service = service(_self.$store);
        _self.user = _self.$store.state.workVO.user;
        _self.user.headimgurl || (_self.user.headimgurl = '/static/images/pic-login.png');
        if (_self.user.openid) {
            _self.name = _self.user.nickname;
        } else if (_self.user.phone) {
            let reg = /^(\d{3})(\d{4})(\d{4})$/;
            _self.name = _self.user.phone.replace(reg, '$1****$3');
        }
        _self.$nextTick(() => {
            if (isNotLogin()) {
                toLogin(_self.$router, { toPath: 'day_task_share', realTo: 'day_task_share' });
            } else {
                _self.getQrCode();
            }
        });
    }

    /**
     * 直接从服务器获取二维码图片
     * 负载?存和取
     */
    async getQrCode() {
        let _self = this;
        // if (_self.user.openid) {
        //得到本地缓存
        if (localStorage.QrCode) {
            let local_QrCode = JSON.parse(localStorage.QrCode);
            if (local_QrCode.userId == _self.user.userId) {
                _self.urlCode = local_QrCode.url;
            }
        }
        if (!_self.urlCode) {
            let result = await _self._$service.getQrCode();
            if (!result.data.errorCode) {
                _self.urlCode = result.data.url;
                let str = {
                    userId: _self.user.userId,
                    url: _self.urlCode
                }
                localStorage.setItem('QrCode',JSON.stringify(str));
            }
        }
        // } else {
        //     let dialogObj = {
        //         title: '提示',
        //         content: '您的帐号未绑定微信号，不可分享。',
        //         type: 'error',
        //         mainBtn: '确定',
        //         assistFn() {
        //         },
        //         mainFn() {
        //             _self.$router.push('day_task');
        //         }
        //     };
        //     _self.$store.state.$dialog({ dialogObj });
        // }
    }

    close() {
        let _self = this;
        _self.$router.back();
    }
}