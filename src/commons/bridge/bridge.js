//TODO plateform filter
//TODO callback
//TODO message queue

// export function bridgeRegister(name, rebackData) {
//     let callback = function (bridge) {
//         bridge.registerHandler(name, function (data, callback) {
//             console.log('register handler rebackData: ',rebackData(data));
//             callback(rebackData(data));
//         })
//     }
//     setupWebViewJavascriptBridge(callback);
// }

// export function setupWebViewJavascriptBridge(callback) {
//     if (window.WebViewJavascriptBridge) {
//         return callback(WebViewJavascriptBridge);
//     }
//     if (window.WVJBCallbacks) {
//         return window.WVJBCallbacks.push(callback);
//     }
//     window.WVJBCallbacks = [callback];
//     var WVJBIframe = document.createElement('iframe');
//     WVJBIframe.style.display = 'none';
//     WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
//     document.documentElement.appendChild(WVJBIframe);
//     setTimeout(function () {
//         document.documentElement.removeChild(WVJBIframe)
//     }, 0)
// }

// export function callNative(name, data, selfDo) {
//     let callback = function (bridge) {
//         bridge.callHandler(name, data, function (resp) {
//             if (selfDo) {
//                 selfDo(resp);
//             }
//         })
//     }
//     setupWebViewJavascriptBridge(callback);
// }


window.wybcJSBridge = (function () {
    //
    var self = {
        AndroidBridge: null,
        iOSBridge: null,
        initialized: false,

        "api": {},
        "event": {}
    };

    //
    function AndroidEventDispatcher(name, json) {
        if (self.event.hasOwnProperty(name)) {
            var data = json != "" ? json : null;
            var callback = self.event[name];
            setTimeout(function () {
                callback(data);
            }, 1)
        }
    }

    //
    function AndroidSetupWebViewJavascriptBridge(callback) {
        self.AndroidBridge = window["___xhjx_android_js_bridge___"];
        window['___xhjx_android_js_bridge_event___'] = AndroidEventDispatcher;
        self.initialized = true;

        if (callback) {
            callback();
        }
    }

    //
    function iOSSetupWebViewJavascriptBridge(callback) {
        if (window["WebViewJavascriptBridge"]) {
            return callback(window["WebViewJavascriptBridge"]);
        }

        if (window.WVJBCallbacks) {
            return window.WVJBCallbacks.push(callback);
        }

        window.WVJBCallbacks = [callback];

        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
        document.documentElement.appendChild(WVJBIframe);

        setTimeout(function () {
            document.documentElement.removeChild(WVJBIframe)
        }, 0)
    }

    //
    function createHandlerCallback(name) {
        return function (data, responseCallback) {
            if (self.event.hasOwnProperty(name) && self.event[name] != null) {
                var result = self.event[name](data);

                if (result != undefined) {
                    responseCallback(result);
                }
            }
        };
    }

    //
    self.on = function (name, callback) {
        if (self.AndroidBridge) {

        } else {
            if (!self.event.hasOwnProperty(name)) {
                self.iOSBridge["registerHandler"](name, createHandlerCallback(name));
            }
        }
        self.event[name] = callback;
    };

    //
    self.off = function (name) {
        self.event[name] = null;
    };

    //
    self.onBack = function (callback) {
        self.on("rebackHandler", callback);
    };

    //
    self.offBack = function () {
        self.off("rebackHandler");
    };

    //
    self.isReady = function () {
        return self.initialized;
    };

    //
    self.ready = function (callback) {
        if (window["___xhjx_android_js_bridge___"]) {
            AndroidSetupWebViewJavascriptBridge(callback);
        } else {
            iOSSetupWebViewJavascriptBridge(function (bridge) {
                self.iOSBridge = bridge;
                self.initialized = true;
                if (callback) {
                    callback();
                }
            });
        }
    };

    //
    function iOSCallApi(name, params, callback) {
        self.iOSBridge["callHandler"](name, params, function (response) {
            if (callback) {
                callback(response);
            }
        });
    }

    self.api.iOSPay = function (data,callback){
        iOSCallApi("iOSPay", data, callback);
    }

    self.api.AndroidPay = function(data,callback){
        if (self.AndroidBridge) {
            var result = self.AndroidBridge["AndroidPay"](JSON.stringify(data));
            if (callback) {
                callback(result);
            }
        }
    }

    return self;
})();

export default window.wybcJSBridge;
