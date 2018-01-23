import { merge, isEmpty } from 'lodash';
import { wxAppid, getUrlParams, getAuthUser, setAuthUser } from 'common.env';

export class WxAuth {
    _$vm;
    _$store;
    _$router;
    _$state;
    _$http;
    _$user;
    constructor(_vm) {
        let _self = this;
        _self._$vm = _vm;
        _self._$store = _vm.$store;
        _self._$router = _vm.$router;
        _self._$state = _self._$store.state;
        _self._$http = _self._$state.$http;
        let _authUser = getAuthUser();
        if (isEmpty(_authUser)) {
            _self.auth();
        } else {
            _self.setWxUser(_authUser);
        }
    }
    auth() {
        let _self = this;
        let urlParam = getUrlParams();
        let _code = urlParam.code;
        if (isEmpty(getAuthUser())) {
            if (!_code || localStorage.__wxCode == _code) {
                let _href = encodeURIComponent(location.href.replace(new RegExp(`code=${_code}`, 'g'),''));// + location.pathname + location.hash;
                let _params = `appid=${wxAppid}&redirect_uri=${_href}&response_type=code&scope=snsapi_userinfo&state=hpt_state#wechat_redirect`;
                location.replace('https://open.weixin.qq.com/connect/oauth2/authorize?' + _params);
            } else {
                localStorage.__wxCode = _code;
                _self.queryWxUser(urlParam.code);
            }
        }
    }
    q(url, data) {
        return this._$http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    queryWxUser(code) {
        let _self = this;
        return _self.q('api/wx/g_wx_user', { code }).then((res) => {
            let _result = res.data;
            if (_result.errorCode) {
                // reauth
                //_self.auth();
            } else {
                _self.setWxUser(_result);
            }
        });
    }
    setWxUser(user) {
        let _self = this;
        _self._$state.workVO.authUser = user;
        setAuthUser(user);
    }
}
