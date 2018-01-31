import { Component, Vue } from 'vue-property-decorator';


import { isEmpty, findIndex } from 'lodash';

import Swiper from 'swiper';



import navScrollComponentService from "./navScroll.component.service";



import './navScroll.component.scss';

@Component({
    props: ['config', 'onchangeShop'],
    template: require('./navScroll.component.html')
})
export class NavScrollc extends Vue {
    classifyShow = '';//图片显示
    _$service;
    classfyList = [];//分类数据
    classfyId = [];//分类id
    swiper;
    data() {
        return {}
    }
    created() {
        this._$service = navScrollComponentService(this.$store);
    }
    async getQueryList(classify) {
        this.classfyList = (await this._$service.classfyList()).data.data;
        if (this.classfyList.length==0){
            this.classfyList = [];
            return;
        }
        if (classify) {
            let flag = findIndex(this.classfyList, { goodsClassifyId: Number(classify) });
            if (flag == -1) {
                this.classifyShow = this.classfyList[0].goodsClassifyId;
            } else {
                this.classifyShow = classify;
            }
        } else {
            this.classifyShow = this.classfyList[0].goodsClassifyId;
        }
        let activeIndex = findIndex(this.classfyList, { goodsClassifyId: Number(this.classifyShow) });
        if (this.swiper) {
            this.swiper.slideTo(activeIndex)
        }
        return this.classifyShow;
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
            _self.getQueryList(classify);
        });
    }
    activated() {
        let classify = this.$route.query.classify;
        this.getQueryList(classify);
    }
    async changeShop(e, id) {
        let _this = this;
        let  classify = await _this.getQueryList(id);
        this.$props.onchangeShop(e, classify);
        this.$router.replace({ path: "cms_purchase_classify", query: { classify: classify } });
    }
}
