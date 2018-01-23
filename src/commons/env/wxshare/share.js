import {
    wxAppid
} from '../common.env';
import {
    get
} from 'lodash';
import wx from 'weixin-js-sdk';

export function wxshare(config, key, http) {
    let cc = {
        data: {
            url: window.location.href
        },
        url: 'api/wx/g_signature',
        method: 'post'
    }

    if (!http) {
        wx.ready(function () {
            wx.hideAllNonBaseMenuItem();
        });

    } else {
        http(cc).then((res) => {
            if (res['errorCode']) {
                rs(res);
                return;
            }
            let _data = res.data;
            // 支付签名
            wx.config({
                debug: _data.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: wxAppid, // 必填，公众号的唯一标识
                timestamp: _data.timestamp, // 必填，生成签名的时间戳
                nonceStr: _data.noncestr, // 必填，生成签名的随机串
                signature: _data.signature, // 必填，签名，见附录1
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

            wx.ready(function () {
                if (config && config.hideAllItem === true) {
                    wx.hideAllNonBaseMenuItem();
                    return;
                } else {
                    //iOS 必须这样做
                    wx.hideAllNonBaseMenuItem();
                    wx.showMenuItems({
                        menuList: [
                            'menuItem:share:appMessage',
                            'menuItem:share:timeline',
                            'menuItem:share:qq',
                            'menuItem:copyUrl',
                        ]
                    });

                    //分享到朋友圈
                    wx.onMenuShareTimeline({
                        title: get(config, 'title') || document.title, // 分享标题
                        link: get(config, 'link') || window.location.href.split('#')[0], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        imgUrl: get(config, 'imgUrl') || '', // 分享图标
                        success: function (res) {
                            // 用户确认分享后执行的回调函数
                            if (config && config.successDone) {
                                config.successDone(res);
                            }
                        },
                        cancel: function (res) {
                            // 用户取消分享后执行的回调函数
                            if (config && config.cancelDone) {
                                config.cancelDone(res);
                            }
                        }
                    });


                    //分享给朋友
                    wx.onMenuShareAppMessage({
                        title: get(config, 'title') || document.title, // 分享标题
                        link: get(config, 'link') || window.location.href.split('#')[0], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        imgUrl: get(config, 'imgUrl') || '', // 分享图标
                        desc: get(config, 'desc') || '',
                        success: function (res) {
                            // 用户确认分享后执行的回调函数
                            if (config && config.successDone) {
                                config.successDone(res);
                            }
                        },
                        cancel: function (res) {
                            // 用户取消分享后执行的回调函数
                            if (config && config.cancelDone) {
                                config.cancelDone(res);
                            }
                        }
                    });

                    wx.onMenuShareQQ({
                        title: get(config, 'title') || document.title, // 分享标题
                        link: get(config, 'link') || window.location.href.split('#')[0], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        imgUrl: get(config, 'imgUrl') || '', // 分享图标
                        desc: get(config, 'desc') || '',
                        success: function (res) {
                            // 用户确认分享后执行的回调函数
                            if (config && config.successDone) {
                                config.successDone(res);
                            }
                        },
                        cancel: function (res) {
                            // 用户取消分享后执行的回调函数
                            if (config && config.cancelDone) {
                                config.cancelDone(res);
                            }
                        }
                    })
                }
            });

        });

    }

    wx.error(function (res) {
        console.log(res);
    });

    //处理验证成功的信息

}