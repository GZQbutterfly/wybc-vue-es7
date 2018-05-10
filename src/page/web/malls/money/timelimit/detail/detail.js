/**
 * 限时购 商品详情
 */

import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isArray } from 'lodash';

import goodsService from './detail.service';
import './detail.scss';

import getShopCarCount from '../../../shop_car/getShopCarCount';

import { NumberPicker } from './picker/num.picker';

import { isNotLogin, toLogin, appendParams } from 'common.env';
import { GoodsComponent } from '../../../goods_detail_component/goods_detail_component';
import VideoBanner from '../../../../../../commons/vue_plugins/components/video/video.banner.vue';
import VueVideo from '../../../../../../commons/vue_plugins/components/video/video.vue';
@Component({
    template: require('./detail.html'),
    components: {
        numpicker: NumberPicker,
        "goods-component": GoodsComponent
    }
})
export class MoneyTimeLimitDetail extends BaseVue {
    goods = '';
    show2Car = false;
    showgoPay = false;
    timeObj = {
        int_day: '00',
        int_hour: '00',
        int_second: '00',
        int_minute: '00',
        int_mounth: "00",
        timeShowType: 1      //时间显示类型 1已开启 2y未开启但是时间小于1天 3时间大于1天
    };
    consumptionType = 3;
    timeShowType = 1;      //时间显示类型 1已开启 2y未开启但是时间小于1天 3时间大于1天
    timerID;
    bannerImg = [];
    hasBannerVideo = false;
    coverVideoOptions = {};
    shopkeeper = {};
    playerOptions = {
        fluid: true,
    };
    periodId;
    amountGold = 0;
    _$service;
    minLimit = {
        minimumConsumption: 0,
        buy: 0
    };
    periodStart = 8;//几点场
    shopId;
    shopInfo;

