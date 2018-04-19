import bridge from './bridge';

export default (router) => {
    bridge.ready();

    function backRoute(router){
        let fullPath = location.href;
        if (fullPath.indexOf("cms_purchase_submit_order")!=-1) {
            return "cms_stock_order";
        } else if(fullPath.indexOf("order_submit")!=-1){
            return "user_order";
        }else {
            return null;
        }
    }

    setTimeout(function () {
        bridge.on("rebackHandler", function(data,callback){
            router.back(-1);
            return "callbackHandler"
        });

        bridge.on("localStorage", function(data){
            return window.localStorage.getItem(data);
        });

        bridge.on("androidPayBack",function(data){
            let state = data.state;
            if (state==1) {//支付成功
                let path = backRoute(router)
                if (path) {
                    router.replace({path: path});
                }else{
                    router.go(0)
                }
            }else if(state==2){//支付失败
                let path = backRoute(router)
                if (path) {
                    router.replace({path: path,query:{listValue:1}});
                }else{
                    router.go(0)
                }
            }else if(state==3){//取消支付
                let path = backRoute(router)
                if (path) {
                    router.replace({path: path,query:{listValue:1}});
                }else{
                    router.go(0)
                }
            }
            return "";
        });

        bridge.on("iOSPayBack",function(data){
            let state = data.state;
            if (state==1) {//支付成功
                let path = backRoute(router)
                if (path) {
                    router.replace({path: path});
                }else{
                    router.go(0)
                }
            }else if(state==2){//支付失败
                let path = backRoute(router)
                if (path) {
                    router.replace({path: path,query:{listValue:1}});
                }else{
                    router.go(0)
                }
            }else if(state==3){//取消支付
                let path = backRoute(router)
                if (path) {
                    router.replace({path: path,query:{listValue:1}});
                }else{
                    router.go(0)
                }
            }
            return "";
        });
    }, 1000);
      
};