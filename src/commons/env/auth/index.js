import { RouterAuth } from './router';
import { ServiceAuth } from './service';
import { WxAuth } from './wx';
import { isNotLogin, loginDialog, toLogin, wxAppid, isWeiXin, getUrlParams, qs } from '../common.env';

export default (_vm) => {
    let authEnv = {
        auth: () => { }
    };

    new ServiceAuth(_vm);

    if (isWeiXin()) {
        authEnv = new WxAuth(_vm);
    }
    _vm.$nextTick(() => {
        new RouterAuth(_vm, authEnv.auth);
    });
};
