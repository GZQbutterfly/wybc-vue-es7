
import axios from 'axios';
import {qs} from 'common.env';

export default (_store,url) => {

    function q(url, data) {
        return axios({
            data: data,
            url: url,
            method: 'post',
            isNotSer:true
        });
    }
    
    return {
        payOrder(data) {
           return  q('api/pay/order',data);
        }
    };
}
