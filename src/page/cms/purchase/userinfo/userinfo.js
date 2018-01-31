import { Component} from 'vue-property-decorator';
import  BaseVue from 'base.vue';
import { isNotLogin, toLogin, loginDialog, setUserValid, getAuthUser, isWeiXin, toWEB, pageNotAccess } from 'common.env';
import userInfoService from './userinfo.service';
import './userinfo.scss';

@Component({
    template: require('./userinfo.html')
})

export class CmsPurchaseUserinfo extends BaseVue {
    userInfo = {};
    userScore = {};
    userLogin = false;
    orderList = [];
     _$service;
    user_img = '/static/images/pic-nologin.png';
    hasShop = false;
    userMsgNumb = 6;

    mounted() {
        this._$service = userInfoService(this.$store);
        let _self = this;

        this.$nextTick(() => {
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
                this.orderList[0].num = _result[1];
                this.orderList[1].num = _result[2] + _result[3];
                this.orderList[2].num = _result[4];
                this.orderList[3].num = '';
            })
        }
    }

    activated() {
        document.title = "我的";
        this.$nextTick(() => {
            this.userinfoInit();
        });
    }

    getUserName(name) {
        return name.length > 6 ? name.substring(0, 6) + '...' : name;
    }

    toOrderList(listValue) {
        this.$router.push({ path: 'cms_stock_order', query: { listValue: listValue } })
    }

    toShop() {
        this.$router.push('cms_purchase');
    }

    toHome() {
        this.$router.push('cms_home');
    }

    toInventoryList(){
        this.$router.push('my_inventory_list');
    }
    toUserAddress(){
        this.$router.push('cms_user_address');
    }

    initUser() {
        for (let i = 0; i < 4; i++) {
            this.orderList[i].num = '';
        }
        this.userLogin = false;
        this.user_img = '/static/images/pic-nologin.png';
    }

    imgError() {
        console.log(' ! ! ! ! ! ! ! ! ! ', 'user pic error ...');
        this.user_img = '/static/images/pic-login.png';
    }
    
}
