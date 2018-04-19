var http = require("http");
http.createServer(function (req, res) {
    var url = req.url;
    if (/stream/.test(url)) {
        console.log('推送链接启动  ', url);
        var _open = true;

        res.writeHead(200, {
            "Content-Type": "text/event-stream;charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": '*',
        });
        res.write("retry: 10000\n");
        res.write("event: connect time: " + (new Date()) + "\n");

        var json = {
            name: '大鼻子猪',
            age: 23,
            count: 0
        };

        var timer = 0;

        var send = () => {
            time = setTimeout(() => {
                if (_open) {
                    json.count++;
                    console.log('推送到前端  ', url);
                    res.write("data: " + (JSON.stringify(json)) + "\n\n");
                    send();
                }
            }, Math.floor(Math.random() * 10 + 3000));
        }

        send();

        req.connection.addListener("close", function () {
            console.log('前端已关闭链接 ', url);
            clearTimeout(timer);
            _open = false;
        }, false);
    }
}).listen(8844, "127.0.0.1");
console.log('启动成功，请访问 http://localhost:8844/stream')