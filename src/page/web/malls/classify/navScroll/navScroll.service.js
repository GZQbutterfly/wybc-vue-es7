export default (_store)=>{
    let _state = _store.state;
    let _http = _state.$http;

    let classfyList =  'api/goods/q_classifys_icon';  //分类图标列表
    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    return {
        //分类商品列表
        classfyList() {
            return q(classfyList, {});
        }
    }
}
