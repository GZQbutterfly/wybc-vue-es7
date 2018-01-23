import {Component} from 'vue-property-decorator';
import  BaseVue  from 'base.vue';

import NavTop  from '../../../../commons/vue_plugins/components/nav_top/nav_top.vue';


import getShopCarCount from '../home/getShopCarCount';

import { NumberPicker } from './picker/num.picker';

import { isNotLogin, toLogin, appendParams } from 'common.env';
import VideoBanner  from '../../../../commons/vue_plugins/components/video/video.banner.vue';
import VueVideo  from '../../../../commons/vue_plugins/components/video/video.vue';

// 预加载订单页面数据
require.ensure([], require => {}, 'web/order/order');

import './goods.detail.scss';
import goodsService from './goods.service';
@Component({
    template: require('./goods.detail.html'),
    components: {
        navtop: NavTop,
        numpicker: NumberPicker,
        gsbanner: VideoBanner,
        fsvideo: VueVideo
    }
})

export class GoodsDetail extends BaseVue {
    goods = {};
    show2Car = false;
    showgoPay = false;
    int_day = 0;
    int_hour = 0;
    int_second = 0;
    int_minute = 0;
    showTime = true;
    timerID;
    bannerImg = [];
    hasBannerVideo = false;
    coverVideoOptions = {};
    shopkeeper = {};
    playerOptions = {
        fluid: true,
    };
    shopId;
    minLimit = {
        minimumConsumption: 0,
        buy: 0
    }
    created() {
        getShopCarCount(this.$store).getShopcarGoodsesList();
        this.getGoodsMsg();
        document.title = "商品详情";
        goodsService(this.$store).getMinimumConsumption().then(res => {
            this.minLimit = {
                minimumConsumption: res.data.minimumConsumption,
                buy: 0
            }
        })
    }


    mounted() {

    }
    refresh(done) {
        let _this = this;
        setTimeout(() => {
            _this.getGoodsMsg();
            done();
        }, 2500)
    }

    getGoodsMsg() {
        let _this = this;
        if (localStorage.ownShop == 1) {
            let opt = {
                userId: this.$store.state.workVO.user.userId,
                token: this.$store.state.workVO.user.token
            }
            goodsService(this.$store).getWdInfo(opt).then(res => {
                if (!res.data.userImg) {
                    res.data.userImg = "/static/images/newshop/touxiang.png"
                }
                _this.shopkeeper = {
                    wdName: res.data.shopName,
                    wdImg: res.data.userImg,
                    vipGrade: res.data.vip,
                    school: res.data.school,
                }
            })
        } else {
            this.shopId = this.$route.query.shopId;
            let wdInfo = JSON.parse(localStorage.wdVipInfo);
            if (!this.shopId) {
                this.shopId = wdInfo.infoId;
            }
            let cartCache = JSON.parse(localStorage.getItem("shopcartCache"));
            if (cartCache) {
                if (cartCache[0].shopId != this.shopId) {
                    localStorage.removeItem("shopcartCache");
                    _this.$store.state.shopCar.count = 0;
                }
            }
            this.fetchShopData().then((res) => {
                console.log(res.wdImg);
                if (!res.wdImg) {
                    res.wdImg = "/static/images/newshop/touxiang.png"
                }
                _this.shopkeeper = {
                    wdName: res.wdName,
                    wdImg: res.wdImg,
                    vipGrade: res.wdVipGrade,
                    school: res.school,
                }
            })
        }
        let opt={
            goodsId: _this.$route.query.goodsId,
            shopId: _this.shopId
        }
        goodsService(_this.$store).goodsInfo(opt)
            .then(res => {
                if ((res.data.data && res.data.data.state != 1) || res.data.errorCode) {
                    let dialogObj = {
                        title: '',
                        content: '该商品已下架',
                        assistBtn: '',
                        mainBtn: '知道了',
                        type: 'info',
                        assistFn() {

                        },
                        mainFn() {
                            window.history.back();
                        }
                    };
                    _this.$store.state.$dialog({ dialogObj });
                    return;
                }
                _this.goods = res.data.data;
                let arr = res.data.data.bannerImg.split(",");

                if (res.data.data.bannerVideo) {
                    _this.playerOptions = {
                        muted: true,
                        sources: [{
                            type: "video/mp4",
                            src: res.data.data.bannerVideo
                        }],
                        poster: arr[0],
                    }
                    let newArr = [];
                    for (let index = 0; index < arr.length; index++) {
                        if (index > 0) {
                            newArr.push(arr[index]);
                        }
                    }
                    _this.hasBannerVideo = true;
                    _this.bannerImg = newArr;
                } else {
                    _this.bannerImg = arr;
                }

                if (res.data.data.goodsVideo) {
                    _this.coverVideoOptions = {
                        fluid: true,
                        muted: true,
                        sources: [{
                            type: "video/mp4",
                            src: res.data.data.goodsVideo
                        }],
                        poster: res.data.data.goodsVideoImg,                      
                    }
                }
                this.fetchShopData()
                    .then((res) => {
                        let config = {
                            title: res.wdName + ': ' + _this.goods.goodsName,
                            desc: '悄悄告诉你：我发现了一枚好东西，千万不要告诉别人！~',
                            imgUrl: _this.goods.coverImg,
                            link: window.location.href.split('#')[0] + '&shopId=' + res.infoId
                        }
                        _this.updateWxShare(config);
                    })

                if (!res.data.data.offTimestamp) {
                    _this.showTime = false;
                    return;
                }
                _this.countDown(res.data.data.offTimestamp);
            }).catch(err => {

            });
    }
    goShopcart() {
        this.$router.push({ path: "shop_car" });
    }
    joinCar(goodsId) {
        this.show2Car = true;
        this.minLimit.buy = 1;
    }
    changeShowIt() {
        this.show2Car = false;
        this.showgoPay = false;
        this.minLimit.buy = 0;
    }
    buyNow(goodsId) {
        this.showgoPay = true;
        this.minLimit.buy = 0;
    }

