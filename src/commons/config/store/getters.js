import {isEmpty} from 'lodash';

export default {
    'GET_WD_INFO': function(state){
        return (shopId)=>{
            if(shopId === null || shopId === undefined){
                return state.cache.currentShop;
            }else{
                let shop = state.cache.shopMap[shopId];
                if(isEmpty(shop) && (state.cache.currentShop.infoId == shopId || shopId == '_tmp_shopid')){
                    return state.cache.currentShop;
                }
                return shop;
            }
        }
    }
};