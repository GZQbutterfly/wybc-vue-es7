import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { debounce } from 'lodash';
import { isNotLogin, toLogin, appendParams, isWeiXin, getAuthUser } from 'common.env';

import NavRow from '../../../../commons/vue_plugins/components/nav_row/nav_row.vue';
import { IconsList } from './nav_scroll2/nav_scroll';
import { TopNotice } from '../../../sys/notice/top/top.notice';

import homeService from './home.service';

import './home.scss';

@Component({
    template: require('./home.html'),
    components: {
        'nav-row': NavRow,
        'iconsList': IconsList,
        'app-topnotice': TopNotice,
    }
})

export class Home extends BaseVue {
    //单次请求个数
    pageLimit = 5;
    //顶部店铺信息
    shopkeeper = {};
    //顶部banner
    homeAd = [];
    //小分类
    iconsList = [];
    //三格数据
    recommendations = [];
    //导航分类选项卡
    classfyList = [
        {
            classifyName: '学惠推荐',
            selectedImgUrl: '/static/images/newshop/tuijian_s.png',
            unselectedImgUrl: '/static/images/newshop/tuijian.png',
            goodsClassifyId: 0
        }
    ];
    //分类及商品数据
    classfyGoodses = [];
    //当前页数信息
    page = 0;
    //公告
    msgOpts = { list: [] };
    //顶部活动banner
    activeBanner = [];
    data() {
        return {

        }
    }
    mounted() {
        let self = this;
        self._$service = homeService(this.$store);
        this.$nextTick(() => {
            // return;
            self.ownShop();
            //初始化三格数据
            self.fetchRecommentData();
            //查询公告信息
            self.queryTopNotice();
            //banner
            self.homeBanner();
            //分类列表
            //self.classList();
        })
    }
    //判断进入的店是否是自己的
    ownShop() {
        let _self = this;
        let _query = this.$route.query.user;
        let flag = isNotLogin();
        if (flag && _query == 'own') {
            toLogin(_self.$router, { toPath: "home", realTo: "home?user=own" });
        }
    }
    fetchRecommentData() {
        let self = this;
        let _query = self.setShopId();
        this._$service.recommendations(_query).then(function (res) {
            if (res.data && res.data.data && res.data.data.length != 0) {
                self.recommendations = res.data.data;
            } else {
                self.recommendations = [];
            }
        });
    }

    updateShop() {
        let self = this;
        this.fetchShopData().then((res) => {
            let config = {
                title: res.wdName + ',超值特惠',
                desc: '一言不合买买买！~',
                imgUrl: 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_gs.jpg',
                link: appendParams({ shopId: res.infoId }).replace('user=own', '')
            }
            self.updateWxShare(config);
            self.shopkeeper = res;
        }).catch(error => {
            let dialog = self.$store.state.$dialog;
            let dialogObj = {
                title: '提示',
                content: '店铺不存在,立即去开店吧!',
                mainBtn: '确定',
                type: 'info',
                mainFn() {
                    self.$router.push({ path: "apply_shop_campaign" });
                }
            };
            self.$store.state.$dialog({ dialogObj });
        })
    }

    queryTopNotice() {
        // 公告
        this._$service.queryTopNotice().then((res) => {
            let _result = res.data;
            if (_result.errorCode) {
                return;
            }
            let _newList = [];
            for (let i = 0, len = _result.length; i < len; i++) {
                _newList.push({ img: '', msg: _result[i], flag: '' });
            }
            this.msgOpts.list = _newList;
        });
    }

    //修改店铺id
    setShopId(){
        let _query = this.$route.query.shopId;
        if (!_query) {
            let shopId = JSON.parse(localStorage.wdVipInfo).infoId;
            _query = shopId;
        }
        return _query;
    }
    //轮播
    homeBanner() {
        let self = this;
        let _query = self.setShopId();
        let _data = {
            shopId: _query,
            channel: 'wd',
            posId: 1
        }
        this._$service.homeAd(_data).then(res => {
            if (res.data.errorCode || !res.data || (res.data && res.data.data.length == 0)) {
                self.homeAd = [];
            } else {
                self.homeAd = [];
                res.data.data.forEach(item => {
                    item.url = item.imgUrl;
                    self.homeAd.push(item);
                })
            }
        })
    }

    //小图标分类
    inconsList() {
        let self = this;
        let _query = self.setShopId();
        this._$service.iconsList(_query).then(function (res) {
            if (res.data.data.length == 0 || res.data.errorCode) {
                self.iconsList = [];
            } else {
                self.iconsList = res.data.data;
            }
        });
    }

