import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import userInfoService from './userinfo.service';
//import getShopCarCount from '../home/getShopCarCount';
//import dialog from '../../components/popup/dialog';
import { isNotLogin, toLogin, loginDialog, setUserValid, getAuthUser, isWeiXin, setCleanLocalinfo, toCMS } from 'common.env';
import { isEmpty } from 'lodash';

import './userinfo.scss';


@Component({
    template: require('./userinfo.html')
})
export class UserInfo extends BaseVue {
    user_img = '/static/images/pic-nologin.png';
    userInfo = {};
    userScore = {
        amountGold: '0', // 默认为0 就行
        amountCoupon: '0'
    };
    userLogin = false;
    orderList = [];
    pointData = [
        {
            name: '金币',
            value: 'amountGold',
            img: '/static/images/money/icon-big.png',
            style: { color: '#ee893e' },
            imgStyle: { width: '.19rem', height: '.195rem' },
            path: "money_gold_detail",
        }, {
            name: '优惠券',
            value: 'amountCoupon',
            img: '/static/images/money/coupon.png',
            style: { color: '#ff586c' },
            imgStyle: { width: '.22rem', height: '.14rem' },
            path: "coupon_list",
        }
    ];

    hasShop = false
    userMsgNum = 0;
    //查询是否有店失败 隐藏入口
    hasShopError = true;
    _$service;
    data() {
        return {

        }
    }

    // private _shopCarCount;
    mounted() {
        //注册服务
        this._$service = userInfoService(this.$store);
        let _self = this;
        this.$nextTick(() => {
            // 这里面是dom加载完成后的
            this.orderList = this._$service.getOrderListInfo();
            //TODO 头像区下拉放大
            let user = _self.$refs.user;
            let dom = _self.$refs.userinfo;
            //fix clear wechat浏览器默认可下拉
            dom.addEventListener('touchmove', function (e) { e.preventDefault() });
            //下拉放大
            dom.addEventListener('touchstart', (event) => {
                let posY = event.touches[0].clientY;
                let touchmove = function (event) {
                    let newY = event.touches[0].clientY;
                    if (newY >= posY) {
                        user.style.backgroundSize = 'auto ' + (208.5 + (newY - posY) / 4) / 100 + 'rem';
                        user.style.height = (208.5 + (newY - posY) / 4) / 100 + 'rem';
                        user.style.transitionDuration = '0ms';
                    }
                }
                let touchend = function (event) {
                    //fix 上拉
                    posY = 99999;
                    user.style.backgroundSize = 'auto 2.085rem';
                    user.style.height = '2.085rem';
                    user.style.transitionDuration = '500ms';
                    //remove lis
                    dom.removeEventListener('touchmove', touchmove)
                    dom.removeEventListener('touchend', touchend);
                }
                dom.addEventListener('touchmove', touchmove)
                dom.addEventListener('touchend', touchend);
            });
        });

        //监听
        setCleanLocalinfo(() => {
            this.initUser();
        });

    }

    queryUserRoll() {
        let _self = this;
        _self._$service.queryUserRoll().then((res) => {
            if (!res.data.errorCode) {
                _self.userScore.amountGold = res.data.amountGold;
                _self.userScore.amountCoupon = res.data.amountCoupon;
                if(_self.userScore.amountGold > 9999999){
                    _self.userScore.amountGold = '9999999+';
                }
                if(_self.userScore.amountCoupon > 9999999){
                    _self.userScore.amountCoupon = '9999999+';
                }
            }
        });
    }

    queryUserHasShop() {
        let _self = this;
        this._$service.queryUserHasShop().then((res) => {
            console.log('用户开店信息', res)
            if (!res.data.errorCode) {
                _self.hasShopError = false;
            }
            if (!res.data.errorCode && !isEmpty(res.data)) {
                _self.hasShop = true;
            }
        });
    }

    userinfoInit() {

        if (!isNotLogin()) {
            this.userLogin = true;
            this.userInfo = this.$store.state.workVO.user;
            this.user_img = this.userInfo.headimgurl || '/static/images/pic-login.png';

            // 获取用户订单中数量
            this._$service.getUserOrderNumb().then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return;
                }
                this.orderList[0].num = _result[1] || '';
                this.orderList[1].num = (_result[2] + _result[3]) || '';
                this.orderList[2].num = _result[4] || '';
                this.orderList[3].num = '';
            })
            this.queryUserHasShop();


            this.queryUserRoll();

            this._$service.queryMessageNum().then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return;
                }
                this.userMsgNum = _result > 999 ? '999+' : _result;
            });
        }
    }
    activated() {
        document.title = "我的";
        // keep-alive 时 会执行activated
        this.$nextTick(() => {
            this.userinfoInit();
        });
    }

    getUserName(name) {
        return name.length > 6 ? name.substring(0, 6) + '...' : name;
    }

    toOrderList(listValue) {
        this.$router.push({ path: 'user_order', query: { listValue: listValue } })
    }

    toLogin() {
        toLogin(this.$router, { toPath: 'userinfo' })
    }
    toShop() {
        toCMS('cms_home');
    }

    toRouter(path) {
        path && this.$router.push(path);
    }

    toApply() {
        this.$router.push('apply_shop_campaign');
    }

    initUser() {
        for (let i = 0; i < 4; i++) {
            this.orderList[i].num = '';
        }
        this.userLogin = false;
        this.hasShopError = true;
        // this.pointData[0].value = '-';
        // this.pointData[1].value = '-';
        this.user_img = '/static/images/pic-nologin.png';
        //this._shopCarCount.getShopcarGoodsesList();
    }

    logOff() {
        let _this = this;
        return new Promise((res, rej) => {
            let dialogObj = {
                title: '退出登录',
                content: '您正在退出登录！',
                type: 'info',
                assistBtn: '取消',
                mainBtn: '确认',
                assistFn() {
                    res(false);
                },
                mainFn() {
                    setUserValid();
                    _this.initUser();
                    res(true);
                }
            };
            _this.$store.state.$dialog({ dialogObj });
        });
    }

    imgError() {
        console.log(' ! ! ! ! ! ! ! ! ! ', 'user pic error ...');
        this.user_img = '/static/images/pic-login.png';
    }

    /**
     * 点击跳转到消息
     */
    toUserMsg() {
        this.$router.push({ path: 'message_notice' });
    }

}
