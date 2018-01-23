//轻松开店(用户扫描当前页面中的二维码，跳转开店页面信息)
import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';

import { getLocalUserInfo, timeout, isWeiXin } from 'common.env';

import clipboard from 'clipboard-polyfill';

const  QRCode  = require ('../../../../commons/assets/qrcode/qrcode');



import './easy.scss';
@Component({
    template: require('./easy.html'),
})
export class EasyScanner extends BaseVue {
    title = '';
    doctitle = '';
    headimgurl = '';
    username = '';
    wdName = '';
    shareTitle = '';
    shareUrl = '';
    shareDesc = '';
    shareImgurl = '';
    urlParams = {};
    logoimgurl = '';
    svgPathD = 'M0 0 C 187 12, 187 12, 375 0';
    _user;
    mounted() {
        this.urlParams = this.$route.query;
        this.$nextTick(() => {
            this.wdName = this.urlParams.wdName;
            this.setUser();
            this.query2Code();
            timeout(() => {
                let _dom = this.$refs.svgRef;
                if(_dom){
                    let _w = _dom.clientWidth;
                    let _hw = _w / 2;
                    let _h = Math.ceil(_dom.clientHeight / 1.6);
                    this.svgPathD = `M0 0 C ${_hw} ${_h}, ${_hw} ${_h},${_w} 0`;
                }
            }, 50);
        });
    }
    setUser() {
        let _user = getLocalUserInfo();
        this._user = _user;
        this.logoimgurl = _user.headimgurl || '/static/images/pic-login.png';//'/static/images/newshop/logo.png';
        this.headimgurl = _user.headimgurl || '/static/images/pic-login.png';
        this.username = _user.nickname || _user.name || _user.loginName || 'XXX';

    }
    // 获取二维码
    query2Code() {
        //
        if (this.urlParams.type === 'spread') {
            document.title = '开店推广';
            this.title = '加入我们，轻松开店';
            this.shareTitle = '喜大普奔，' + this.username + '邀请您开店！';
            this.shareDesc = '老夫见你骨骼惊奇，是个做生意的好材料。开店自己当老板吧！';
            this.shareImgurl = /http/.test(this.headimgurl) ? this.headimgurl : (location.origin + this.headimgurl);
            this.shareUrl = location.origin + '/apply_shop_campaign?incode=' + this.urlParams.code;
        }

        if (this.urlParams.shop) {
            document.title = '分享店铺';
            this.title = '学惠精选，天天实惠';
            this.shareTitle = ' 我是' + this.username + '，' + this.wdName + '是我的专属微店，欢迎选购！';
            this.shareDesc = '走过路过不要错过！~';
            this.shareImgurl = 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_sp.jpg';
            this.shareUrl = location.origin + '/home?shopId=' + this._user.userId;
        }



        timeout(() => {
            let _codeRefDom = this.$refs.codeRef;
            if(_codeRefDom){
                let width = _codeRefDom.clientHeight;
                let height = _codeRefDom.clientWidth;
                let qrcode = new QRCode(_codeRefDom, {
                    text: this.shareUrl,
                    width: width,
                    height: height,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
        }, 50);

        // 自定义分享功能
        this.serWxShareConfig();
    }

    copyToClipBoard() {
        clipboard.writeText(this.shareUrl);

        let _toast = this.$store.state.$toast;
        _toast({
            title: '复制成功'
        });
    }
    serWxShareConfig() {
        let config = {
            title: this.shareTitle,
            link: this.shareUrl,
            desc: this.shareDesc,
            imgUrl: this.shareImgurl,
        }
        this.updateWxShare(config);
    }
}
