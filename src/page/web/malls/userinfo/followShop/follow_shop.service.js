
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
        queryMyAttentionWdLists(data){
            return q("api/wd_vip/q_my_attention_wd",data);
        }
    }
}    