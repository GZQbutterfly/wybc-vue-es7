import { getUrlParams, getLocalUserInfo ,getAuthUser} from '../common.env';



export default (_store) => {
    let _http = _store.state.$http;
    const wdInfo = 'api/wd_vip/queryWdInfo';
    const wdrecode = 'api/a_shopId_by_openId';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        shopInfo() {
            let promsi = new Promise(function (resolve, reject) {
                // if (location.href.indexOf('cms') == -1) {//非管理端
                let params = getUrlParams();
                let localWdInfo = localStorage.wdVipInfo ? JSON.parse(localStorage.wdVipInfo) : {};
                if (params.user == 'own') {
                    q(wdInfo, { shopId: getLocalUserInfo().userId })
                        .then(res => {
                            let _result = res.data;
                            if (_result && !_result.errorCode) {
                                localStorage.wdVipInfo = JSON.stringify(_result.wdVipInfo);
                                resolve(_result.wdVipInfo);
                            }
                        });
                } else if (params.shopId && localWdInfo && params.shopId != localWdInfo.infoId) {
                    q(wdInfo, { shopId: params.shopId })
                        .then(res => {
                            let _result = res.data;
                            if (_result && !_result.errorCode) {
                                localStorage.wdVipInfo = JSON.stringify(_result.wdVipInfo);
                                //记录当前浏览店铺
                                q(wdrecode, {
                                    shopId: params.shopId,
                                    openId: getAuthUser().openid
                                })
                            }
                            resolve(_result.wdVipInfo);
                        });
                } else if (!localWdInfo.infoId) {
                    q(wdInfo, null)
                        .then(res => {
                            let _result = res.data;
                            if (_result && !_result.errorCode) {
                                localStorage.wdVipInfo = JSON.stringify(_result.wdVipInfo);
                            }
                            resolve(_result.wdVipInfo);
                        });
                } else {
                    return resolve(localWdInfo);
                }
            }
            )
            return promsi;
        }
    }
}
