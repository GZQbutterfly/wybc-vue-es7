import { Component} from 'vue-property-decorator';
import  BaseVue  from 'base.vue';

import { isNotLogin, toLogin, getLocalUserInfo } from "common.env";
import { NumberPicker } from './picker/num.picker';
import  VideoBanner from 'components/video/video.banner.vue';
import VueVideo  from 'components/video/video.vue';


import shopCarGoodsService from '../classify/getShopCarCount';

import goodsService from './goods.service';
import './goods.detail.scss';
@Component({
    template: require('./goods.detail.html'),
    components: {
        numpicker: NumberPicker,
        gsbanner: VideoBanner,
        fsvideo: VueVideo
    }
})

export class CmsPurchaseGoodsDetail extends BaseVue {
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
    isGradeShow = false;
    myGrade = 1;
    grade = [];
    owngrade = [];
    _$service;
    goodsPrice = 0;
    moneyPrice = 0;
    minExport = {
       flag:false,
       leastBuy:0,
       buy:1
    }
    counponList = [];
    counponObj = {};
    playerOptions = {
    }
    shopkeeper =  {
        wdName: "学惠精选官方商城",
        wdImg: "/static/images/newshop/xuehui-fang.png",
        id: 0
    }
    stockType = '';
    stockTypes = [{
        stocktype: "仓储中心代管",
        stocktypeShow: false
    }, {
        stocktype: "快速仓自储",
        stocktypeShow: false
    }];
    stockTypeShow = false;
    number = 0;
    fastStockState = {
        amount: 0,
        buyType: 1
    }
    // created() {
    //     this.getGoodsMsg();
    // }

    refresh(done) {
        let _this = this;
        setTimeout(() => {
            _this.getGoodsMsg();
           _this.queryGoodsCoupons();
            done(true);
        }, 500)
    }

    mounted(){
        this._$service = goodsService(this.$store);
        this.getGoodsMsg();
        this.queryGoodsCoupons();
    }
    
