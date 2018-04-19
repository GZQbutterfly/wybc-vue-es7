export default (store) => {
    let _state = store.state;
    let _http = _state.$http;

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        getQrCode(data) {
            return q('api/wx/get_share_qrCode', data);
        }

    }
};