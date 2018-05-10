// 开店宣传信息
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isEmpty } from 'lodash';
import { getLocalUserInfo, isNotLogin, toLogin, toCMS } from 'common.env';


import invitecodeService from './invitecode.service';
import './invitecode.scss';
@Component({
    template: require('./invitecode.html')
})
export class ApplyShopInvitecode extends BaseVue {
    incode = '';
    tipImg = '/static/images/minishop/shenqingkaidian.png';
    _$popup;
    _$dialog;
    _$service;
    school = '';
    campusId = 0;
    showContent = false;
    mounted() {
        let _self = this;
        this._$popup = _self.$store.state.$popup;
        this._$dialog = _self.$store.state.$dialog;
        //注册服务
        this._$service = invitecodeService(this.$store);
        //session
        let incodeInfo = sessionStorage.getItem("incodeInfo");
        if (incodeInfo) {
            this.incode = incodeInfo;
            sessionStorage.removeItem("incodeInfo");
        }
        //TODO
        _self.school = _self.$route.query.school;
        _self.campusId = _self.$route.query.campusId;
        this.$nextTick(() => {
            document.title = "申请开店";
            _self.checking();
        });
    }
    /**
     * 判断登陆 && 判断是否开店 && 判断邀请码
     */
    checking() {
        let _self = this;
        let _incode = _self.$route.query.incode;
        if (!_self.school) {
            //学校名  到开店首页
            _self.errorNoSchool();
            return;
        }
        if (isNotLogin()) {
            //to login
            let _url = _incode ? ('?incode=' + _incode) : '';
            toLogin(_self.$router, { toPath: 'apply_shop_invitecode', realTo: 'apply_shop_invitecode' + _url });
        } else {
            //check hasWd
            _self.queryUserHasShop(() => {
                _self._$service.queryParentCode(null)
                .then(res=>{
                    let _result = res.data;
                    if (_result && !_result.errorCode) {
                        if (_result.ifHasInvited) {
                            _self.incode = _result.invitationCode;
                            _self._$service.queryInvitationCode(_self.incode).then((res) => {
                                //检查邀请码是否正确
                                if (res.data.errorCode) {
                                    _self.errorCodePopup();
                                } else {
                                    res.data.upPhoneNum = res.data.upPhoneNum.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
                                    _self.dialogPopup(res.data,false);
                                }
                            });
                        }else{
                            if (_incode) {
                                _self.incode = _incode;
                            }
                            _self.showContent = true;
                        }
                    }
                })
            })
        }
    }
    /**
     * 查询用户是否开店
     */
    queryUserHasShop(cb) {
        let _self = this;
        this._$service.queryUserHasShop().then((res) => {
            console.log('用户开店信息', res);
            if (res.data.errorCode) {
                _self._$dialog({
                    dialogObj: {
                        title: '提示',
                        type: 'error',
                        content: res.data.msg,
                        mainBtn: '确定',
                        mainFn() {
                            this.$router.push('userinfo');
                        }
                    }
                });
            } else if (!isEmpty(res.data)) {
                _self._$dialog({
                    dialogObj: {
                        title: '开店提示',
                        type: 'info',
                        content: '您的账户已有店铺，不能继续开店！',
                        mainBtn: '管理我的店铺',
                        mainFn() {
                            toCMS('cms_home');
                        }
                    }
                });
            } else {
                cb && cb();
            }
        });
    }
    /**
     * to 开店/检测
     * @param flag hasIncode
     */
    toCreateShop(flag) {
        let _self = this;
        if (flag) {
            if (!_self.incode) {
                return;
            }
            if (!this.checkCode()) {
                return;
            }
            //有邀请码
            this._$service.queryInvitationCode(_self.incode).then((res) => {
                console.log('邀请码信息', res)
                //检查邀请码是否正确
                if (res.data.errorCode) {
                    this.errorCodePopup();
                } else {
                    res.data.upPhoneNum = res.data.upPhoneNum.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
                    this.dialogPopup(res.data);
                }
            });
        } else {
            //无邀请码
            this.tipPopup();
        }
    }

    /**
     * 检查邀请码格式
     */
    checkCode() {
        let code = this.incode;
        let reg = /^[a-zA-Z0-9]{6}$/;
        let _self = this;
        if (reg.test(code)) {
            return true;
        } else {
            _self._$dialog({
                dialogObj: {
                    title: '提示',
                    type: 'error',
                    content: '邀请码格式错误！',
                    assistBtn: '',
                    mainBtn: '我知道啦',
                    mainFn() {
                        _self.incode = '';
                    }
                }
            });
            return false;
        }
    }

