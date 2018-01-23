export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;
    let user = _state.workVO.user;

    let queryalltypeofinformation = 'api/q_api_frequency_all';
    let queryonepageofinformation = 'api/q_api_content_by_frequency';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        /**
         * 查询资讯下的所有分类
         */
        queryAllTypeOfInformation(data){
            return q(queryalltypeofinformation,data);
        },
        
        /**
         * 查询一个资讯分类下的一页数据
         */
        queryOnePageOfInformation(data){
            return q(queryonepageofinformation,data);
        }
    }
};