    //搜索页面
    goSearch() {
        this.$router.push({
            path: 'search',
            query: {
                origin: 'home'
            }
        });
    }

    //分类导航
    classListAndFirstPage(done) {
        let self = this;
        let _query = self.setShopId();
        this._$service.classfyList(_query).then(res => {
            self.classfyList = [
                {
                    classifyName: '学惠推荐',
                    selectedImgUrl: '/static/images/newshop/tuijian_s.png',
                    unselectedImgUrl: '/static/images/newshop/tuijian.png',
                    goodsClassifyId: 0
                }
            ]
            if (res.data && !res.data.errorCode) {
                res.data.data.forEach(element => {
                    self.classfyList.push(element);
                });
            }
            self.fetchGoodsData(1, done);
        })
    }

fetchGoodsData(page, done) {
    let self = this;
    let ids = '';
    if (page <= 1) {
        for (let i = 0; i < self.pageLimit; ++i) {
            if (this.classfyList.length > i + 1) {
                ids += '' + this.classfyList[i + 1].goodsClassifyId + ',';
            } else {
                break;
            }
        }
    } else {
        for (let i = 0; i < self.pageLimit; ++i) {
            if (this.classfyList.length > (page - 1) * self.pageLimit + 1 + i) {
                ids += '' + this.classfyList[(page - 1) * self.pageLimit + 1 + i].goodsClassifyId + ',';
            } else {
                break;
            }
        }
    }
    let _query = self.setShopId();
   let _data =  {
        classifyId: ids,
        channel: 'wd',
        shopId:_query
    }
    this._$service.classfyShop(_data).then(res => {
        if (res.data.errorCode || !res.data || res.data.data.length == 0) {
            if (page <= 1) {
                self.classfyGoodses = [];
            }
            if (done) {
                done(true);
            }
        } else {
            if (page <= 1) {
                res.data.data.forEach(element => {
                    element.adList.forEach(ads => {
                        ads.url = ads.imgUrl;
                    });
                });
                self.classfyGoodses = res.data.data;
                self.page = 1;
            } else {
                res.data.data.forEach(element => {
                    element.adList.forEach(element => {
                        element.url = element.imgUrl;
                    });
                    self.classfyGoodses.push(element);
                });
                self.page = page;
            }
            if (done) {
                done(true);
            }
        }
    })
        .catch((error) => {
            if (done) {
                done();
            }
        })
}

goodsBannerClicked(ad) {
    if (!ad.goodsId || ad.linkType == 1) {
        location.href = ad.linkTarget;
    } else {
        let url = location.href;
        if (url.indexOf('cms') == -1) {
            this.$router.push({
                path: "goods_detail",
                query: {
                    goodsId: ad.goodsId
                }
            });
        } else {
            this.$router.push({
                path: "cms_purchase_goods_detail",
                query: {
                    goodsId: ad.goodsId
                }
            });
        }
    }
}

navSelected(index, data) {
    this.$router.push({
        path: 'classify',
        query: {
            classify: data.goodsClassifyId
        }
    });
}

goPage(link, goodsId) {
    if (link) {
        location.href = link;
    } else {
        this.$router.push({
            path: 'goods_detail',
            query: {
                goodsId: goodsId
            }
        })
    }
}

refresh(done) {
    let self = this;
    setTimeout(() => {
        //初始化三格数据
        self.fetchRecommentData();
        //banner
        self.homeBanner();
        self.classListAndFirstPage(done);
        //活动banner
        self.activitBanner();
    }, 500)
}

onSeeAll(classifyId) {
    this.$router.push({
        path: "classify",
        query: {
            classify: classifyId
        }
    });
}

infinite(done) {
    let self = this;
    setTimeout(() => {
        //第一页数据交给初始化
        if (self.page == 0) {
            if (!self.classfyList || self.classfyList.length < 2) {
                done(false);
            } else {
                self.fetchGoodsData(1, done);
            }
        } else {
            if (!self.classfyList || self.classfyList.length < 2) {
                done(true);
            } else {
                self.fetchGoodsData(self.page + 1, done);
            }
        }
    }, 1)
}

activated() {
    document.title = "首页";
    let self = this;
    this.$nextTick(() => {
        self.updateShop();
        self.classListAndFirstPage(null);
        self.ownShop();
        //初始化三格数据
        self.fetchRecommentData();
        //banner
        self.homeBanner();
    })
}
}
