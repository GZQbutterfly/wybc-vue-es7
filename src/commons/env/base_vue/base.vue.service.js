import { getUrlParams, getLocalUserInfo, isNotLogin } from '../common.env';
import {isArray, merge} from 'lodash';


export default (_store) => {
    let _user = _store.state.workVO.user;
    let _http = _store.state.$http;
    const wdInfo = 'api/wd_vip/queryWdInfo';
    const wdrecodeUser = 'api/a_ten_shop_history';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        shopInfo(data = {}) {
            let promsi = new Promise(function (resolve, reject) {
                let params = getUrlParams();
                let _shopId = params.shopId;
                if(isArray(_shopId)){
                    _shopId = _shopId[0];
                }
                let localWdInfo = _store.getters.GET_WD_INFO();
                if (params.user == 'own' && _user.userId != localWdInfo.infoId) {
                    _store.dispatch('CHECK_WD_INFO', merge({shopId: _user.userId}, data)).then((data)=>{
                        resolve(data);
                    });    
                } else if (_shopId!=null && (localWdInfo.infoId!=_shopId)) {
                    _store.commit('ADD_HISTORY_SHOP', _shopId);
                    _store.dispatch('CHECK_WD_INFO',  merge({shopId: _shopId}, data)).then((data)=>{
                        resolve(data);
                    });                                   
                } else if (localWdInfo.infoId == null) {
                    _store.dispatch('CHECK_WD_INFO', data).then((data)=>{
                        resolve(data);
                    });                                   
                } else {
                    return resolve(localWdInfo);
                }
            });
            return promsi;
        }
    }
}