    async mounted() {
        let _query = this.$route.query;
        this._$service = goodsService(this.$store);
        this.shopInfo = await this.$store.dispatch('CHECK_WD_INFO');
        this.shopId = this.shopInfo.shopId;
        this.$nextTick(() => {
            document.title = "商品详情";
            this.getGoodsMsg();
            this.queryTimeLimit();
            getShopCarCount(this.$store).getShopcarGoodsesList();
        });
    }

    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.getGoodsMsg();
            _self.queryTimeLimit();
            done(true);
        }, 500)
    }

    async getGoodsMsg() {
        let _self = this;
        let opt = {
            goodsId: _self.$route.query.goodsId,
            shopId: _self.shopId
        }
        this._$service.goodsInfo(opt)
            .then(res => {
                let _result = res.data;
                if (_result.errorCode || (_result.data && (_result.data.state != 1 || _result.data.onSaleState != 1))) {
                    let dialogObj = {
                        title: '提示',
                        content: _result.msg || '该商品已下架或停售!',
                        assistBtn: '',
                        mainBtn: '知道了',
                        type: 'info',
                        assistFn() {

                        },
                        mainFn() {
                            window.history.back();
                        }
                    };
                    _self.$store.state.$dialog({ dialogObj });
                    return;
                }
                _self.goods = _result.data;
                let arr = _result.data.bannerImg.split(",");
                if (_result.data.bannerVideo) {
                    _self.playerOptions = {
                        muted: true,
                        sources: [{
                            type: "video/mp4",
                            src: _result.data.bannerVideo
                        }],
                        poster: arr[0],
                    }
                    let newArr = [];
                    for (let index = 0; index < arr.length; index++) {
                        if (index > 0) {
                            newArr.push(arr[index]);
                        }
                    }
                    _self.hasBannerVideo = true;
                    _self.bannerImg = newArr;
                } else {
                    _self.bannerImg = arr;
                }

                if (_result.data.goodsVideo) {
                    _self.coverVideoOptions = {
                        fluid: true,
                        muted: true,
                        sources: [{
                            type: "video/mp4",
                            src: _result.data.goodsVideo
                        }],
                        poster: _result.data.goodsVideoImg,
                    }
                }
            }).catch(err => {

            });
    }
    queryTimeLimit() {
        let _query = this.$route.query;
        let goodsId = _query.goodsId;
        this.periodId = _query.periodId;
        let _self = this;
        let _data = {
            goodsId: goodsId,
            periodId: _self.periodId
        }
        this._$service.queryTime(_data).then(res => {
            let _result = res.data;
            _self.periodStart = _result.periodStart;
            if (_result.errorCode) {
                let dialogObj = {
                    title: '',
                    content: _result.msg || '限时购未开启!',
                    assistBtn: '',
                    mainBtn: '知道了',
                    type: 'info',
                    assistFn() {

                    },
                    mainFn() {
                        if (_result.msg == "该分场限时购已结束") {
                            _self.$router.push({ path: 'money_timelimit_list' });
                        } else {
                            _self.$router.push({ path: 'home' });
                        }

                    }
                };
                _self.$store.state.$dialog({ dialogObj });
                return;
            }
            if (_result.leftTimeStamp < 0) {
                let dialogObj = {
                    title: '提示',
                    content: '该分场限时购已结束!',
                    assistBtn: '',
                    mainBtn: '知道了',
                    type: 'info',
                    assistFn() {
                    },
                    mainFn() {
                        _self.$router.push({ path: 'money_timelimit_list' });
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
                return;
            }
            if (_result.periodState == 6) {
                _self.timeObj.timeShowType = 1;
                if (_result.leftTimeStamp > 0) {
                    _self.countDown(_result.leftTimeStamp);
                }
            } else {
                let flag = _self.isDayGreaterThanZero(_result.leftTimeStamp);
                if (flag) {
                    _self.timeObj.timeShowType = 3;
                    _self.timeObj.int_mounth = _result.endTime.slice(5, 7);
                    _self.timeObj.int_day = _result.endTime.slice(8, 10);
                    _self.timeObj.int_hour = _result.endTime.slice(11, 13);
                    _self.timeObj.int_minute = _result.endTime.slice(14, 16);
                    _self.timeObj.int_second = _result.endTime.slice(17, 19);
                } else {
                    _self.timeObj.timeShowType = 2;
                    if (_result.leftTimeStamp > 0) {
                        _self.countDown(_result.leftTimeStamp);
                    }
                }
            }
        })
    }


    goShopcart() {
        this.$router.push({ path: "shop_car" });
    }

    joinCar(goodsId) {
        let _self = this;
        this.queryStock(function () {
            _self.show2Car = true;
        });
    }

    changeShowIt() {
        this.show2Car = false;
        this.showgoPay = false;
    }

    buyNow() {
        let goodsId = this.$route.query.goodsId;
        let periodId = this.$route.query.periodId;
        let flag = isNotLogin();
        if (flag) {
            let _route = 'money_timelimit_detail?goodsId=' + goodsId + '&periodId=' + periodId;
            toLogin(this.$router, { toPath: _route });
            return;
        }
        let _self = this;
        this.queryStock(function () {
            _self.showgoPay = true;
        });
    }

    numberpckerHide() {
        this.show2Car = this.showgoPay = false;
    }

    async finishgoPay(num) {
        let goodsId = this.goods.goodsId;
        let periodId = this.$route.query.periodId;
        let query = {
            goodsId: goodsId,
            goodsType: "entity",
            number: num,
            orderSrouce: 'goods',
            fastFlag: false,
            periodId: periodId
        };
        this.$router.push({ path: 'order_submit', query });
    }

    stocks = {
        stock: 10,
        userLimite: 5,
        userBuyNum: 0
    }
    //库存
    async queryStock(cb) {
        let _self = this;
        let _data = {
            goodsId: _self.$route.query.goodsId,
            shopId: _self.shopId,
            periodId: _self.periodId
        }
        let ordinaryStockNum = (await this._$service.queryGoodsStock(_data)).data;
        let userBuyNum = (await this._$service.queryUserBuyNum(_data)).data;
        _self.stocks = {
            stock: ordinaryStockNum.stock,
            userLimite: ordinaryStockNum.userLimite,
            userBuyNum: userBuyNum
        }

        cb && cb();
    }
    //倒计时模块区域显示状态
    isDayGreaterThanZero(leftchektime) {
        let time_distance, int_day;
        time_distance = leftchektime / 1000;
        int_day = Math.floor(time_distance / (60 * 60 * 24));
        if (int_day > 0) {
            return 1;
        } else {
            return 0;
        }
    }
    //倒计时
    countDown(leftchektime) {
        this.timerID && clearInterval(this.timerID);
        let time_distance, _self = this;
        time_distance = leftchektime / 1000;
        this.timerID = setInterval(function () {
            time_distance--;
            if (time_distance > 0) {
                // _self.int_day = Math.floor(time_distance / (60 * 60 * 24));

                _self.timeObj.int_hour = Math.floor(time_distance / (60 * 60) % 24);

                _self.timeObj.int_minute = Math.floor(time_distance / 60 % 60);

                _self.timeObj.int_second = Math.floor(time_distance % 60);
                //加0
                if (_self.timeObj.int_hour < 10)
                    _self.timeObj.int_hour = "0" + _self.timeObj.int_hour;
                if (_self.timeObj.int_minute < 10)
                    _self.timeObj.int_minute = "0" + _self.timeObj.int_minute;
                if (_self.timeObj.int_second < 10)
                    _self.timeObj.int_second = "0" + _self.timeObj.int_second;
            }
            else {
                _self.timeObj = {
                    int_day: '00',
                    int_hour: '00',
                    int_minute: '00',
                    int_second: '00',
                    timeShowType: _self.timeObj.timeShowType
                }
                clearInterval(_self.timerID);
                _self.getGoodsMsg();
                _self.queryTimeLimit();
            }
        }, 1000);
    }

    goHome() {
        this.$router.push({ path: 'home', query: { shopId: this.shopId } })
    }

    setWxShareConfig() {
        let _self = this;
        let config = {
            title: '限时低价，整点开抢中!',
            desc: '优质商品限时低价尽在学惠精选，快来抢购吧 ！',
            imgUrl: _self.goods.coverImg,
            link: location.origin + location.pathname + '?&goodsId=' + _self.goods.goodsId + '&shopId=' + _self.shopInfo.infoId + '&periodId=' + _self.periodId,
            success: function () {
                _self.shareSuccessDone();
            }
        };
        _self.updateWxShare(config);
    }

    /**
    * 分享成功的回调
    */
    async shareSuccessDone() {
        let _self = this;
        let data = {
            goodsId: _self.$route.query.goodsId
        }
        let res = await _self._$service.shareDone(data);
        res = res.data;
        if (!res.errorCode) {
            //分享成功
            console.log('分享结果', res)
        }
    }

    destroyed() {
        this.timerID && clearInterval(this.timerID);
    }
}