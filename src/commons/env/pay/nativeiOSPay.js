import Vue from 'vue';
import {bridge, callNative} from '../../bridge/bridge';

/**
 * iOS 原生pay
 */
export class NativeiOSPay   {

    sign(){

    }
    
    /**
     * @param data  对象数据
     * @return  {boolean}  true 代表已支付， false 代表未支付
     */
    pay(url, data) {
        data.url = url;
        callNative("iOSPay",data,function(rebackData){
            //网页回调返回  非支付返回
            console.log('返回数据: ',rebackData);
        });
    }
}
