import { Component, Vue } from 'vue-property-decorator';
import { isWeiXin, setLocalUserInfo, setAuthUser, getAuthUser, toCMS, getLocalUserInfo, timeout } from 'common.env';
import loginService from '../login.service';
@Component({
    template: '<div></div>'
})
export class LoginBack extends Vue {
    _$service;
    mounted() {
        this._$service = loginService(this.$store);

        let result = getLocalUserInfo();
        let _authUser = getAuthUser();
        if (result && !result.openid && !_authUser.userId) {
            this.bindUser(result, _authUser);
        } else if(result && result.openid && result.openid != _authUser.openid && this.$route.query.bind){
            this.dialogWX("当前账号已经绑定其他公众号，领取失败");
        } else {
            this.toPath();
        }
    }
    bindUser(result, _authUser) {
        let _self = this;
        if (isWeiXin()) {
            _self.dialog().then((flag) => {
                if (flag) {
                    _self._$service.setWxBind({
                        userId: result.userId,
                        token: result.token,
                        openid: _authUser.openid
                    }).then((res) => {
                        let _result = res.data;
                        if (!_result.errorCode) {
                            setLocalUserInfo(_result);
                            _self.$store.state.workVO.user = _result;
                            _authUser.userId = result.userId;
                            setAuthUser(_authUser);
                            if (_self.$route.query.bind) {
                                _self.queryBindGold(_authUser.openid);
                            }else{
                                _self.dialogWX();
                            }
                        } else {
                            if (_self.$route.query.bind) {
                                _self.dialogWX('绑定失败，无法领取金币');
                            }else{
                                _self.dialogWX(_result.msg);
                            }
                        }
                    });
                } else {
                    if (_self.$route.query.bind) {
                        _self.dialogWX('当前账号未绑定公众号，领取失败');
                    }else{
                        this.toPath();
                    }
                }
            });
        } else {
            this.toPath();
        }
    }

    queryBindGold(openId){
        let _self = this;
        this._$service.queryGoldbeforeBind({openId:openId})
        .then(res=>{
            if (res && res.data && res.data.wxBindGetGoldText) {
                _self.dialogWX(res.data.wxBindGetGoldText);
            }else{
                _self.dialogWX();
            }
        });
    }

    dialog() {
        let self = this;
        return new Promise((reslove, reject) => {
            let dialogObj = {
                title: '登录提示',
                content: '是否绑定微信帐号',
                assistBtn: '拒绝',
                mainBtn: '同意',
                type: 'info',
                assistFn() {
                    reslove(false);
                },
                mainFn() {
                    reslove(true);
                }
            };
            self.$store.state.$dialog({ dialogObj });
        });
    }
    dialogWX(msg = '微信绑定成功!') {
        let _self =this;
        let dialogObj = {
            title: '提示',
            content: msg,
            mainBtn: '知道啦',
            type: 'info',
            clean: false,
            mainFn() {
                _self.toPath();
            }
        };
        this.$store.state.$dialog({ dialogObj });
    }
    toPath() {
        let _query = this.$route.query;
        //  realTo: realTo, realToQuery: realToQuery
        if (_query.type === 'cms') {
            if (_query.realTo) {
                toCMS(_query.realTo, _query.realToQuery);
            } else {
                toCMS(_query.toPath || '');
            }
        } else {
            if (_query.realTo) {
                this.$router.replace({ path: _query.realTo, query: _query.realToQuery });
            } else {
                this.$router.replace(_query.toPath || '/');
            }
        }
    }
}
