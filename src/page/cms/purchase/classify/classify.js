import { Component, Watch } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import './classify.scss';
import classifyService from './classify.service';
import { isNotLogin, toLogin, timeout } from 'common.env';
import { NavScrollc } from "./navScroll/navScroll.component";
import { locale } from 'core-js/library/web/timers';

@Component({
    template: require('./classify.html'),
    components: {
        'navScrollc': NavScrollc
    }
})
export class CmsPurchaseClassify extends BaseVue {
    _$service;
    homeAd = [];                          //首页广告
    classifyNav = [];                     //分类导航
    classfyGoodsListsArr = [];            //分类商品列表数组 
    classifyAdImgPicsArr = [];            //分类广告数组
    classfyGoodsList = [];                //分类商品列表 
    classifyAdImgPic = [];                //分类广告
    pagesArr = [];                        //分页数组
    currentClassifyId = '';               //当前显示的分类id
    currentIndex = 0;                     //当前索引 
    firstLoad = true;                     //是否首次加载
    pageOp = {
        page: 0,
        total: 0
    }
    shopkeeper = {
        wdName: "学惠精选官方商城",
        wdImg: "/static/images/newshop/xuehui-fang.png",
        id: 0
    }
    mounted() {
        this._$service = classifyService(this.$store);
        this.initData();
        this.$nextTick(async () => {
            await this.queryHomeAd();
            // await this.queryClassifyNav();
            // await this.queryClassifyAd(this.currentClassifyId, this.currentIndex);
            // await this.fetchGoodsData(this.currentClassifyId, this.currentIndex, 1, null);
        })
    }

    data() {
        return {};
    }

    activated() {
        document.title = "进货首页";
        let _self = this;
        this.$nextTick(async () => {
            // if (!_self.firstLoad) {
            _self.initData();
            await _self.queryClassifyNav();
            await _self.queryClassifyAd(_self.currentClassifyId, _self.currentIndex);
            await _self.fetchGoodsData(_self.currentClassifyId, _self.currentIndex, 1, null);
            // }
        })
    }
    refresh(done) {
        let _self = this;
        let _result = _self.isClassifyId(_self.currentClassifyId);
        setTimeout(() => {
            _result.then(async (flag) => {
                let _result = null;
                if (flag) {
                    await _self.queryClassifyAd(_self.currentClassifyId, _self.currentIndex);
                    _result = _self.fetchGoodsData(_self.currentClassifyId, _self.currentIndex, 1);
                } else {
                    _self.initData();
                    await _self.queryClassifyNav();
                    await _self.queryClassifyAd(_self.currentClassifyId, _self.currentIndex);
                    _result = _self.fetchGoodsData(_self.currentClassifyId, _self.currentIndex, 1);
                }
                _result.then((flag) => {
                    done(flag);
                });
            });
        }, 500);
    }
    infinite(done) {
        if (this.firstLoad) {
            done(true);
            return;
        }
        let _result = this.fetchGoodsData(this.currentClassifyId, this.currentIndex, this.pagesArr[this.currentIndex] + 1, false);
        setTimeout(() => {
            _result.then((flag) => {
                done(flag);
            });
        }, 500);

    }
    /**
     * 上啦刷新当前页分类数据
     */
    initData() {
        this.classifyNav = [];
        this.classfyGoodsListsArr = [];
        this.classifyAdImgPicsArr = [];
        this.pagesArr = [];
        this.firstLoad = true;
    }
    /**
     * 初始化创建数组和页码
     */
    initPage(classifyLists) {
        for (let i = 0, len = classifyLists.length; i < len; i++) {
            let arr = new Array;
            this.pagesArr.push(0);
            this.classfyGoodsListsArr.push(arr);
            this.classifyAdImgPicsArr.push(arr);
        }
    }

