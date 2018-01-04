import { Component} from 'vue-property-decorator';
import  BaseVue  from 'base.vue';

import { isNotLogin, toLogin, getLocalUserInfo } from "common.env";
import { NavTop } from './navtop/navtop.component';
import { NumberPicker } from './picker/num.picker';
import  VideoBanner from '../../../../commons/vue_plugins/components/video/video.banner.vue';
import VueVideo  from '../../../../commons/vue_plugins/components/video/video.vue';


import shopCarGoodsService from '../classify/getShopCarCount';

import goodsService from './goods.service';
import './goods.detail.scss';
@Component({
    template: require('./goods.detail.html'),
    components: {
        navtop: NavTop,
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
    _$service;
    goodsPrice = 0;
    moneyPrice = 0;
    minExport = {
       flag:false,
       leastBuy:0,
       buy:1
    }
    playerOptions = {
    }
    shopkeeper = {};
    created() {
        this.getGoodsMsg();
    }

    refresh(done) {
        let _this = this;
        setTimeout(() => {
            _this.getGoodsMsg();
            done();

        }, 2500)
    }

    getGoodsMsg() {
        document.title = "商品详情";
        let _this = this;
        _this._$service = goodsService(_this.$store);
        this._$service.getLeastBuyMoney().then(v => {
           _this.minExport = {
               flag:v.data.flag,
               leastBuy: v.data.leastBuy
           }
        });
        let opt = {
            userId: this.$store.state.workVO.user.userId,
            token: this.$store.state.workVO.user.token
        }
        this._$service.getWdInfo(opt).then(res => {
            if (res.data.state == 3 || res.data.upWdInfo == 0) {
                _this.shopkeeper = {
                    wdName: "学惠精选官方商城",
                    wdImg: "/static/images/newshop/xuehui-fang.png",
                    vipGrade: 1,
                    id: 0
                }
                return;
            }
            this._$service.getUpWdInfo(res.data.upWdInfo).then(res => {
                if (!res.data.wdVipInfo.wdImg) {
                    res.data.wdVipInfo.wdImg = "/static/images/newshop/touxiang.png"
                }
                _this.shopkeeper = {
                    wdName: res.data.wdVipInfo.wdName,
                    wdImg: res.data.wdVipInfo.wdImg,
                    vipGrade: res.data.wdVipInfo.wdVipGrade,
                    id: 1
                }
            })
        })

        _this._$service.goodsInfo(_this.$route.query.goodsId)//获取商品信息
            .then(res => {
                if (res.data.data.state != 1) {
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
                _this.goodsPrice = res.data.data.moneyPrice;
                let wdId = _this.$store.state.workVO.user.userId;
                let opt = {
                    shopId: wdId, //微店id
                    goodsId: _this.$route.query.goodsId
                }
                _this._$service.getGradeMsg(opt).then(res => { //查询vip等级

                    console.log(res);
                    if (res.data.flag) {
                        _this.isGradeShow = true;
                    } else {
                        _this.isGradeShow = false;
                    }
                    let _result = res.data.discMap;
                    _this.myGrade = res.data.myGrade;
                    let arr = [];
                    for (let i in _result) {
                        let indx = Number(i.substr(i.length - 1, 1));
                        // console.log(indx);
                        let obj= {
                            id: indx,
                            vip: i,
                            vipName: _result[i][1],
                            vipdiscount: Math.ceil((Number(_result[i][0]) / 100) * _this.goodsPrice),
                            show: false
                        };
                        if (i == 'vip' + res.data.myGrade) {
                            obj.show = true;
                            _this.moneyPrice = obj.vipdiscount;
                            _this.goods.moneyPrice = _this.moneyPrice;
                        }
                        arr.push(obj);
                    }

                    for (let i = 0; i < arr.length - 1; i++) {
                        for ( let j = 0; j < arr.length - 1 - i; j++) {
                            if (arr[j].id < arr[j + 1].id) {
                                let temp = arr[j];
                                arr[j] = arr[j + 1];
                                arr[j + 1] = temp;
                            }
                        }
                    }
                 _this.grade=arr;
                })
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

                this.updateWxShare(config);
                if (!res.data.data.offTimestamp) {
                    _this.showTime = false;
                    return;
                }
                _this.countDown(res.data.data.offTimestamp);
            });
    }

    mounted(){
        let self = this;
        //获取上级微店信息
        this._$service.upShopInfo(getLocalUserInfo().userId).then(res => {
            //请求数据格式不对
            if (!res||res.errorCode||!res.data) {
                return;
            }else{
                let wdinfo = res.data;
                self.fetchShopData()
                .then((res)=>{
                    //当前浏览的商品是自己的上级
                    if (wdinfo.infoId==res.infoId) {
                        return ;
                    }else{
                        localStorage.wdVipInfo = JSON.stringify(wdinfo);
                        self.getGoodsMsg();
                    }
                })
            }
        })
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
        this.show2Car = true;
        this.minExport.buy = 1;
    }
    changeShowIt() {
        this.show2Car = false;
        this.showgoPay = false;

    }
    buyNow(goodsId) {
        if (this.goods.state == 0) {
            let dialogObj = {
                title: '',
                content: '该商品已下架',
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
        this.showgoPay = true;
        this.minExport.buy=0;
        // console.log(this.minExport);
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
        let gsType = this.goods.gsType, goodsType;
        let goodsId = this.goods.goodsId;
        // TODO: goto gen order
        gsType == 2 ? goodsType = 'empty' : goodsType = 'entity';
        this.$router.push({ path: 'cms_purchase_submit_order', query: { goodsId: goodsId, goodsType: goodsType, number: num, orderSrouce: 'goods' } });
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
}
