import { getLocalUserInfo, baseURL, formHttp } from 'common.env';

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
    return {
        save(data) {
            let _url = 'api/a_real_name';
            let _user = getLocalUserInfo();
            return formHttp(_url, data);
            //new Promise((res, rej) => {
            // let formData = new FormData();
            // let _files = data.refundImgs;
            // for (let i = 0, len = _files.length; i < len; i++) {
            //     let _file = _files[i];
            //     formData.append(`refundImgs`, _file);
            // }
            // for (let key in data) {
            //     if (key !== 'refundImgs') {
            //         formData.append(key, data[key]);
            //     }
            // }
            // formData.append('userId', _user.id);
            // formData.append('token', _user.token);
            // // submit
            // let xhr = new XMLHttpRequest();
            // xhr.onload = function (event) {
            //     let _currentTarget: any = event.currentTarget;
            //     let _response = _currentTarget.response;
            //     res(JSON.parse(_response));
            // }
            // xhr.open("POST", _url, true);
            // xhr.send(formData);
            //});
        },
        queryRealName(){
            return q('api/q_real_name');
        }
    };

};
