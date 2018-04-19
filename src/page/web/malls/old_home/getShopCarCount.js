import { isNotLogin } from 'common.env';

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    let goodesList = 'api/shopcart/q_cart_goodses';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    // return {
    //     getShopcarGoodsesList() {} 
    // }
    return {
        getShopcarGoodsesList() {
            let num = 0;
            let validLists = [];
            if (!isNotLogin()) {
                let user = _state.workVO.user;
                q(goodesList, {
                    userId: user.userId,
                    token: user.token,
                    page: 1,
                    limit: 10000
                }).then(res => {
                        if (res.data.data && res.data.data.length != 0) {
                            res.data.data.forEach(lists => {
                                if (lists.commonShopCarts.length) {
                                    lists.commonShopCarts.forEach(item => {
                                        if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
                                            validLists.push(item);
                                        }
                                    });
                                }
                                if (lists.fastShopCarts.length && lists.ksOpen) {
                                    lists.fastShopCarts.forEach(item => {
                                        if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
                                            validLists.push(item);
                                        }
                                    });
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
            } else {
                let shopcartCache = JSON.parse(localStorage.getItem("shopcartCache")||null);
                if (shopcartCache) {
                    shopcartCache.data.forEach(lists => {
                        if (lists.commonShopCarts.length) {
                            lists.commonShopCarts.forEach(item => {
                                if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
                                    validLists.push(item);
                                }
                            });
                        }
                        if (lists.fastShopCarts.length) {
                            lists.fastShopCarts.forEach(item => {
                                if (item.isSourceGoodsValid == 1 && item.isCampusGoodsValid == 1) {
                                    validLists.push(item);
                                }
                            });
                        }
                    });
                    validLists.forEach(ele => {
                        num += Number(ele.number);
                    });
                    _state.shopCar.count = num;
                } else {
                    _state.shopCar.count = 0;
                }
            }

        }
    }
}
