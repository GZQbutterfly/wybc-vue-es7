import { wxAppid } from '../common.env';
import {get} from 'lodash';
import wx from 'weixin-js-sdk';
import ShareConfig from './share.config';

export function wxshare(config, key) {
    let shareConfig = ShareConfig();

    wx.error(function (res) {
        console.log(res);
    });

    //处理验证成功的信息
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
                link:  get(config, 'link') || window.location.href.split('#')[0], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
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
                link:  get(config, 'link') || window.location.href.split('#')[0], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: get(config, 'imgUrl') || '', // 分享图标
                desc:  get(config, 'desc') || '',
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
                link:  get(config, 'link') || window.location.href.split('#')[0], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
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
            shareConfig.state.shareConfig[key.toLowerCase()] = config;
        }
    });
}
