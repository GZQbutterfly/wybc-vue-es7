
import { clientEnv, http } from '../../env/common.env';
import wxSign from './wx.sign';
import nocache from './nocache';

export default async ()=>{

    // if(clientEnv.ios && clientEnv.weixin){
    //     await wxSign(http);
    // }


    await nocache();
    return true;
}