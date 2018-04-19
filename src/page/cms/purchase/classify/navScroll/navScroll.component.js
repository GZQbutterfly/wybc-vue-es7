import { Component, Vue } from 'vue-property-decorator';


import { isEmpty, findIndex } from 'lodash';

import Swiper from 'swiper';



import navScrollComponentService from "./navScroll.component.service";



import './navScroll.component.scss';

@Component({
    props: ['classifyNav', "currentClassifyId"],
    template: require('./navScroll.component.html')
})
export class NavScrollc extends Vue {
    _$service;
    swiper;
    classifyShow=21;
    data() {
        return {}
    }
    mounted() {
        let _self = this;
        let _route = _self.$route;
        let _query = _route.query;
        let firstIndex = 0;// 保持第一个
        let reactive = false;
        let silderlen = 0;
        let classify = this.$route.query.classify;
        _self.$nextTick(() => {
            _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
                slidesPerGroup: 1,
                slidesPerView: 4.5,
                observer: true,
                freeMode: true,
                on: {
                    transitionEnd() {
                        if (reactive) {
                            this.slideTo(firstIndex);
                            reactive = false;
                        }
                    }
                }
            });
        });
        this.classifyShow = this.$props.classifyNav[0].goodsClassifyId;
    }
    switchTab(id,index){
        this.classifyShow = id;
        this.$emit("swichTab",id,index);
    }
}