    numberpckerHide() {
        this.show2Car = this.showgoPay = false;
    }

    finish2Car(num) {
        this.goods.number = num;
        let _this = this;
        let flag = !isNotLogin();
        console.log(flag);
        if (flag) {
            let opt = {
                goodsId: _this.goods.goodsId,
                number: num,
                shopId: _this.shopId
            }
            goodsService(_this.$store).addGoods(opt).then(res => {
                if (res.data.errorCode) {
                    let _toast = _this.$store.state.$toast;
                    _toast({ title: res.data.msg, success: false });
                    return;
                }
                let _toast = _this.$store.state.$toast;
                _toast({ title: '加入购物车成功', success: true });
                getShopCarCount(_this.$store).getShopcarGoodsesList();
            });

        } else {
            //本地存储购物车
            let cartCache = JSON.parse(localStorage.getItem("shopcartCache"));
            let cout = 0;
            if (cartCache) {
                cartCache.forEach(ele => {
                    cout += ele.shopCarts.length;
                });
                if (cout >= 10) {
                    let dialog = _this.$store.state.$dialog;
                    let dialogObj = {
                        title: '提示',
                        content: '登录后可加入更多，是否登录？',
                        assistBtn: '取消',
                        mainBtn: '确定',
                        type: 'info',
                        assistFn() {

                        },
                        mainFn() {
                            toLogin(_this.$router, {
                                toPath: 'goods_detail', realTo: 'goods_detail?goodsId=' + _this.$route.query.goodsId
                            });
                        }
                    };
                    this.$store.state.$dialog({ dialogObj });
                    return;
                }
                let exit;


                for (let j = 0, len1 = cartCache[0].shopCarts.length; j < len1; j++) {
                    if (cartCache[0].shopCarts[j].goodsId == _this.goods.goodsId) {
                        cartCache[0].shopCarts[j] = _this.goods;
                        cartCache[0].shopCarts[j].number = _this.goods.number;
                        exit = true;
                        break;
                    }
                    exit = false;
                }
                if (!exit) {
                    cartCache[0].shopCarts.push(_this.goods);

                }

            } else {
                let wdInfo = JSON.parse(localStorage.wdVipInfo);
                cartCache = [{
                    "shopId": _this.shopId,
                    "shopName": wdInfo.wdName,
                    "shopCarts": [_this.goods]
                }];
            }
            localStorage.setItem("shopcartCache", JSON.stringify(cartCache));
            let _toast = _this.$store.state.$toast;
            _toast({ title: '加入购物车成功' });
            getShopCarCount(_this.$store).getShopcarGoodsesList();
        }

    }

    finishgoPay(num) {
        let gsType = this.goods.gsType, goodsType;
        let goodsId = this.goods.goodsId;
        // TODO: goto gen order
        gsType == 2 ? goodsType = 'empty' : goodsType = 'entity';
        let flag = isNotLogin();
        if (flag) {
            let url = 'order_submit?goodsId=' + goodsId + '&goodsType=' + goodsType + '&orderSrouce=goods' + '&number=' + num;
            toLogin(this.$router, { toPath: "order_submit", realTo: url });
            return;
        }
        this.$router.push({ path: 'order_submit', query: { goodsId: goodsId, goodsType: goodsType, number: num, orderSrouce: 'goods' } });
    }
    //倒计时
    countDown(leftchektime) {
        this.timerID && clearInterval(this.timerID);
        let time_distance, _this = this;
        time_distance = leftchektime / 1000;
        this.timerID = setInterval(function () {
            time_distance--;
            if (time_distance > 0) {
                _this.int_day = Math.floor(time_distance / (60 * 60 * 24));

                _this.int_hour = Math.floor(time_distance / (60 * 60) % 24);

                _this.int_minute = Math.floor(time_distance / 60 % 60);

                _this.int_second = Math.floor(time_distance % 60);
                //加0
                if (_this.int_hour < 10)
                    _this.int_hour = "0" + _this.int_hour;
                if (_this.int_minute < 10)
                    _this.int_minute = "0" + _this.int_minute;
                if (_this.int_second < 10)
                    _this.int_second = "0" + _this.int_second;
            }
            else {
                _this.int_day = 0;
                _this.int_hour = 0;
                _this.int_minute = 0;
                _this.int_second = 0;
                clearInterval(_this.timerID);
                _this.getGoodsMsg();
            }
        }, 1000);
    }
    goHome() {
        this.$router.push({ path: 'home', query: { shopId: this.shopId } })
    }
}
