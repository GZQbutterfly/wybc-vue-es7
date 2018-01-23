import {match} from 'common.env';

export default (store) => {

    let _state = store.state;
    let _http = _state.$http;
    let _cache = _state.cache;
    let _key = 'web.lead';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        async queryHistory() {
            let _list = null;
            let _result = (await q('api/q_ten_shop_history')).data;
            if (_result.errorCode) {
                if(match(_result.errorCode, [96, 94, 119])){
                    _list = [{}];
                }else{
                    _list = [];
                }
            } else {
                _list = _result.data;
            }
            return _list;
        },
        async queryRecommendShop() {
            let _list = _cache[_key + 'recommend_shop'];
            if (!_list || !_list.length) {
                let _result = (await q('api/q_front_recommend_shop')).data;
                if (_result.errorCode) {
                    _list = [];
                } else {
                    _cache[_key + 'recommend_shop'] = _result.data;
                    _list = _result.data;
                }
            }
            return _list;
        }
    }
}