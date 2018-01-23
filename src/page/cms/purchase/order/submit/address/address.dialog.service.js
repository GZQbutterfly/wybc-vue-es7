import { merge } from 'lodash';
export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    // ==>
    return {
        // 8.查询所有物流地址
        // url:api/address/q_addresses
        // method:get|post

        // param:
        // userId : 1									//用户Id
        // token：mzCYFnmGYu2s53hARV8zPV1UdAiZ			//登录验证字符串token

        // return:
        // {
        //     "data": [
        //         {
        //             "id": 16,
        //             "userId": 1,
        //             "name": "陈圈圈",
        //             "phone": "16585455232",
        //             "province": "北京市",
        //             "city": "北京市",
        //             "block": "海淀区",
        //             "address": "知春路118号",
        //             "zipCode": "100101",
        //             "createAt": "2017-06-14 09:48",
        //             "updateAt": "2017-06-14 10:23"
        //         } ]
        // }
        queryAddressList() {
            return q('api/address/q_addresses');
        }
    };
}
