//TODO plateform filter
//TODO callback
//TODO message queue

export function bridgeRegister(name, selfDo) {
    let callback = function (bridge) {
        bridge.registerHandler(name, function (data, callback) {
            if (selfDo) {
                selfDo(data);
            }
            //暂时不做其他处理 返回原数据
            callback(data);
        })
    }
    setupWebViewJavascriptBridge(callback);
}

export function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge);
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

export function callNative(name, data, selfDo) {
    let callback = function (bridge) {
        bridge.callHandler(name, data, function (resp) {
            if (selfDo) {
                selfDo(resp);
            }
        })
    }
    setupWebViewJavascriptBridge(callback);
}
