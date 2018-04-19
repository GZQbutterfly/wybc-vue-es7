import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isNotLogin, toLogin, appendParams, timeout } from 'common.env';
import { NavScrollc } from './navScroll/navScroll';
import finishToCar from "../shop_car/finishToCar";
import homeController from '../new_home/list/gift.contr';
// import { GoodsList } from '../goods_list/goods_list';
import classifyService from './classify.service';
import './classify.scss';

@Component({
    template: require('./classify.html'),
    components: {
        'navScrollc': NavScrollc,
        // "list-goods": GoodsList
    }
})

export class Classify extends BaseVue {
    // 组件方法也可以直接声明为实例的方法
    _$service;
    shopkeeper = {};                      //店铺信息
    classifyNav = [
        {
            classifyName:"全部商品",
            goodsClassifyId:-1,
            unselectedImgUrl:"/static/images/newshop/tuijian.png",
            selectedImgUrl:"/static/images/newshop/tuijian_s.png"
        }
    ];                     //分类导航
    classfyGoodsListsArr = [];            //分类商品列表数组 
    classifyAdImgPicsArr = [];            //分类广告数组
    classfyGoodsList = [];                //分类商品列表 
    classifyAdImgPic = [];                //分类广告
    pagesArr = [];                        //分页数组
    currentClassifyId = -1;               //当前显示的分类id
    currentIndex = 0;                     //当前索引 
    firstLoad = true;                     //是否首次加载
    pageOp = {
        page: 0,
        total: 0
    }
    mounted() {
        // 注册服务
        this._$service = classifyService(this.$store);
        this.$nextTick(async () => {
            // 首页礼包业务逻辑处理
            homeController.init(this);
        });
    }

