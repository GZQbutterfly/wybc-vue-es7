import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { timeout } from 'common.env';
import Swiper from 'swiper';

import { RankItem } from './item/item';

import service from './rankgold.service';

import './rankgold.scss';
@Component({
    template: require('./rankgold.html'),
    components: {
        'rank-item': RankItem
    }
})
export class RankGold extends BaseVue {
    tabs = [
        { label: '总榜', ranktype: 'allrank', create: false },
        { label: '店长榜', ranktype: 'shoprank', create: false }
    ];

    currentTab = 0;

    amountGold = 0;

    _$service;

    showAction = false;

    rankingListConfig = {
        rankingId: 0, //4, //排行榜活动id
        activityName: '',// "元旦专用金币排行榜", //备注名
        activitySource: 1, //统计源  1:金币获得数量  2:粉丝数
        beginTime: '',// "2018-05-04 12:08:27", //活动开始时间
        endTime: '', //"2018-05-04 12:08:25", //活动结束时间
        createTime: '', // "2018-05-04 12:08:44", //创建时间
        showCount: 0, // 50, //排行榜显示数量
        rulesImg: '', //"http://wybc-qa.oss-cn-hangzhou.aliyuncs.com/WebApp/goods/goods/jpg/201805/1525402954385.jpg", //奖励图片
        state: 1, //3 //活动状态(1：未开始，2：进行中，已结束)
    };


    mounted() {

        document.title = "金币排行";

        this._$service = service(this.$store);

        this.$nextTick(() => {
            this.initPage();
        });
    }

    initPage() {
        this._$service.queryRanking({ rankingId: this.$route.query.rankingId }).then((res) => {
            let _result = res.data;
            if (_result && !_result.errorCode && _result.success) {
                this.rankingListConfig = _result.rankingListConfig;
                if (this.rankingListConfig.state == 2) {
                    this.tabs[0].create = true;
                    this.showAction = true;
                    window.sessionStorage.__rankgiftimgsrc = this.rankingListConfig.rulesImg;
                    this.renderSwiper();
                    return;
                }
            }
            this.notOpenActionDialog();
        });
    }

    renderSwiper() {
        let _self = this;
        timeout(() => {
            this.swiper = new Swiper(this.$refs.bodyRef, {
                slidesPerView: 'auto',
                direction: 'horizontal',
                passiveListeners: false,
                resistanceRatio: 0,
                on: {
                    slideChange() {
                        _self.changeTab(this.activeIndex);
                    }
                }
            });
        });
    }

    switchTab(index) {
        this.swiper.slideTo(index);
    }


    changeTab(index) {
        let item = this.tabs[index];
        item.create = true;
        this.currentTab = index;
    }


    queryGoldInfo() {
        let _self = this;
        this._$service.queryGoldInfo().then(res => {
            let _result = res.data;
            if (_result && !_result.errorCode) {
                this.amountGold = _result.amountGold;
            }
        });
    }

    toGetGift() {
        let rankConf = this.rankingListConfig;
        if (rankConf.rulesImg) {
            // location.href = rankConf.rulesImg;
            this.$router.push({ path: 'rank_gift' });
        }

    }


    notOpenActionDialog() {
        let _self = this;
        _self._$dialog({
            dialogObj: {
                title: '提示',
                type: 'info',
                content: '活动未开启！',
                mainBtn: '知道啦',
                mainFn() {
                    _self.$router.back();
                }
            }
        })
    }

}