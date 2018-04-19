import { Component, Prop } from 'vue-property-decorator';
import Vue from 'vue';
import { getLocalUserInfo, setLocalUserInfo, setCacheLoginFlag, cacheLogin } from 'common.env';



import loginService from '../login.service';
import './login.cache.scss';
// ==> 缓存登录
@Component({
    template: require('./login.cache.html')
})
export class CacheLogin extends Vue {

    @Prop({ type: Function, default: () => { } })
    toLogin;
    wecat = {};
    noLoginImg = '/static/images/pic-nologin.png'
    headimgurl = '/static/images/pic-nologin.png';
    _$service;
    mounted() {
        this._$service = loginService(this.$store);
        this.$nextTick(() => {
            this.wecat = getLocalUserInfo();
            this.setHeadimg();
        });
    }
    /**
     * 缓存登录
     */
    doOk() {
        setCacheLoginFlag();
        cacheLogin();
        
        let localWdInfo = sessionStorage.wdVipInfo ? JSON.parse(sessionStorage.wdVipInfo) : {};
        if (localWdInfo.infoId != null) {
            this._$service.addShopHistory({shopId:localWdInfo.infoId});
        }
        this.$router.push({path:'login_back', query: this.$route.query});
    }
    setUser(user) {
        setLocalUserInfo(user);
        this.$store.state.workVO.user = user;
    }
    setHeadimg() {
        let _self = this;
        let _headimgurl = _self.wecat.headimgurl;
        _self.headimgurl = _headimgurl ? _headimgurl : this.noLoginImg;
    }
    imgError(e) {
        e.target.src = this.noLoginImg;
    }
}