    activated() {
        document.title = "店长直营";
        // keep-alive 时 会执行activated
        let _self = this;
        this.$nextTick(async () => {
            // _self.initData();
            await _self.queryClassifyNav();
            // await _self.queryClassifyAd(_self.currentClassifyId, _self.currentIndex);
            await _self.fetchGoodsData(_self.currentClassifyId, _self.currentIndex, 1);
            this.setPage();
        })
        this.fetchShopData()
            .then((res) => {
                let config = {
                    title: res.wdName + ',超值特惠',
                    desc: '一言不合买买买！~',
                    imgUrl: 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_gs.jpg',
                    link: appendParams({ shopId: res.infoId }).replace('user=own', '')
                }
                _self.updateWxShare(config);
            });
    }
    refresh(done) {
        let _self = this;
        let _result = _self.isClassifyId(_self.currentClassifyId);
        setTimeout(() => {
            _result.then(async (flag) => {
                if (flag) { //更新数据
                    // await _self.queryClassifyAd(_self.currentClassifyId, _self.currentIndex);
                    let _flag = await _self.fetchGoodsData(_self.currentClassifyId, _self.currentIndex, 1);
                    done(_flag);
                } else {
                    _self.$router.replace({ path: "classify", query: { classify: -1 } });
                    await _self.queryClassifyNav();
                    await _self.fetchGoodsData(-1, 0, 1);
                    _self.setPage();
                }
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
            })
        }, 500);
    }
    setPage() {
        this.pageOp.page = this.pagesArr[this.currentIndex];
        this.pageOp.total = Math.ceil(this.classfyGoodsList.length / 4);
    }
    /**
     * 判断分类是否有效
     */
    async isClassifyId(classifyId) {
        let _classify = (await this._$service.classfyList()).data;
        let arr = {
            classifyName: "全部商品",
            goodsClassifyId: -1,
            unselectedImgUrl: "/static/images/newshop/tuijian.png",
            selectedImgUrl: "/static/images/newshop/tuijian_s.png"
        };
        _classify = [arr, ..._classify.classifies];
        let flag = false;
        for (let i = 0, len = _classify.length; i < len; i++) {
            if (_classify[i].goodsClassifyId == classifyId) {
                flag = true;
                break;
            }
        }
        // if (!flag) {
        //     this.classifyNav = _classify;
        // }
        return flag;
    }
    /**
     * 下拉刷新初始化数据
     */
    initData() {
        this.classifyNav = [
            {
                classifyName: "全部商品",
                goodsClassifyId: -1,
                unselectedImgUrl: "/static/images/newshop/tuijian.png",
                selectedImgUrl: "/static/images/newshop/tuijian_s.png"
            } 
        ];                              //分类导航
        this.classfyGoodsListsArr = [];            //分类商品列表数组 
        this.classifyAdImgPicsArr = [];            //分类广告数组
        //  this.classfyGoodsList = [];                          //分类商品列表 
        // this.classifyAdImgPic = [];                           //分类广告
        this.pagesArr = [];                         //分页数组
        this.firstLoad = true;
    }
    /**
     * 初始化创建数组和页码
     */
    initPage(classifyNav) {
        for (let i = 0, len = classifyNav.length; i < len; i++) {
            let arr = new Array;
            this.pagesArr.push(0);
            this.classfyGoodsListsArr.push(arr);
            this.classifyAdImgPicsArr.push(arr);
        }
    }
    /**
    * 查询分类导航列表and初始化数组
    */
    async queryClassifyNav(firstLoad = true) {
        let _classify = (await this._$service.classfyList()).data;
        if (!_classify || _classify.errorCode || _classify.classifies.length == 0) {
            this.classfyGoodsList = [];
            this.classifyAdImgPic = [];
            return;
        }
        let arr = {
            classifyName: "全部商品",
            goodsClassifyId: -1,
            unselectedImgUrl: "/static/images/newshop/tuijian.png",
            selectedImgUrl: "/static/images/newshop/tuijian_s.png"
        };
        
        this.classifyNav =[arr,..._classify.classifies];
        // if (firstLoad) {
        //     this.currentClassifyId = _classify.data[0].goodsClassifyId;
        // }
        this.setCurrentClassifyId(this.classifyNav);
        this.initPage(this.classifyNav);
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
     * 分类广告
     */
    // async queryClassifyAd(classifyId, i) {
    //     let _classifyAd = (await this._$service.getClassifyAdImg(classifyId)).data;
    //     if (!_classifyAd || _classifyAd.errorCode || (_classifyAd.data && _classifyAd.data.length == 0)) {
    //         this.classifyAdImgPic = [];
    //         this.$set(this.classifyAdImgPicsArr, i, []);
    //         return;
    //     }
    //     _classifyAd.data.forEach(item => {
    //         item.url = item.imgUrl;
    //     })
    //     this.$set(this.classifyAdImgPicsArr, i, _classifyAd.data);
    //     this.classifyAdImgPic = this.classifyAdImgPicsArr[i];
    // }
    /**
    * 加载商品数据
    */
    async fetchGoodsData(classifyId, i, page, loadFlag = true) {
        let _limit = 10;//  分页是以4个商品为一组
        let opt = {
            classifyId: classifyId,
            page: page,
            limit: _limit
        };
        let _goodsList = (await this._$service.getClassfyGoodsList(opt)).data;
        if (_goodsList.errorCode) {
            return true;
        }
        // ==> 修复加载时 分页页数异常
        let len = _goodsList.goods.length;
        if (len < 1) {
            page--;
        }
        page = page < 1 ? 1 : page;
        this.pagesArr[i] = page;
        // <==
        if (loadFlag) {
            if (len == 0) {
                this.$set(this.classfyGoodsListsArr, i, []);
                this.classfyGoodsList = [];
            } else {
                let goodsList = _goodsList.goods;
                this.$set(this.classfyGoodsListsArr, i, goodsList);
                this.classfyGoodsList = this.classfyGoodsListsArr[i];
                this.firstLoad = false;
            }
        } else {
            if (len == 0) {
                this.$set(this.classfyGoodsListsArr, i, this.classfyGoodsListsArr[i].concat(_goodsList.goods));
                this.classfyGoodsList = this.classfyGoodsListsArr[i];
                this.firstLoad = false;
                return true;
            }
            this.$set(this.classfyGoodsListsArr, i, this.classfyGoodsListsArr[i].concat(_goodsList.goods));
            this.classfyGoodsList = this.classfyGoodsListsArr[i];
            this.firstLoad = false;
        }
        this.setPage();
        return false;
    }
    /**
     * 设置当前页数据
     */
    setCurrentPageData(id, index, done = null) {
        // if (this.classifyAdImgPicsArr[index].length == 0) {
        //     this.queryClassifyAd(id, index);
        // } else {
        //     this.classifyAdImgPic = this.classifyAdImgPicsArr[index];
        // }
        if (this.classfyGoodsListsArr[index].length == 0) {
            this.firstLoad = true;
            this.fetchGoodsData(this.currentClassifyId, this.currentIndex, 1, done);
        } else {
            this.classfyGoodsList = this.classfyGoodsListsArr[index];
            this.setPage()
            done && done(false);
        }
    }
    /**
     * 切换更改商品列表数据
     */
    async swichTabGoods(id, index) {
        this.currentClassifyId = id;
        this.currentIndex = index;
        console.log("导航下标:", index, "分类id:", id);
        this.$router.replace({ path: "classify", query: { classify: id } });
        let flag = await this.isClassifyId(id);
        if (flag) { //更新数据
            this.setCurrentPageData(id, index);
        } else {
            this.$router.replace({ path: "classify", query: { classify: -1 } });
            await this.queryClassifyNav();
            await this.fetchGoodsData(-1, 0, 1);
            this.setPage();
        }
        let _res = await this.fetchShopData();
        let config = {
            title: _res.wdName + ',超值特惠',
            desc: '一言不合买买买！~',
            imgUrl: 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_gs.jpg',
            link: appendParams({ shopId: _res.infoId }).replace('user=own', '')
        }
        this.updateWxShare(config);
    }
    //跳转搜索页面
    goSearch() {
        let typeId = this.currentClassifyId ? '?classify=' + this.currentClassifyId : '';
        this.$router.push({ path: "search", query: { origin: 'classify' + typeId } });
    }
    //加入购物车
    QuicklyJoinTheShoppingCart(item) {
        finishToCar(this.$store).finishToCar(this, item, "classify",1);
    }
    //详情
    toDetail(goodsId) {
        this.$router.push({ path: "goods_detail", query: { goodsId: goodsId, isAgent: true} })
    }
    itemHeight = 0;
    _homeHeight = 0;
    monitoringMoveFn(offset) {
        let _top = offset.top;
        if (_top) {
            let _bannerHeight = 0;
            let _bannerRef = this.$refs.bannerRef;
            if (_bannerRef && _bannerRef.length && _bannerRef[this.currentIndex]) {
                _bannerHeight = _bannerRef[this.currentIndex].offsetHeight;
            }
            let _diffTop = (_top - _bannerHeight);
            let _h = this._homeHeight || (this._homeHeight = this.$refs.homeContentRef.offsetHeight - 60);
            if (!this.itemHeight) {
                let _goodsDom = this.$refs.goodsRef[this.currentIndex];
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