    /**
    * 判断分类是否有效
    */
    async isClassifyId(classifyId) {
        let _classify = (await this._$service.classfyList()).data;
        let flag = false;
        for (let i = 0, len = _classify.data.length; i < len; i++) {
            if (_classify.data[i].goodsClassifyId == classifyId) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            this.classifyNav = _classify.data;
        }
        return flag;
    }
    /**
    * 设置当前显示分类的id
    */
    setCurrentClassifyId(classifyNav) {
        let _classify = this.$route.query.classify;
        if (_classify) {
            this.currentIndex = classifyNav.findIndex((v, i) => {
                if (v.goodsClassifyId == _classify) {
                    return i;
                }
            });
            if (this.currentIndex == -1) {
                _classify = classifyNav[0].goodsClassifyId;
                this.currentIndex = 0;
            }
            this.currentClassifyId = _classify;
        } else {
            this.currentClassifyId = classifyNav[0].goodsClassifyId;
            this.currentIndex = 0;
        }
    }
    /**
     * 首页广告
     */
    queryHomeAd() {
        let _self = this;
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
        });
    }
    /**
     * 查询分类导航列表and初始化数组
     */
    async queryClassifyNav(firstLoad = true) {
        let _classify = (await this._$service.classfyList()).data;
        if (!_classify || _classify.errorCode || _classify.data.length == 0) {
            this.classfyGoodsList = [];
            this.classifyAdImgPic = [];
            return;
        }
        this.classifyNav = _classify.data;
        // if (firstLoad) {
        //     this.currentClassifyId = _classify.data[0].goodsClassifyId;
        // }
        this.setCurrentClassifyId(this.classifyNav);
        this.initPage(this.classifyNav);
    }
    /**
     * 分类广告
     */
    async queryClassifyAd(classifyId, i) {
        let _classifyAd = (await this._$service.getClassifyAdImg(classifyId)).data;
        if (!_classifyAd || _classifyAd.errorCode || (_classifyAd.data && _classifyAd.data.length == 0)) {
            this.classifyAdImgPic = [];
            return;
        }
        _classifyAd.data.forEach(item => {
            item.url = item.imgUrl;
        })
        this.$set(this.classifyAdImgPicsArr, i, _classifyAd.data);
        this.classifyAdImgPic = this.classifyAdImgPicsArr[i];
    }
    /**
    * 加载商品数据
    */
    async fetchGoodsData(classifyId, i, page, loadFlag = true) {
        let _limit = 10;
        let opt = {
            classifyId: classifyId,
            page: page,
            limit: _limit
        };
        this.pagesArr[i] = page;
        let _goodsList = (await this._$service.getClassfyGoodsList(opt)).data;
        if (_goodsList.errorCode) {
            return true;
        }
        // ==> 修复加载时 分页页数异常
        let len = _goodsList.data.length;
        if (len < 1) {
            page--;
        }
        page = page < 1 ? 1 : page;
        this.pagesArr[i] = page;
        if (loadFlag) {
            if (len == 0) {
                this.$set(this.classfyGoodsListsArr, i, []);
                this.classfyGoodsList = [];
            } else {
                this.$set(this.classfyGoodsListsArr, i, _goodsList.data);
                this.classfyGoodsList = this.classfyGoodsListsArr[i];
                this.firstLoad = false;
            }
        } else {
            if (len == 0) {
                this.$set(this.classfyGoodsListsArr, i, this.classfyGoodsListsArr[i].concat(_goodsList.data));
                this.classfyGoodsList = this.classfyGoodsListsArr[i];
                this.firstLoad = false;
                return true;
            }
            this.$set(this.classfyGoodsListsArr, i, this.classfyGoodsListsArr[i].concat(_goodsList.data));
            this.classfyGoodsList = this.classfyGoodsListsArr[i];
            this.firstLoad = false;
        }
        this.setPage();
        return false;
    }
    /**
     * 修改商品价格
     */
    async changeGoodsPrice(goodsList) {
        let shopId = this.$store.state.workVO.user.userId;
        let goodsIds = [];
        let opt = { infoId: shopId, listStr: "" };
        goodsList.forEach(ele => {
            goodsIds.push(ele.goodsId)
        });
        opt.listStr = goodsIds.join(",");
        let _discount = (await this._$service.getDiscountPrice(opt)).data;
        for (let i = 0, len = goodsList.length; i < len; i++) {
            for (let j = 0, lenj = _discount.length; j < lenj; j++) {
                if (i == j) {
                    goodsList[i].moneyPrice = Math.ceil(goodsList[i].moneyPrice * _discount[j] / 100);
                    break;
                }
            }
        }
        return goodsList;
    }
    async setCurrentPageData(id, index) {
        if (this.classifyAdImgPicsArr[index].length == 0) {
            await this.queryClassifyAd(id, index);
        } else {
            this.classifyAdImgPic = this.classifyAdImgPicsArr[index];
        }
        if (this.classfyGoodsListsArr[index].length == 0) {
            this.firstLoad = true;
            await this.fetchGoodsData(this.currentClassifyId, this.currentIndex, 1, null);
        } else {
            this.classfyGoodsList = this.classfyGoodsListsArr[index];
        }
    }
    /**
     * 切换导航修改数据
     */
    async setGoodsLists(id, index) {
        this.currentClassifyId = id;
        this.currentIndex = index;
        let _self = this;
        console.log("导航下标:", index, "分类id:", id);
        this.$router.replace({ path: "cms_purchase_classify", query: { classify: id } });
        let flag = await this.isClassifyId(id, index);
        if (flag) { //更新数据
            await this.setCurrentPageData(id, index);
        } else {
            _self.initData();
            await _self.queryClassifyNav();
            await _self.queryClassifyAd(_self.currentClassifyId, _self.currentIndex);
            await _self.fetchGoodsData(_self.currentClassifyId, _self.currentIndex, 1, null);
        }
        this.setPage();
    }

    setPage() {
        this.pageOp.page = this.pagesArr[this.currentIndex];
        this.pageOp.total = Math.ceil(this.classfyGoodsList.length / 4);
    }
    /**
     * 跳转搜索页面
     */
    goSearch() {
        let typeId = this.currentClassifyId ? '?classify=' + this.currentClassifyId : '';
        this.$router.push({ path: "cms_purchase_search", query: { origin: 'cms_purchase_classify' + typeId } });
    }

    QuicklyJoinTheShoppingCart(item) {
        event.stopPropagation();
        let _self = this;
        let opt = {
            goodsId: item.goodsId,
            number: 1
        }
        this._$service.addGoods(opt).then(res => {
            if (res.data.errorCode) {
                let _toast = _self.$store.state.$toast;
                _toast({ title: res.data.msg, success: false });
                return;
            }
            let _toast = _self.$store.state.$toast;
            _toast({ title: '加入进货单成功' });
            _self.$store.state.shopCar.count += 1;
        })

    }

    toDetail(goodsId) {
        this.$router.push({ path: "cms_purchase_goods_detail", query: { goodsId: goodsId } })
    }

    itemHeight = 0;
    _homeHeight = 0;
    monitoringMoveFn(offset) {
        let _top = offset.top;
        if (_top) {
            let _bannerHeight = 0;
            let _bannerRef = this.$refs.bannerRef;
            if (_bannerRef) {
                _bannerHeight = _bannerRef.offsetHeight;
            }
            let _h = this._homeHeight || (this._homeHeight = this.$refs.homeContentRef.offsetHeight - 60);
            let _diffTop = (_top - _bannerHeight);
            if (!this.itemHeight) {
                let _goodsDom = this.$refs.goodsRef;
                let _goodsItemDom = _goodsDom.querySelector('.shopPic_gs');
                if (_goodsItemDom) {
                    this.itemHeight = _goodsItemDom.offsetHeight;
                }
            }
            let num = Math.ceil((_diffTop + _h) / (this.itemHeight * 2)) || 1;
            this.pageOp.page = num > this.pageOp.total ? this.pageOp.total : num;
        }
    }
    showPage = false;
    moveTime = 0;
    touchMove($event) {
        let _self = this;
        if (_self.pageOp.total) {
            window.clearTimeout(this.moveTime);
            _self.showPage = true;
        }
    }
    touchEnd($event) {
        let _self = this;
        this.moveTime = timeout(() => {
            _self.showPage = false;
        }, 1500);
    }
}
