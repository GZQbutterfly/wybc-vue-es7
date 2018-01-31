import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import './classify.scss';
import classifyService from './classify.service';
import { isNotLogin, toLogin } from 'common.env';
import { NavScrollc } from "./navScroll/navScroll.component";
import { locale } from 'core-js/library/web/timers';

@Component({
    template: require('./classify.html'),
    components: {
        'navScrollc': NavScrollc
    }
})
export class CmsPurchaseClassify extends BaseVue {
    // 组件方法也可以直接声明为实例的方法
    lists = [];
    show = 1;
    classfyList = [];
    classfyId = [];
    classfyGoodsList = [];
    _$service;
    classifyAdImgPic = [];
    config = {};
    bb = [];
    page = 1;
    bannerShow = true;
    headImg = '/static/images/pic-nologin.png';
    shopkeeper = {};
    //private _getShopCarCount;
    homeAd = [];
    data() {
        return {
            // show: true
        };
    }
    mounted() {
        // 注册服务
        this._$service = classifyService(this.$store);
        this.$nextTick(() => {
            this.initPage();
            this._$service.classfyList().then((res) => {
                this.getClassifyMsg(res);
            });
        });
    }

    activated() {
        document.title = "进货首页"
        // keep-alive 时 会执行activated
        let _self = this;
        _self.flag = true;
        this.$nextTick(() => {
            // _self._$service.classfyList().then((res) => {
            //     _self.getClassifyMsg(res);
            // });
            this.queryGoodsList();
        })
    }
    initPage() {
        let _self = this;

        let _user = this.$store.state.workVO.user;

        let opt = {
            userId: _user.userId,
            token: _user.token
        };

        // 店铺信息
        _self._$service.getWdInfo(opt).then(shop => {
            //res.data.state =3;
            if (shop.data.state == 3 || shop.data.upWdInfo == 0) {
                _self.shopkeeper = {
                    wdName: "学惠精选官方商城",
                    wdImg: "/static/images/newshop/xuehui-fang.png",
                    vipGrade: shop.data.vip,
                    school: '',
                    id: 0
                }
                return;
            }
            this._$service.getUpWdInfo(shop.data.upWdInfo).then(res1 => {
                let _wdVipInfo = res1.data.wdVipInfo;
                if (!_wdVipInfo.wdImg) {
                    _wdVipInfo.wdImg = "/static/images/newshop/touxiang.png"
                }
                _self.shopkeeper = {
                    wdName: _wdVipInfo.wdName,
                    wdImg: _wdVipInfo.wdImg,
                    vipGrade: _wdVipInfo.wdVipGrade,
                    school: _wdVipInfo.school,
                    id: 1
                };
            })
        })

        //首页banner
        _self._$service.homeAd().then(res => {
            let _result = res.data;
            if (_result.errorCode || !_result.data.length) {
                _self.homeAd = [];
                return;
            }
            _result.data.forEach(item => {
                item.url = item.imgUrl;
            });
            _self.homeAd = _result.data;
            console.log(_self.homeAd);
        })

    }
    refresh(done) {
        this.page = 1;
        let _self = this;
        let classify = this.$route.query.classify;
        _self.$refs._navScrollc.getQueryList(classify);
        let _classfyList = this._$service.classfyList();
        setTimeout(() => {
            _classfyList.then((res) => {
                this.getClassifyMsg(res);
            });
            done();
        }, 500)
    }
    infinite(done) {
        let _self = this;
        this.page++;
        setTimeout(() => {
            if (_self.page < 2) {
                _self.page = 2
            }
            let opt = {
                classifyId: _self.show,
                page: _self.page,
                limit: 8
            };
            this._$service.getClassfyGoodsList(opt).then(res => {
                console.log(res);
                if (res.data.errorCode || res.data.data.length == 0) {
                    done(true);
                } else {
                    _self.changePrice(res.data.data);
                    done(false);
                }
            })

        }, 500)

    }
    classifyId = 0;
    getClassifyMsg(res) {
        let _self = this;
        this.page = 1;
        
        if (!res.data || res.data.errorCode || res.data.data.length == 0) {
            _self.classfyGoodsList = [];
            _self.classifyAdImgPic = [];
            return;
        }
        _self.classfyList = res.data.data;
        _self.classfyId = [];
        _self.classfyList.forEach(item => {
            _self.classfyId.push(item.goodsClassifyId);
        });
        
        _self.show = _self.getClassifyId();
        //  分类列表
        _self._$service.getClassifyAdImg(_self.show).then(res => {
            let classifyAd = [];
            if (!res.data || res.data.errorCode || (res.data.data && res.data.data.length == 0)) {
                _self.bannerShow = false;
                return;
            }
            _self.bannerShow = true;
            res.data.data.forEach(item => {
                item.url = item.imgUrl;
                classifyAd.push(item);
            })
            _self.classifyAdImgPic = classifyAd;
        });
        this.queryGoodsList(_self.show);
    }

