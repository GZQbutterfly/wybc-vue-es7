export default {
    /**
      * 添加关注店铺
      * @param {Object} state store  state 
      * @param {Object} params 店铺信息 需外部传入 shopId or  {shopId}
      */
    'ADD_FOLLOW_SHOP': async function (state, params = '') {
        let _toast = state.$toast;
        let _shopId = params || params.shopId || (await this.dispatch('CHECK_WD_INFO')).infoId;


        console.log(_shopId);

        _toast({
            title: '关注成功',
            success: true
        });
    }
};