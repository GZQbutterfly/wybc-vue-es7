export default (store) =>{
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
        getMoneyDetail(data){
            return q("api/wallet/q_gold_detail_log",data);
        }
    } 
} 