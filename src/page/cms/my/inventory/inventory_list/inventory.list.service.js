

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    let goodslisturl = 'api/q_keyword';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        /**
         * 获取搜索结果
         * @param keyword 关键词
         * @param page 页码
         * @param limit 单页数据数
         */
        getGoods(keyword, page, limit) {
            let data = {
                keyword: keyword,
                page: page,
                limit: limit
            }
            return q(goodslisturl, data)
        },
        // api/q_api_goods_stock
        queryStockList(keyword, page, limit) {
            let data = {
                keyword: keyword,
                page: page,
                limit: limit,
                shopId: _state.workVO.user.userId
            }
            return q('api/q_api_goods_stock', data);
        }
    }

}
