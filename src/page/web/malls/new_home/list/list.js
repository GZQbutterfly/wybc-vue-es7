/**
 * 商城列表
 */
import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';

import {
    timeout,
    appendParams
} from 'common.env';

import {
    OfficialMalls
} from '../official/official';
import {
    AgentMalls
} from '../agent/agent';

import {
    TopNotice
} from '../../../../sys/notice/top/top.notice';
import {
    IconList
} from '../component/icon/icon.list';
import {
    ShopCard
} from '../component/shopcard/shopcard';
import {
    MoneyTimeLimitBanner
} from '../../money/timelimit/banner/banner';

import { GoodsList } from '../../goods_list/goods_list';
import giftController from './gift.contr';
import carService from '../../shop_car/finishToCar';

import service from './list.service';

import './list.scss';
@Component({
    template: require('./list.html'),
    components: {
        'app-topnotice': TopNotice,
        'icon-list': IconList,
        'shop-card': ShopCard,
        'timelimit-banner': MoneyTimeLimitBanner,
        'agent-malls': AgentMalls,
        'official-malls': OfficialMalls,
        'goods-list': GoodsList
    }
})
export class MallsList extends BaseVue {

    //公告
    msgOpts = {
        list: []
    };

    // 首页banner
    bannerList = [];

    // 功能小图标
    iconList = [];


    createOfficialMalls = false;

    goodsList = [];

    goodsPage = 0;

    _$service;

    async mounted() {
        this._$service = service(this.$store);
        this._$carService = carService(this.$store);
        this.shopInfo = await this.$store.dispatch('CHECK_WD_INFO');
        this.shopId = this.shopInfo.shopId;
        this.$nextTick(() => {

            this.initPage();

            giftController.init(this);
        });
    }

    activated() {
        // keep-alive
        this.$nextTick(() => {
            this.setWxShare();
        });
    }

    async initPage() {

        this.queryTopNotice();

        this.queryBannerList();
        this.queryIconList();

        this._pullRefreshRef = this.$refs.pullRefreshRef;
    }

    loopLoadding() {
        this.queryBannerList();
        this.queryIconList();

        // 刷新 限时购banner 
        this.$refs.timelimitRef.reInit();
    }


    // 公告
    async queryTopNotice() {
        let _self = this;
        timeout(async () => {
            let _result = (await this._$service.queryTopNotice()).data;
            if (_result.errorCode) {
                return;
            }
            let _newList = [];
            for (let i = 0, len = _result.length; i < len; i++) {
                _newList.push({
                    img: '',
                    msg: _result[i],
                    flag: ''
                });
            }
            _self.msgOpts.list = _newList;
        }, 1000);
    }

    async queryBannerList() {
        let params = {
            shopId: this.shopId,
            channel: 'wd',
            posId: 1
        };
        let _result = (await this._$service.queryBannerList(params)).data;
        if (!_result || _result.errorCode || !_result.data.length) {
            return;
        } else {
            this.bannerList = _result.data;
        }
    }

    async queryIconList() {
        let _result = (await this._$service.queryIconList({
            shopId: this.shopId
        })).data;
        if (!_result || _result.errorCode || !_result.data.length) {
            return;
        } else {
            this.iconList = _result.data;
        }
    }

    refresh(done) {
        this.loopLoadding();
        let _result = this.$refs.agentMallsRef.refresh();
        let _self = this;
        timeout(() => {
            _result.then((flag) => {
                // done(true);
                if (!flag) {
                    this._pullRefreshRef.openInfinite();
                    this.createOfficialMalls = false;
                }
            });
            _self.fetchGoodsData(1,done);
        }, 500);
    }

    infinite(done) {
        let _self = this;
        //TODO 待修改. 记录官方精品以外数据加载完成 不再重新请求
        let _result = this.$refs.agentMallsRef.infinite();
        timeout(() => {
            _result.then((flag) => {
                if (!flag) {
                    done(flag);
                }
                if (flag) {
                    // 在关闭下拉加载时，scroller 会调整布局，此时 底部的 官方精品 会往下移， 现做以下优化
                    // let area = this._pullRefreshRef.myScroller.getPosition();
                    // this._pullRefreshRef.closeInfinite();
                    // this._pullRefreshRef.myScroller.scrollTo(area.left, area.top, 300);
                    this.createOfficialMalls = true;
                    _self.fetchGoodsData(_self.goodsPage + 1, done);
                }
            });
        }, 500);
    }

    fetchGoodsData(page, done) {
        let _params = {
            page : page ,
            classifyId : -1,
            limit:10,
        }
        let _self = this;
        this._$service.queryHomeGoodsList(_params)
        .then(res=>{
            let _result = res.data;
            if (_result && !_result.errorCode) {
                if (_result.data.length>0) {
                    if (_params.page==1) {
                        _self.goodsList = _result.data;
                    }else {
                        _self.goodsList.push(..._result.data);
                    }
                    _self.goodsPage = page;
                }
                done(true);
            }else{
                if (done) {
                    done(false);
                }
            }
        })
    }


    setWxShare() {
        let _self = this;
        _self.fetchShopData().then((data) => {
            if (data && !data.errorCode) {
                let config = {
                    title: data.wdName + ',超值特惠',
                    desc: '一言不合买买买！~',
                    imgUrl: 'http://wybc-pro.oss-cn-hangzhou.aliyuncs.com/Wx/wxfile/share_gs.jpg',
                    link: appendParams({
                        shopId: data.infoId
                    }).replace('user=own', '')
                }
                _self.updateWxShare(config);
            } else {
                let dialogObj = {
                    title: '提示',
                    content: '店铺不存在,立即去开店吧!',
                    mainBtn: '确定',
                    type: 'info',
                    mainFn() {
                        _self.$router.push({
                            path: "apply_shop_campaign"
                        });
                    }
                };
                _self._$dialog({
                    dialogObj
                });
                throw SyntaxError('店铺不存在,立即去开店吧!');
            }
        });
    }
    async bannerToDetaile(item) {
        let _shopId = {
            shopId: this.shopId
        }
        let _data = {
            goodsId: item.goodsId,
            shopId: this.shopId
        }
        let fastState = (await this._$service.queryStoreState(_shopId)).data;
        let fastStockNum = (await this._$service.queryGoodsStock(_data)).data;
        if (!fastState.errorCode && !fastStockNum.errorCode) {
            if (fastState.state == 1 && fastStockNum.S1) {
                this.$router.push({
                    path: 'goods_detail',
                    query: {
                        goodsId: item.goodsId,
                        isAgent: true
                    }
                });
            } else {
                this.$router.push({
                    path: 'goods_detail',
                    query: {
                        goodsId: item.goodsId,
                        isAgent: false
                    }
                });
            }
        }
    }

    joinCar(item) {
        this._$carService.finishToCar(this, item, 'home', 0);
    }
}