import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import getShopCarCount from '../home/getShopCarCount';
import { isNotLogin, toLogin, appendParams } from 'common.env';
import { NavScrollc } from './navScroll/navScroll';



import classifyService from './classify.service';
import './classify.scss';
@Component({
    template: require('./classify.html'),
    components: {
        'navScrollc': NavScrollc
    }
})
export class Classify extends BaseVue {
    // 组件方法也可以直接声明为实例的方法
    show = 1;
    classfyList = [];
    classfyId = [];
    classfyGoodsList = [];

    classifyAdImgPic = [];
    config = {};
    bb = [];
    page = 1;
    bannerShow = true;
    headImg = '/static/images/pic-nologin.png';
    noflag = true;
    shopkeeper = {};
    //private _getShopCarCount;
    _$service;
    data() {
        return {
            // show: true
        };
    }
    mounted() {
        // 注册服务

        this._$service = classifyService(this.$store);
        let _this = this;
        //this.getClassifyMsg();
        this.$nextTick(() => {
            this.queryWdInfo();
        });
    }

    activated() {
        document.title = "分类";
        // keep-alive 时 会执行activated
        this.$nextTick(() => {
            let _this = this;
            this._$service.classfyList().then((res) => {
                _this.getClassifyMsg(res);
            });
        });
        let _this = this;
        this.fetchShopData()
            .then((res) => {
                let config = {
                    title: res.wdName + ',超值特惠',
                    desc: '一言不合买买买！~',
                    imgUrl: 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_gs.jpg',
                    link: appendParams({ shopId: res.infoId }).replace('user=own', '')
                }
                _this.updateWxShare(config);
            });
    }
    getClassifyMsg(res) {
        let _this = this;
        //_this.classfyGoodsList = [];
        this.page = 1;
        let classify = this.$route.query.classify;
        _this.classfyList = res.data.data;
        _this.classfyId = [];

        _this.classfyList.forEach(item => {
            _this.classfyId.push(item.goodsClassifyId);
        });
        if (classify) {
            let findClass = false;
            for (let i = 0, len = _this.classfyList.length; i < len; i++) {
                if (classify == _this.classfyList[i].goodsClassifyId) {
                    findClass = true;
                    break;
                }
            }
            if (findClass) {
                _this.show = classify;
            } else {
                _this.show = _this.classfyList[0].goodsClassifyId;
            }
            _this.getImgs(_this.show);
        } else {
            _this.show = _this.classfyId[0];
            _this.getImgs(_this.classfyId[0]);
        }
    }
    queryWdInfo() {
        let shopId = this.$route.query.shopId;
        let wdInfo = JSON.parse(localStorage.wdVipInfo);
        if (!shopId) {
            shopId = wdInfo.infoId;
        }
        this._$service.queryWdInfo(shopId).then((res) => {//获取店信息
            let _result = res.data;
            if (!_result.errorCode) {
                let _wdVipInfo = _result.wdVipInfo;
                if (!_wdVipInfo.wdImg) {
                    _wdVipInfo.wdImg = "/static/images/newshop/touxiang.png"
                }
                this.shopkeeper = {
                    wdName: _wdVipInfo.wdName,
                    wdImg: _wdVipInfo.wdImg,
                    vipGrade: _wdVipInfo.wdVipGrade,
                    school: _wdVipInfo.school,
                }
            }

        })
    }
    refresh(done) {
        this.page = 1;
        let _this = this;
        this.$refs._navScrollc.queryClassifyList();
        setTimeout(() => {
            this._$service.classfyList().then((res) => {
                _this.getClassifyMsg(res);
                done();
            });
        }, 500)
    }
    infinite(done) {
        if (this.noflag) {
            done(false);
            return;
        }
        let _this = this;
        _this.page++;
        console.log(this.page);
        setTimeout(() => {
            if (_this.page < 2) {
                _this.page = 2
            }
            let opt = {
                classifyId: _this.show,
                page: _this.page,
                limit: 10
            };
            this._$service.getClassfyGoodsList(opt).then(res => {
                console.log(res);
                if (res.data.msg || !res.data.data || res.data.data.length == 0) {
                    done(true);
                    return;
                } else {
                    res.data.data.forEach(item => {
                        _this.classfyGoodsList.push(item);
                    });
                    _this.noflag = false;
                    done(false);
                }
            });
        }, 500);
    }

    getImgs(classify) {
        let _this = this;
        _this._$service.getClassifyAdImg(parseInt(classify)).then(res => {
            _this.classifyAdImgPic = [];
            console.log(res);
            if (res.data.errorCode || !res.data.data || res.data.data.length == 0) {
                _this.bannerShow = false;
                return;
            }
            _this.bannerShow = true;
            let classifyAd = [];
            res.data.data.forEach(item => {
                item.url = item.imgUrl;
                classifyAd.push(item);
            })
            _this.classifyAdImgPic = classifyAd;

        });
        let wdInfo = JSON.parse(localStorage.wdVipInfo);
        let opt = {
            classifyId: classify,
            page: 1,
            limit: 10,
            shopId: wdInfo.infoId
        };
        this._$service.getClassfyGoodsList(opt).then(res => {
            _this.classfyGoodsList = [];
            if (!res.data.errorCode) {
                _this.classfyGoodsList = res.data.data;
                _this.noflag = false;
            }
        })
    }
    changeShop(classfyId) {
        this.page = 1;
        this.show = classfyId;
        let _this = this;
        _this.getImgs(classfyId);

        this.fetchShopData()
            .then((res) => {
                let config = {
                    title: res.wdName + ',超值特惠',
                    desc: '一言不合买买买！~',
                    imgUrl: 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_gs.jpg',
                    link: appendParams({ shopId: res.infoId }).replace('user=own', '')
                }
                _this.updateWxShare(config);
            });
    }
    //跳转搜索页面
    goSearch() {
        let typeId = this.show ? '?classify=' + this.show : '';
        this.$router.push({ path: "search", query: { origin: 'classify' + typeId } });
    }
}
