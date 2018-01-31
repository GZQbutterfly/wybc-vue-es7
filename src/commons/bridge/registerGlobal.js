import {bridgeRegister} from './bridge';

export default (router) => {

    bridgeRegister("pageBack",function(data){
        //data just for test
        alert('原生调用返回');
        router.back(-1);
    }),
    bridgeRegister("localStorage",(data)=>{
        console.log("iosCall localStorage data: ",data,window.localStorage.getItem(data))
        return window.localStorage.getItem(data);
    })
};