    /**
     * 未填写学校名称
     */
    errorNoSchool() {
        let _self = this;
        _self._$dialog({
            dialogObj: {
                title: '提示',
                type: 'error',
                content: '系统错误',
                mainBtn: '确定',
                assistFn() {
                },
                mainFn() {
                    _self.$router.push('apply_shop_campaign');
                }
            }
        });
    }

    /**
     * 邀请码不存在
     */
    errorCodePopup() {
        let _self = this;
        _self._$dialog({
            dialogObj: {
                title: '提示',
                content: '您输入的邀请码并不存在，请重新输入！',
                assistBtn: '',
                mainBtn: '重新输入',
                type: 'error',
                mainFn() {
                    _self.incode = '';
                }
            }
        });
    }

    /**
     * 确认推荐人信息
     */
    dialogPopup(data,cancelAble=true) {
        let _self = this;
        _self._$popup({
            title: '确定推荐人信息',
            close: true,
            height: 0.37,
            width: '268px',
            content: `<div class="invitecode-dialog">
                            <div class="weui-flex">
                                <label class="weui-flex__item">用户头像:</label>
                                <div class="weui-flex__item"><img src="${data.headimgurl ? data.headimgurl : './static/images/pic-login.png'}"></div>
                            </div>
                            <div class="weui-flex">
                                <div class="weui-flex__item">用户昵称:</div>
                                <div class="weui-flex__item">${data.upUserName}</div>
                            </div>
                            <div class="weui-flex" >
                                <div class="weui-flex__item">手机号码:</div>
                                <div class="weui-flex__item">${data.upPhoneNum}</div>
                            </div>
                        </div>
                       `,
            assistBtn: cancelAble?'重新输入':'',
            mainBtn: '确定',
            assistFn() {
                _self.incode = '';
            },
            mainFn() {
                let query = {
                    incode: _self.incode,
                    school: _self.school,
                    campusId: _self.campusId
                }
                _self.$router.push({ path: 'apply_shop', query: query });
            }
        });
    }

    /**
     * 没有邀请码,随机取一个有效邀请码
     */
    tipPopup() {
        let _self = this;
        let query = {
            school: _self.school,
            campusId: _self.campusId
        }
        this._$service.queryRandomCode(query).then((res) => {
            let data = res.data;
            if (res.data.errorCode) {
                let _self = this;
                _self._$dialog({
                    dialogObj: {
                        title: '提示',
                        type: 'error',
                        content: '系统分配推荐人失败,请稍后再试！',
                        assistBtn: '',
                        mainBtn: '确定',
                        mainFn() {
                        }
                    }
                });
            }else{
                _self._$popup({
                    title: '确定推荐人信息',
                    close: true,
                    height: 0.37,
                    width: '268px',
                    content: `<div class="invitecode-dialog">
                            <div class="weui-flex">
                                <label class="weui-flex__item">用户头像:</label>
                                <div class="weui-flex__item"><img src="${data.headimgurl ? data.headimgurl : './static/images/pic-login.png'}"></div>
                            </div>
                            <div class="weui-flex">
                                <div class="weui-flex__item">用户昵称:</div>
                                <div class="weui-flex__item">${data.upUserName}</div>
                            </div>
                            <div class="weui-flex" >
                                <div class="weui-flex__item">手机号码:</div>
                                <div class="weui-flex__item">${data.upPhoneNum}</div>
                            </div>
                        </div>
                       `,
                    assistBtn: '',
                    mainBtn: '确定',
                    assistFn() {
                       
                    },
                    mainFn() {
                        let query = {
                            incode: data.invitationCode,
                            school: _self.school,
                            campusId: _self.campusId
                        }
                        _self.$router.push({ path: 'apply_shop', query: query });
                    }
                }); 
            } 
            // else {
            //     _self._$dialog({
            //         dialogObj: {
            //             title: '邀请人信息',
            //             type: 'info',
            //             content: '系统已默认分配' + res.data.upUserName + '用户成为您的供货人',
            //             assistBtn: '我再想想',
            //             mainBtn: '填写开店信息',
            //             assistFn() {
            //             },
            //             mainFn() {
            //                 let query = { 
            //                     incode: res.data.invitationCode, 
            //                     auto: 1,
            //                     school: _self.school,
            //                     campusId: _self.campusId
            //                 };
            //                 _self.$router.push({ path: 'apply_shop', query: query });
            //             }
            //         }
            //     });
            // }
        });
    }

    toWiki() {
        sessionStorage.setItem("incodeInfo", this.incode);
        let query = {
            type: 'incode'
        }
        this.$router.push({ path: 'apply_shop_wiki', query: query });
    }
}
