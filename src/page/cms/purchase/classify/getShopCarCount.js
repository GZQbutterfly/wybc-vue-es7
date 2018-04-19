export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    let goodesList = 'api/wholecart/q_whole_cart_goodses';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    return {
        getShopcarGoodsesList() {
            let num = 0;
            let validLists = [];
            let user = _state.workVO.user;
            q(goodesList, {
                // userId: user.userId,
                // token: user.token,
                page: 1,
                limit: 10000
            }).then(res => {
                if (res.data.data && res.data.data.length != 0) {
                    res.data.data.forEach(lists => {
                        if (lists.isSourceGoodsValid == 1 && lists.isCampusGoodsValid == 1) {
                            validLists.push(lists);
                            }
                    });
                    validLists.forEach(ele => {
                        num += Number(ele.number);
                    });
                    _state.shopCar.count = num;
                } else {
                    _state.shopCar.count = 0;
                }
            })
        }
    }
}
