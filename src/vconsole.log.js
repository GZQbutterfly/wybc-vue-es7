if ((process.env.NODE_ENV == 'development') || (location.origin.indexOf('qaservice') != -1)) {
    const VConsole = require('vconsole');
    let option = {
        maxLogNumber: 5000 // 超出上限的日志会被自动清除。
    };
    let vConsole = new VConsole(option);
    //显示 vConsole 主面板
    vConsole.show();
} else {
    let _console = window.console;
    _console.log = () => { };
    _console.debug = () => { };
    _console.warn = () => { };
    _console.error = () => { };
    _console.table = () => { };
}
