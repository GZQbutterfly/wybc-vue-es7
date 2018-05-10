export default {

    /**
      * 添加关注店铺
      * @param {Object} state store  state 
      * @param {Object} params 店铺信息 需外部传入  {shopId}
      */
    'ADD_FOLLOW_SHOP': async function ({ state }, params = '') {
        let _toast = state.$toast;
        let _shopId = params.shopId || (await this.dispatch('CHECK_WD_INFO')).infoId;
        let _$http = state.$http;
        let _result = (await _$http({
            data: { shopId: _shopId},
            url: 'api/wd_vip/user_attention_wd',
            method: 'post'})).data;
        if (_result.errorCode){
             _toast({
                 title: _result.msg|| '关注店铺失败',
                 success: false
             });  
             return false;
         }else{
             _toast({
                 title: '关注成功',
                 success: true
             });
             return true;
         }

       
    },
     /**
      * 取消关注店铺
      * @param {Object} state store  state 
      * @param {Object} params 店铺信息 需外部传入 {shopId}
      */
    'CANCEL_FOLLOW_SHOP': async function ({ state }, params = '') {
        let _toast = state.$toast;
        let _shopId = params.shopId || (await this.dispatch('CHECK_WD_INFO')).infoId;
        let _$http = state.$http;
        let _result = (await _$http({
            data: { shopId: _shopId },
            url: 'api/wd_vip/user_give_up_attention',
            method: 'post'
        })).data;
        if (_result.errorCode) {
            _toast({
                title: _result.msg || '取消关注店铺失败',
                success: false
            });
            return true;
        } else {
            _toast({
                title: '取消关注成功',
                success: true
            });
            return false;
        }
    }
};