import {bridgeRegister} from './bridge';

export default (router) => {
    bridgeRegister("pageBack",function(data){
        //data just for test
        // router.back(-1);
    })
};