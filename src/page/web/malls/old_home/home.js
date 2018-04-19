import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { debounce, isArray } from 'lodash';
import { appendParams, timeout } from 'common.env';

import NavRow from '../../../../commons/vue_plugins/components/nav_row/nav_row.vue';
import { IconsList } from './nav_scroll2/nav_scroll';
import { TopNotice } from '../../../sys/notice/top/top.notice';
import { GoodsList } from '../goods_list/goods_list';
import { MoneyTimeLimitBanner } from '../money/timelimit/banner/banner';

import finishToCar from "./finishToCar";


import homeService from './home.service';
import homeController from './home.controller';

import './home.scss';

@Component({
    template: require('./home.html'),
    components: {
        'nav-row': NavRow,
        'iconsList': IconsList,
        'app-topnotice': TopNotice,
        "list-goods": GoodsList,
        'timelimit-banner': MoneyTimeLimitBanner
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
    shopId = '';
    data() {
        return {
        }
    }
    mounted() {
        let _self = this;
        _self._$service = homeService(this.$store);
        this.$nextTick(() => {
            //初始化三格数据
            _self.fetchRecommentData();
            //查询公告信息
            _self.queryTopNotice();
            //banner
            _self.homeBanner();
            //分类列表
            //_self.classList();
            //小图标导航
            _self.inconsList();
        })
    }

    async fetchRecommentData() {
        let _self = this;
        let _query = await _self.getShopId();
        this._$service.recommendations(_query).then(function (res) {
            if (res.data && res.data.data && res.data.data.length != 0) {
                _self.recommendations = res.data.data;
            } else {
                _self.recommendations = [];
            }
        });
    }

    updateShop() {
        let _self = this;
        this.fetchShopData().then((res) => {
            let config = {
                title: res.wdName + ',超值特惠',
                desc: '一言不合买买买！~',
                imgUrl: 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_gs.jpg',
                link: appendParams({ shopId: res.infoId }).replace('user=own', '')
            }
            _self.updateWxShare(config);

            // 首页礼包业务逻辑处理
            homeController.init(_self);
            // _self.shopkeeper = res;
        }).catch(error => {
            let dialog = _self.$store.state.$dialog;
            let dialogObj = {
                title: '提示',
                content: '店铺不存在,立即去开店吧!',
                mainBtn: '确定',
                type: 'info',
                mainFn() {
                    _self.$router.push({ path: "apply_shop_campaign" });
                }
            };
            _self.$store.state.$dialog({ dialogObj });
        })
    }

    queryTopNotice() {
        let _self = this;
        timeout(() => {
            // 公告
            _self._$service.queryTopNotice().then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return;
                }
                let _newList = [];
                for (let i = 0, len = _result.length; i < len; i++) {
                    _newList.push({ img: '', msg: _result[i], flag: '' });
                }
                _self.msgOpts.list = _newList;
            });
        }, 1000);
    }

    //修改店铺id
    async getShopId() {
        if (!this.shopId) {
            let _query = this.$route.query.shopId;
            if (!_query) {
                let shopId = (await this.$store.dispatch('CHECK_WD_INFO')).infoId;
                _query = shopId;
            }
            if (isArray(_query)) {
                _query = _query[0];
            }
            this.shopId = _query;
        }
        return this.shopId;
    }

    //轮播
    async homeBanner() {
        let _self = this;
        let _query = await _self.getShopId();
        let _data = {
            shopId: _query,
            channel: 'wd',
            posId: 1
        }
        this._$service.homeAd(_data).then(res => {
            if (res.data.errorCode || !res.data || (res.data && res.data.data.length == 0)) {
                _self.homeAd = [];
            } else {
                _self.homeAd = [];
                res.data.data.forEach(item => {
                    item.url = item.imgUrl;
                    _self.homeAd.push(item);
                })
            }
        })
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
    async classListAndFirstPage(done) {
        let _self = this;
        let _query = await _self.getShopId();
        this._$service.classfyList(_query).then(res => {
            _self.classfyList = [
                {
                    classifyName: '学惠推荐',
                    selectedImgUrl: '/static/images/newshop/tuijian_s.png',
                    unselectedImgUrl: '/static/images/newshop/tuijian.png',
                    goodsClassifyId: 0
                }
            ];
            if (res.data && !res.data.errorCode) {
                res.data.data.forEach(element => {
                    _self.classfyList.push(element);
                });
            }
            _self.fetchGoodsData(1, done);
        });
    }

    //小图标分类
    async inconsList() {
        let _self = this;
        let _query = await _self.getShopId();
        this._$service.iconsList(_query).then(function (res) {
            if (res.data.data.length == 0 || res.data.errorCode) {
                _self.iconsList = [];
            } else {
                _self.iconsList = res.data.data;
            }
        });
    }

    async fetchGoodsData(page, done) {
        let _self = this;
        let ids = '';
        let _classIdsLen = this.classfyList.length;
        if (page <= 1) {
            for (let i = 0; i < _self.pageLimit; ++i) {
                if (_classIdsLen > i + 1) {
                    ids += '' + this.classfyList[i + 1].goodsClassifyId + ',';
                } else {
                    break;
                }
            }
        } else {
            for (let i = 0; i < _self.pageLimit; ++i) {
                let _idex = (page - 1) * _self.pageLimit + 1 + i;
                if (_classIdsLen > _idex) {
                    ids += '' + this.classfyList[_idex].goodsClassifyId + ',';
                } else {
                    break;
                }
            }
        }
        let _query = await _self.getShopId();
        let _data = {
            classifyId: ids,
            channel: 'wd',
            shopId: _query
        };
        if (!ids) {
            console.log('分类id不存在时，不请求后台');
            done(true);
            return;
        }
        this._$service.classfyShop(_data).then(res => {
            let _result = res.data;
            if (_result.errorCode || !_result || _result.data.length == 0) {
                if (page <= 1) {
                    _self.classfyGoodses = [];
                }
            } else {
                _result.data.forEach(element => {
                    element.adList.forEach(ads => {
                        ads.url = ads.imgUrl;
                    });
                });
                if (page <= 1) {
                    _self.classfyGoodses = _result.data;
                    _self.page = 1;
                } else {
                    _self.classfyGoodses.push(..._result.data);
                    _self.page = page;
                }
            }
            done && done(true);
        }).catch((error) => {
            done && done(true);
        })
    }

    navSelected(index, data) {
        this.$router.push({
            path: 'classify',
            query: {
                classify: data.goodsClassifyId
            }
        });
    }

    goPage(item, index) {
        let link = item.linkTarget,
            goodsId = item.goodsId;
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
        let _self = this;
        setTimeout(() => {
            //初始化三格数据
            _self.fetchRecommentData();
            //banner
            _self.homeBanner();
            // _self.classListAndFirstPage(done);
            _self.inconsList();
            // 刷新 限时购banner 
            _self.$refs.timelimitRef.reInit();
            done(true);
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

    joinCar(item) {
        finishToCar(this.$store).finishToCar(this, item, "home");
    }

    infinite(done) {
        let _self = this;
        setTimeout(() => {
            //第一页数据交给初始化
            if (_self.page == 0) {
                if (!_self.classfyList || _self.classfyList.length < 2) {
                    done(false);
                } else {
                    _self.fetchGoodsData(1, done);
                }
            } else {
                if (!_self.classfyList || _self.classfyList.length < 2) {
                    done(true);
                } else {
                    _self.fetchGoodsData(_self.page + 1, done);
                }
            }
        }, 1);
    }

    activated() {
        document.title = "首页";
        let _self = this;
        this.$nextTick(() => {
            _self.updateShop();
            _self.classListAndFirstPage(null);
        });
    }
}
