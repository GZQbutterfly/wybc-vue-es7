export default (_store)=>{
    let _state = _store.state;
    let _http = _state.$http;
    let packagegoodslisturl =  'api/package/q_packageGoods_by_id';
    let packagedataurl =  'api/package/q_package_imgs';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    return {
        getPackageGoodsList(id){
            let data = {
                id : id
            }
            return q(packagegoodslisturl,data);
        },

        getPackageData(id){
            let data = {
                id : id
            }
            return q(packagedataurl,data);
        }
    }
}
