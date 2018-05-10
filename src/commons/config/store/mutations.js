import { clientEnv, isNotLogin } from 'common.env';

export default {
    /**
     * 设置sessionStorage  currentShop
     */
    'SET_WD_INFO': function (state, shop) {
        let _shopId = shop.infoId;
        let _shop = state.cache.currentShop;
        if (_shop.infoId != _shopId) {
            if(_shopId != this.state.workVO.user.userId){
                localStorage.wdVipInfo = sessionStorage.wdVipInfo = JSON.stringify(shop);
            }
            state.cache.currentShop = shop;
            this.commit('ADD_HISTORY_SHOP', _shopId);
        }
    },
    /**
     * 写入浏览记录
     */
    'ADD_HISTORY_SHOP': function (state, shopId) {
        if (![null, undefined].includes(shopId) && !isNotLogin()) {
            this.state.$http({
                url: 'api/a_ten_shop_history',
                data: { shopId },
                method: 'post'
            });
        }
    }
}