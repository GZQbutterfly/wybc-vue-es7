import wx from 'weixin-js-sdk';
import { wxAppid, http } from '../../env/common.env';
import shareStore from '../../env/store/wxstore';

function callBack(res){
    if (res && res.data) {
        shareStore.state.signature = res.data;
        let _res = res.data;
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: wxAppid, // 必填，公众号的唯一标识
            timestamp: _res.timestamp, // 必填，生成签名的时间戳
            nonceStr: _res.noncestr, // 必填，生成签名的随机串
            signature: _res.signature, // 必填，签名，见附录1
            jsApiList: [
                'hideMenuItems',
                'showMenuItems',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'chooseWXPay',
                'chooseImage'
            ]
        });
    }
 }   

export default (http)=>{
    let _http = http();
    return _http('api/wx/g_signature', {url:window.location.href}).then(callBack);
}