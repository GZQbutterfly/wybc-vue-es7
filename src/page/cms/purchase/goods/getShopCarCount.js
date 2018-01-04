import { isNotLogin } from 'common.env';

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;



    let goodesList =   'api/cart/q_cart_goodses';

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
            if (!isNotLogin()) {
                let user = _state.workVO.user;
                q(goodesList, {
                    userId: user.id,
                    token: user.token,
                    page: 1,
                    limit: 10
                }).then(res => {
                    res.data.data.forEach(item => {
                        item.check = false;
                        if (item.isValid === 1) {
                            validLists.push(item);
                        }
                    });
                    validLists.forEach(ele => {
                        num += ele.number;
                    });
                    _state.shopCar.count = num;
                })
            }else{
                let shopcartCache = JSON.parse(localStorage.getItem("shopcartCache"));
                if (shopcartCache){

                      shopcartCache.forEach(ele => {
                          num += Number(ele.number);
                      });
                   _state.shopCar.count = num;
                }else{
                    _state.shopCar.count = 0;

                }
            }

        }
    }
}
