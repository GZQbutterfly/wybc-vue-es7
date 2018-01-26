//Server-sent events
import { baseURL, qs } from 'common.env';
import { isFunction } from 'lodash';

let handlerServer = (() => {
    let EventSource = null;
    if ('EventSource' in window) {
        console.log('该浏览器支持  Server-sent events');
        EventSource = function (url) {
            return new window.EventSource(url);
        }
    } else {
        console.log('不支持 Server-sent events 使用stream获取推送信息', );
        EventSource = function (url, data) {
            let _self = this;
            let xhr = new XMLHttpRequest();
            xhr.overrideMimeType('text/plain; charset=utf-8');
            xhr.open('GET', url, true);
            xhr.send();
            xhr.onload = function (event) {
                console.log('链接成功');
            }
            xhr.onerror = function (event) {
                console.log('链接失败');
                _self.onerror(event);
            }
            let _oldVal = '';
            xhr.onreadystatechange = function (event) {
                if (!_self.__open) { return; }
                let _responseText = event.currentTarget.responseText;
                let _newVal = _responseText.replace(_oldVal, '');
                _oldVal = _responseText;
                let _message = _newVal.match(/data.*/g);
                let _value = _message ? _message[0].replace('data:', '').replace(/\s/g, '') : '{}';
                _self.onmessage({ data: _value });
            }
            _self.xhr = xhr;
            _self.__open = true;
        }
        EventSource.prototype = {
            onmessage() { },
            onerror() { },
            close() {
                this.__open = false;
                this.xhr.abort();
            }
        }
    }
    return (url, data, callBack) => {

        if (isFunction(data)) { callBack = data };
        if (!callBack) { callBack = () => { } };
        let source = new EventSource(url + '?' + qs.stringify(data));
        source.onmessage = function (event) {
            let data = null;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                data = event.data;
            }
            callBack({ data: { data } });
        };
        source.onerror = function (event) {
            callBack({ data: { errorCode: 500, msg: '抱歉，服务异常，请稍后重试！' } });
        };
        return source;
    }
})();

export default () => {
    return {
        /**
         * 获取服务端推送消息
         * @param {String}          url       服务地址
         * @param {Object|Function} data      可以等于callBack，无参数
         * @param {Function}        callBack  回调函数
         */
        sent(url = '', data, callBack) {
            url = url.includes('http') ? url : baseURL + url;
            return handlerServer(url, data, callBack);
        }
    };
}