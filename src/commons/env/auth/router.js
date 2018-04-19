// 路由权限监控
import { isNotLogin, loginDialog, toLogin, wxAppid, isWeiXin, getUrlParams, qs, closeDialog, cacheLogin, isCMS, timeout } from '../common.env';

import { indexOf, merge } from 'lodash';
import interceptRouters from './router.data';
import { registerPaySign } from '../pay';
import middlewareRouter from './router.middleware';

export class RouterAuth {
    _$vm;
    _$store;
    _$router;
    _$authEnv;
    _$middlewareRouter;
    constructor(_vm, authEnv = (() => { })) {
        this._$vm = _vm;
        this._$store = _vm.$store;
        this._$router = _vm.$router;
        this._$authEnv = authEnv;

        this._$router.beforeEach(this.beforeEach.bind(this));
        this._$router.afterEach(this.afterEach.bind(this));
        this._$middlewareRouter = middlewareRouter.bind(_vm.$router);
        timeout(() => {
            this.setPay();
        }, 500);
    }
    beforeEach(to, from, next) {
        let nextName = from.name;
        let realTo = to.name;
        let realToQuery = to.query;
        // 判断去的路由
        let _index = indexOf(interceptRouters, to.name);
        if (_index > -1 && isNotLogin()) {
            // 路由登录  默认缓存登录
            // if (cacheLogin()) {
            //     next();
            // } else {
            toLogin(this._$router, { toPath: nextName, realTo: realTo, realToQuery: realToQuery });
            // }
        } else {
            this._$middlewareRouter(to, from).then(() => {
                next();
            }).catch(() => {
                next();
            });
        }
        // 监听授权环境
        this._$authEnv();
        if (to.meta && to.meta.title) {
            this._$vm.$nextTick(() => {
                document.title = to.meta.title;
            });
        }
        // 清除弹窗
        closeDialog();
    }

    afterEach(to, from) {
        timeout(() => {
            if (!/login/.test(from.path)) {
                localStorage._prevPath = from.fullPath;
                localStorage._prevPathName = from.path;
                localStorage._prevSearch = qs.stringify(from.query);
            }
            localStorage._activePath = location.href;
            localStorage._activePathname = to.path;
            localStorage._activeSearch = qs.stringify(to.query);
        });
    }
    setPay() {
        let _self = this;
        timeout(() => {
            if (!_self._$store.state.$pay) {
                _self._$store.state.$pay = registerPaySign(_self._$vm);
            }
        });
    }
}
