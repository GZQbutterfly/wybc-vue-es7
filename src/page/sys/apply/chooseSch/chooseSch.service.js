export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //查询用户是否已经开店
    let queryuserhasshop = 'api/wd_vip/ifHasWd';
    //取得所有*学校名称
    let queryallschool = 'api/wd_vip/querySchool';

    function q(url, data){
        return  _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return{

        /**
         * 查询用户是否已经开店
         */
        queryUserHasShop() {
            return q(queryuserhasshop, {});
        },


        /**
         * 取得所有*学校名称
         */
        queryAllSchool() {
            return q(queryallschool, {});
        }

    }

}
