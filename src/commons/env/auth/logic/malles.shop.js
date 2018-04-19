import {clientEnv, http, isNotLogin} from 'common.env';
import {isArray} from 'lodash';

export default async (store, to, from) => {
    let _$http = http();
    // * 1, malles shopid  获取切换店铺信息
    if(clientEnv.web){
        // console.log('middlewareRouter: ', to , from);
        let _query = to.query;
        let _shopId = _query.shopId;
        if(isArray(_shopId)){
            _shopId = _shopId[0];
        }
        if(_shopId !== null && _shopId !== undefined){
            await requestShopInfo(_shopId);
        }
    }

    function getSessionWdVipInfo(){
        return store.dispatch('CHECK_WD_INFO');
    }

    async function requestShopInfo(_shopId){
        let _shopInfo = await getSessionWdVipInfo();
        if(_shopId != _shopInfo.infoId){
            await store.dispatch('CHECK_WD_INFO', _shopId);
            store.dispatch('ADD_HISTORY_SHOP', _shopId);
        }
    }

    function q(url, data){
        return _$http({
            data: data,
            url: url,
            method: 'post'
        });
    }
}