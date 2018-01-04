import { isNotLogin, cacheLogin, toLogin, qs, toWEB } from 'common.env';
import { isEmpty } from 'lodash';

export default (vm, router) => {

    router.beforeEach((to, from, next) => {
        let realTo = to.name;
        let realToQuery = to.query;
        if (beforeCheckLogin()) {
            next();
        } else {
            toLogin(router, { realTo, realToQuery });
        }
    });


    function beforeCheckLogin() {
        let _result = !isNotLogin() || cacheLogin();
        if (!_result) {
            let _params = location.hash.replace('#/', '').split('?');
            toLogin(router, { realTo: _params[0], realToQuery: qs.parse(_params[1]) })
        }
        return _result;
    }

    function checkHasWd(router) {
        let _http = vm.$store.state.$http;
        let _dialog = vm.$store.state.$dialog;
        let dom = document.getElementById('app');
        dom.style.visibility = 'hidden';
        _http({ url: 'api/wd_vip/ifHasWd', method: 'post' }).then((res) => {
            let _result = res.data;
            if (_result.errorCode) {
                _dialog({
                    dialogObj: {
                        title: '提示',
                        type: 'error',
                        content: _result.msg,
                        assistBtn: '',
                        mainBtn: '确定',
                        mainFn() {
                            toWEB('userinfo');
                        }
                    }
                });
            } else if (isEmpty(_result)) {
                _dialog({
                    dialogObj: {
                        title: '提示',
                        type: 'info',
                        content: '亲，您还没有自己的店铺哟！',
                        assistBtn: '',
                        mainBtn: '立即开店',
                        mainFn() {
                            toWEB('apply_shop_campaign');
                        }
                    }
                });
            } else {
                dom.style.visibility = 'visible';
            }
        }).catch(() => {
            _dialog({
                dialogObj: {
                    title: '提示',
                    type: 'error',
                    content: '抱歉！系统服务出错',
                    mainBtn: '请稍后再试',
                    mainFn() {
                        // window.location.reload();
                    }
                }
            });
        });
    }

    //检查是否开店
    beforeCheckLogin() && checkHasWd(router);
}
