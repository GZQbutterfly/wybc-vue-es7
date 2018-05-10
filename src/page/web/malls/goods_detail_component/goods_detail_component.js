import { Component, Vue } from 'vue-property-decorator';


import './goods_detail_component.scss';

import VideoBanner from '../../../../commons/vue_plugins/components/video/video.banner.vue';
import VueVideo from '../../../../commons/vue_plugins/components/video/video.vue';

@Component({
    template: require('./goods_detail_component.html'),
    props: {
        consumptionType: { default: 1 },   // 消费类型 1.rmb 2.rmb+gold 3.timeLimitBuy 
        timeObj: {
            default: {
                int_mounth: '00',
                int_day: '00',
                int_hour: '00',
                int_minute: '00',
                int_second: '00'
            }
        },
        counponObj: { default: () => { return {} } },
        goods: { default: () => { return {} } },
        hasBannerVideo: { default: false },
        playerOptions: { default: () => { return {} } },
        isLimitBuy: { defailt: false },
        bannerImg: { default: () => { return [] } }
    },
    components: {
        gsbanner: VideoBanner,
        fsvideo: VueVideo,
    }
})

export class GoodsComponent extends Vue {
    shopkeeper = {};
    shopInfo;
    shopId;
    async mounted() {
        this.shopInfo = await this.$store.dispatch('CHECK_WD_INFO');
        this.shopId = this.shopInfo.shopId;

        this.$nextTick(() => {
            this.setWdInfo();
        });
    }
    toCounponDetail() {
        this.$emit('toCounponDetail');
    }
    goHome() {
        this.$emit('goHome');
    }

    //获取店信息
    setWdInfo() {
        let _wdVipInfo = this.shopInfo;
        if (!_wdVipInfo.wdImg) {
            _wdVipInfo.wdImg = "/static/images/newshop/touxiang.png"
        }
        this.shopkeeper = {
            wdName: _wdVipInfo.wdName,
            wdImg: _wdVipInfo.wdImg,
            vipGrade: _wdVipInfo.wdVipGrade,
            school: _wdVipInfo.school,
        }
        this.$emit('setWxShareConfig');
        let cartCache = JSON.parse(localStorage.getItem("shopcartCache"));
        if (cartCache) {
            if (cartCache.data[0].shopId != _wdVipInfo.infoId) {
                localStorage.removeItem("shopcartCache");
                this.$store.state.shopCar.count = 0;
            }
        }
    }
}