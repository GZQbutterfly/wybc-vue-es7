import { find, set, get } from 'lodash';
import { guid } from 'common.env';
//
export default (store) => {
    let _state = store.state;
    let _catch = _state.catch;
    let _http = _state.$http;

    let _guid = guid();

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        queryAllGrade() {
            return q('api/wd_vip/q_all_grade').then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return [];
                } else {
                    return _result;
                }
            });
        },
        /**
         * 获取用户当前的等级信息
         */
        queryCurrentGrade(data) {
            return q('api/wd_vip/myGrade', data).then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return {};
                } else {
                    return _result;
                }
            });
        },
        queryGradeData(data) {
            return q('api/wd_vip/myUpGrade', data).then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return {};
                } else {
                    return _result;
                }
            });
        },
        queryVip(data) {
            return q('api/wd_vip/queryVip', data).then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return {};
                } else {
                    return _result;
                }
            });
        },
        unlock(data) {
            return q('api/wd_vip/wd_unlock', data).then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return {};
                } else {
                    return _result;
                }
            });
        },
        queryUpInfo() {
            return q('api/wd_vip/tryToUp');
        }
    };
};
