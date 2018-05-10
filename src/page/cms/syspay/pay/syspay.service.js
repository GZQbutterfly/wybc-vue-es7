
import axios from 'axios';
import {qs} from 'common.env';

export default (_store) => {

    function q(url, data) {
        return axios({
            data: data,
            url: url,
            method: 'post',
            isNotSer:true
        });
    }

    let _state = _store.state;
    let _http = _state.$http;
    function http_q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    
    return {
        payOrder(data) {
           return  q('api/pay/order',data);
        },
        queryWallet(data) {
            return  http_q('api/q_api_wallet_by_userId',data);
        },
    };
}
