

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
        queryHomeBannerList(shopId) {
            return q('api/q_store_ads', {
                posId: 1,
                channel: 'wd',
                shopId
            })
        },
        queryGoodsList(data) {
            return q('api/goods/q_gold_goodses', data);
        }
    }
};
