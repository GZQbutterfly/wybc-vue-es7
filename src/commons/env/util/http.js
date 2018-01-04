import axios from 'axios';
import {qs} from './env';

let baseURL = 'http://qa.365bencao.cn/malls/';

if (location.origin.indexOf('xhjx.') != -1) {
    baseURL = 'http://xhjxcms.365bencao.com/malls/';
} else if (location.origin.indexOf('qaservice.') != -1) {
    baseURL = 'http://qa.365bencao.cn/malls/';
} else {
    baseURL = 'http://qa.365bencao.cn/malls/';
}

export {
    baseURL
};

export function http() {
    //let _opts = Object.assign({}, options);
    axios.defaults.timeout = 5000;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    axios.defaults.baseURL = baseURL;

    let _result = (options) => {
        //options.data = qs.stringify(options.data);
        return new Promise((relove, reject) => {
            axios(options).then((response) => {
                relove(response);
            }).catch((response) => {
                if(process.env.NODE_ENV === 'development'){
                    debugger;
                }
                let _result =  {
                    errorCode: 500,
                    msg: '抱歉，服务异常，请稍后重试！'
                }
                if(response.code == 'ECONNABORTED'){
              
                }else if(response.message == 'Network Error'){
                    _result.errorCode = 404;
                    _result.msg = '抱歉，服务不存在！';
                }
                relove({
                    data: _result
                });
            });
        });
    };

    _result.axios = axios;

    return _result;
}
