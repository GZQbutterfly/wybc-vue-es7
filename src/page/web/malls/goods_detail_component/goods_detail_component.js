import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import './goods_detail_component.scss';

import VideoBanner from '../../../../commons/vue_plugins/components/video/video.banner.vue';
import VueVideo from '../../../../commons/vue_plugins/components/video/video.vue';

@Component({
    template: require('./goods_detail_component.html'),
    props: {
        consumptionType:{default:1},   // 消费类型 1.rmb 2.rmb+gold 3.timeLimitBuy 
        timeObj:{default:{      
                int_mounth:'00',
                int_day:'00',            
                int_hour:'00',             
                int_minute:'00',             
                int_second: '00'           
        }},
        counponObj:{default:()=>{return {} }},
        goods:{default:()=>{return {} }},
        hasBannerVideo: { default: false},
        playerOptions:{default:()=>{return {} }},
        shopkeeper:{default:()=>{return {} }},
        bannerImg:{default:()=>{return [] }},
        isLimitBuy:{defailt:false}
    },
    components: {
        gsbanner: VideoBanner,
        fsvideo: VueVideo,
    }
})

export class GoodsComponent extends BaseVue {
    mounted() {
     
    }
    toCounponDetail(){
        this.$emit('toCounponDetail');
    }
    goHome(){
        this.$emit('goHome');
    }
}