    getClassifyId() {
        let _self = this;
        let classifyId = 1;
        let classify = _self.$route.query.classify;
        if (classify) {
            let findClass = false;
            for (let i = 0, len = _self.classfyList.length; i < len; i++) {
                if (classify == _self.classfyList[i].goodsClassifyId) {
                    findClass = true;
                    break;
                }
            }
            if (findClass) {
                classifyId = classify;
            } else {
                classifyId = _self.classfyList[0].goodsClassifyId;
            }
            classifyId = parseInt(classifyId);
        } else {
            classifyId = _self.classfyId[0];
        }
        return classifyId;
    }

    queryGoodsList(classifyId) {
        let _self = this;
        if (!classifyId) {
            classifyId = _self.getClassifyId();
        }
        let opt = {
            classifyId: classifyId,
            page: 1,
            limit: 10
        };
        // 商品列表
        this._$service.getClassfyGoodsList(opt).then(res => {
            if (res.data.errorCode) {
                return;
            }
            _self.changePrice(res.data.data, true);
        });
    }

    changeShop(e, classfyId) {
        this.page = 1;
        this.show = classfyId;
        let _self = this;
        _self._$service.getClassifyAdImg(classfyId).then(res => {
            if (res.data.errorCode || !res.data || res.data.data.length == 0) {
                _self.bannerShow = false;
                return;
            }
            _self.bannerShow = true;
            let classifyAd = [];

            res.data.data.forEach(item => {
                item.url = item.imgUrl;
                classifyAd.push(item);
            })
            _self.classifyAdImgPic = classifyAd;
        })

        let opt = {
            classifyId: classfyId,
            page: 1,
            limit: 10
        }
        //_self.classfyGoodsList = [];
        this._$service.getClassfyGoodsList(opt).then(res => {
            if (!res.data.errorCode) {
                _self.changePrice(res.data.data, true);
            }
        })

    }
    //修改价格
    changePrice(res, resListFlag) {
        if (res.length == 0 || !res) {
            return;
        }
        let _self = this;
        let shopId = this.$store.state.workVO.user.userId;
        let goodsIds = [];
        let opt = { infoId: shopId, listStr: "" };
        res.forEach(ele => {
            goodsIds.push(ele.goodsId)
        });
        opt.listStr = goodsIds.join(",");
        this._$service.getDiscountPrice(opt).then(discount => {
            for (let i = 0, len = res.length; i < len; i++) {
                for (let j = 0, lenj = discount.data.length; j < lenj; j++) {
                    if (i == j) {
                        res[i].moneyPrice = Math.ceil(res[i].moneyPrice * discount.data[j] / 100);
                        break;
                    }
                }
            }
            resListFlag ? (this.classfyGoodsList = res) : this.classfyGoodsList.push(...res);
        });
    }

    //跳转搜索页面
    goSearch() {
        let typeId = this.show ? '?classify=' + this.show : '';
        this.$router.push({ path: "cms_purchase_search", query: { origin: 'cms_purchase_classify' + typeId } });
    }

    goLogin() {
        let flag = isNotLogin();
        if (flag) {
            toLogin(this.$router, { toPath: 'cms_purchase_userinfo', realTo: "cms_purchase_classify" })
        } else {
            this.$router.push({ path: "cms_purchase_userinfo" });
        }
    }
}