    getGoodsMsg() {
        document.title = "商品详情";
        let _this = this;
        this.stockTypeShow = false;
        this._$service.getLeastBuyMoney().then(v => {
            _this.minExport = {
                flag: v.data.flag,
                leastBuy: v.data.leastBuy
            }
        });
        let opt = {
            userId: this.$store.state.workVO.user.userId,
            token: this.$store.state.workVO.user.token
        }

        _this._$service.goodsInfo(_this.$route.query.goodsId)//获取商品信息
            .then(res => {
                if (res.data.errorCode || (res.data.data.state != 1 || res.data.data.onSaleState != 1)) {
                    let dialogObj = {
                        title: '',
                        content: '该商品已下架或停售',
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
                _this.goodsPrice = res.data.data.moneyPrice;
                let wdId = _this.$store.state.workVO.user.userId;
                let opt = {
                    shopId: wdId, //微店id
                    goodsId: _this.$route.query.goodsId
                }
                // _this._$service.getGradeMsg(opt).then(res => { //查询vip等级

                //     console.log(res);
                //     if (res.data.flag) {
                //         _this.isGradeShow = true;
                //     } else {
                //         _this.isGradeShow = false;
                //     }
                //     let _result = res.data.discMap;
                //     let _result2 = res.data.ownStoreMap;
                //     _this.myGrade = res.data.myGrade;
                //     let arr = [],ownarr=[];
                //     for (let i in _result) {
                //         let indx = Number(i.substr(i.length - 1, 1));
                //         let obj= {
                //             id: indx,
                //             vip: i,
                //             vipName: _result[i][1],
                //             vipdiscount: Math.ceil((Number(_result[i][0]) / 100) * _this.goodsPrice),
                //             show: false
                //         };
                //         if (i == 'vip' + res.data.myGrade) {
                //             obj.show = true;
                //             _this.moneyPrice = obj.vipdiscount;
                //             _this.goods.moneyPrice = _this.moneyPrice;
                //         }
                //         arr.push(obj);
                //     }
                //     for (let i in _result2) {
                //         let indx = Number(i.substr(i.length - 1, 1));
                //         let obj = {
                //             id: indx,
                //             vip: i,
                //             vipName: _result2[i][1],
                //             vipdiscount: Math.ceil((Number(_result2[i][0]) / 100) * _this.goodsPrice),
                //             show: false
                //         };
                //         if (i == 'vip' + res.data.myGrade) {
                //             obj.show = true;
                //         }
                //         ownarr.push(obj);
                //     }

                //     for (let i = 0; i < arr.length - 1; i++) {
                //         for ( let j = 0; j < arr.length - 1 - i; j++) {
                //             if (arr[j].id < arr[j + 1].id) {
                //                 let temp = arr[j];
                //                 arr[j] = arr[j + 1];
                //                 arr[j + 1] = temp;
                //             }
                //         }
                //     }
                //     for (let i = 0; i < ownarr.length - 1; i++) {
                //         for (let j = 0; j < ownarr.length - 1 - i; j++) {
                //             if (ownarr[j].id < ownarr[j + 1].id) {
                //                 let temp = ownarr[j];
                //                 ownarr[j] = ownarr[j + 1];
                //                 ownarr[j + 1] = temp;
                //             }
                //         }
                //     }
                //  _this.grade=arr;
                //  _this.owngrade = ownarr;
                // })
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
                let config = {
                    title: _this.goods.goodsName,
                    imgUrl: _this.goods.coverImg,
                    link: window.location.href.split('#')[0],
                }

                if (res.data.data.goodsVideo) {
                    _this.coverVideoOptions = {
                        muted: true,
                        sources: [{
                            type: "video/mp4",
                            src: res.data.data.goodsVideo
                        }],
                        poster: res.data.data.goodsVideoImg,
                    }
                }

                // this.updateWxShare(config);
                if (!res.data.data.offTimestamp) {
                    _this.showTime = false;
                    return;
                }
                _this.countDown(res.data.data.offTimestamp);
            });
    }
    queryGoodsCoupons() {
        let _self = this;
        this._$service.queryGoodsCoupons(this.$route.query.goodsId).then((data) => {
            _self.counponObj = data;
        });
    }

    toCounponDetail() {
        this.$router.push({ path: 'cms_mask_coupon', query: { goodsId: this.$route.query.goodsId } });
    }
    goShopcart() {
        this.$router.push({ path: "cms_purchase_shop_car" });
    }
    joinCar(goodsId) {

        if (this.goods.state == 0) {
            let _toast = this.$store.state.$toast;
            _toast({ title: '商品未上架,不能加入进货单', success: false });
            return;
        }
        this.queryStock(0);
        this.show2Car = true;
        this.minExport.buy = 1;
    }
    changeShowIt() {
        this.show2Car = false;
        this.showgoPay = false;

    }
    buyNow(goodsId) {
        if (!this.goods.state || !this.goods.onSaleState) {  
            let dialogObj = {
                title: '',
                content: '该商品已下架或停售',
                assistBtn: '',
                mainBtn: '知道了',
                assistFn() {

                },
                mainFn() {

                }
            };
            this.$store.state.$dialog({ dialogObj });
            return;
        }
        this.queryStock(1);
        this.showgoPay = true;
        this.minExport.buy=0;
        // console.log(this.minExport);
    }
    onClose(){
        this.stockTypeShow = false;
    }
    numberpckerHide() {
        this.show2Car = this.showgoPay = false;
        this.minExport.buy = 1;
    }

    finish2Car(num) {
        this.goods.number = num;
        let _this = this;
            let opt = {
                goodsId: _this.goods.goodsId,
                number: num
            }
            goodsService(_this.$store).addGoods(opt).then(res => {
                if (res.data.errorCode) {
                    let _toast = _this.$store.state.$toast;
                    _toast({ title: res.data.msg, success: false });
                    return;
                }
                let _toast = _this.$store.state.$toast;
                _toast({ title: '加入进货单成功' });
                shopCarGoodsService(this.$store).getShopcarGoodsesList();
            });
    }

    finishgoPay(num) {
        let _this = this;
        let goodsId = this.goods.goodsId;
        this.$router.push({ path: 'cms_purchase_submit_order', query: { goodsId: goodsId, goodsType: "entity", number: num, orderSrouce: 'goods', stockType: 1 } });
    }
  
    //库存
    async queryStock(buyType) {
        let _self = this;
        let _param = {
            goodsId: _self.$route.query.goodsId,
            deliveryType: 0
        }
        let ordinaryStockNum = (await this._$service.queryGoodsStock(_param)).data;
        _self.fastStockState = {
            amount: ordinaryStockNum,
            buyType: buyType
        }
    }

    // chooseStockTpe(index){
    //     let _this = this;
    //     for (let i = 0, len = _this.stockTypes.length; i < len; i++) {
    //         if (i == index) {
    //             _this.stockTypes[i].stocktypeShow = true;
    //         } else {
    //             _this.stockTypes[i].stocktypeShow = false;
    //         }
    //     }
    //     let gsType = this.goods.gsType, goodsType;
    //     let goodsId = this.goods.goodsId;
    //     let num = this.number;
    //     // TODO: goto gen order
    //     gsType == 2 ? goodsType = 'empty' : goodsType = 'entity';
    //     this.$router.push({ path: 'cms_purchase_submit_order', query: { goodsId: goodsId, goodsType: goodsType, number: num, orderSrouce: 'goods', stockType: index } });
    // }
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
}
