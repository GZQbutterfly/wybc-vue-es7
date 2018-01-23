import { Component} from 'vue-property-decorator';
import  BaseVue  from 'base.vue';
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
    _classfyList;
    homeAd = [];
    selfShopId;
    data() {
        return {
            // show: true
        };
    }
    mounted() {
        // 注册服务
        this._$service = classifyService(this.$store);
        //this.getClassifyMsg();
        this.$nextTick(() => {
            this._classfyList = this._$service.classfyList();
        });
    }

    activated() {
        document.title = "进货首页"
        // keep-alive 时 会执行activated
        let _this = this;
        this.$nextTick(() => {
            _this._classfyList.then((res) => {
                _this.getClassifyMsg(res);
            });
        })
    }
    refresh(done) {
        this.page = 1;
        let _this = this;
        let classify = this.$route.query.classify;
        _this.$refs._navScrollc.getQueryList(classify);
        setTimeout(() => {
            this._classfyList.then((res) => {
                this.getClassifyMsg(res);
            });
            done();
        }, 500)
    }
    infinite(done) {
        let _this = this;
        this.page++;
        console.log(this.page);
        setTimeout(() => {
            if (_this.page < 2) {
                _this.page = 2
            }
            let opt = {
                classifyId: this.$route.query.classify||this.classfyId[0],
                page: _this.page,
                limit: 4
            };
            this._$service.getClassfyGoodsList(opt).then(res => {
                console.log(res);
                if (res.data.msg || res.data.data.length == 0) {
                    done(true);
                    return;
                } else {
                    _this.changePrice(res.data.data);

                    done(false);
                }
            })

        }, 500)

    }
    classifyId = 0;
    getClassifyMsg(res) {
        let _this = this;
        let opt = {
            userId: this.$store.state.workVO.user.userId,
            token: this.$store.state.workVO.user.token
        }
        this._$service.getWdInfo(opt).then(shop => {
            //res.data.state =3;
            _this.selfShopId = shop.data.shopId;
            localStorage.selfShopId = shop.data.shopId;
            if (shop.data.state == 3 || shop.data.upWdInfo == 0) {
                _this.shopkeeper = {
                    wdName: "学惠精选官方商城",
                    wdImg: "/static/images/newshop/xuehui-fang.png",
                    vipGrade: shop.data.vip,
                    school: '',
                    id: 0
                }
                return;
            }
            this._$service.getUpWdInfo(shop.data.upWdInfo).then(res1 => {
                if (!res1.data.wdVipInfo.wdImg) {
                    res1.data.wdVipInfo.wdImg = "/static/images/newshop/touxiang.png"
                }
                _this.shopkeeper = {
                    wdName: res1.data.wdVipInfo.wdName,
                    wdImg: res1.data.wdVipInfo.wdImg,
                    vipGrade: res1.data.wdVipInfo.wdVipGrade,
                    school: res1.data.wdVipInfo.school,
                    id: 1
                }

            })
        })

        //首页banner
        _this._$service.homeAd().then(res => {
            if (res.data.errorCode || !res.data) {
                _this.homeAd = [];
                return;
            }
            _this.homeAd = [];
            res.data.data.forEach(item => {
                item.url = item.imgUrl;
                _this.homeAd.push(item);
            })
            console.log(_this.homeAd);
        })

        this.page = 1;
        let classify = _this.$route.query.classify;
        _this.classfyList = res.data.data;
        _this.classfyId = [];
        _this.classfyList.forEach(item => {
            _this.classfyId.push(item.goodsClassifyId);
        });
        if (classify) {
            _this.show = classify;
            _this._$service.getClassifyAdImg(parseInt(classify)).then(res => {
                console.log(res);
                if (res.data.data.length == 0 || !res.data.data) {
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
            let opt = {
                classifyId: classify,
                page: 1,
                limit: 10
            }
            this.classfyGoodsList = [];
            this._$service.getClassfyGoodsList(opt).then(res => {

                let _result = res.data;
                if (!_result.errorCode) {
                    if (_result.data.length == 0 || !_result.data) {
                        return;
                    }
                    _this.changePrice(_result.data);
                }
            })
        } else {
            _this.show = _this.classfyId[0];
            _this._$service.getClassifyAdImg(_this.classfyId[0]).then(res => {
                let classifyAd = [];
                if (res.data.data.length == 0 || !res.data.data) {
                    _this.bannerShow = false;
                    return;
                }
                _this.bannerShow = true;
                res.data.data.forEach(item => {
                    item.url = item.imgUrl;
                    classifyAd.push(item);
                })
                _this.classifyAdImgPic = classifyAd;
            });
            let opt = {
                classifyId: _this.classfyId[0],
                page: 1,
                limit: 10
            };
            _this.classfyGoodsList = [];
            this._$service.getClassfyGoodsList(opt).then(res => {
                _this.changePrice(res.data.data);
            })
        }

    }

    changeShop(e, classfyId) {
        this.page = 1;
        this.show = classfyId;
        let _this = this;
        _this._$service.getClassifyAdImg(classfyId).then(res => {
            if (res.data.errorCode) {
                return;
            }
            _this.classifyAdImgPic = [];
            if (res.data.data.length == 0) {
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
        })

        let opt = {
            classifyId: classfyId,
            page: 1,
            limit: 10
        }
        _this.classfyGoodsList = [];
        this._$service.getClassfyGoodsList(opt).then(res => {
            if (!res.data.errorCode) {
                _this.changePrice(res.data.data);
            }
        })

    }
    //修改价格
    changePrice(res, ) {
        if (res.length == 0 || !res) {
            return;
        }
        let shopId = this.selfShopId;
        let goodsIds = []; let opt = { infoId: shopId, listStr: "" };
        res.forEach(ele => {
            goodsIds.push(ele.goodsId)
        });
        opt.listStr = goodsIds.join(",");
        this._$service.getDiscountPrice(opt).then(discount => {
            for (let i = 0, len = res.length; i < len; i++) {
                for (let j = 0, lenj = discount.data.length; j < lenj; j++) {
                    if (i == j) {
                        res[i].moneyPrice =Math.ceil(res[i].moneyPrice * discount.data[j] / 100);
                        break;
                    }
                }
            }
            res.forEach(elem => {
                this.classfyGoodsList.push(elem);
            });
        })
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
