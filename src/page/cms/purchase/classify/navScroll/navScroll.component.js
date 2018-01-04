import { Component,Vue} from 'vue-property-decorator';


import { isEmpty, findIndex } from 'lodash';

import Swiper  from 'swiper';



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
        let classify = this.$route.query.classify;
        let _this = this;

        this.$nextTick(() => {
            this._$service.classfyList().then(res => {  //获取分类列表
                if (!res.data.errorCode) {
                    _this.classfyList = res.data.data;
                    // _this.classfyList.forEach(item => {
                    //     _this.classfyId.push(item.id);
                    // });
                    if (classify) {
                        _this.classifyShow = classify;
                    } else {
                        _this.classifyShow = _this.classfyList[0].goodsClassifyId;
                    }
                }
            });
        });
    }
    mounted() {
        let _self = this;
        let _route = _self.$route;
        let _query = _route.query;
        let firstIndex = 0;// 保持第一个
        let reactive = false;
        let silderlen = 0;
        _self.$nextTick(() => {
            _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
                slidesPerGroup: 1,
                slidesPerView: 4,
                observer: true,
                on: {
                    transitionEnd() {
                        if (reactive) {
                            this.slideTo(firstIndex);
                            reactive = false;
                        }
                    }
                }
            });
            silderlen = _self.swiper.slides.length;

        });

        _self.$watch('classfyList', (list) => {
            reactive = true;
            if (!isEmpty(_query)) {
                firstIndex = findIndex(list, { goodsClassifyId: Number(_query.classify) }) + silderlen - 1;
            }
        })
    }
    activated() {
        // keep-alive
        let classify = this.$route.query.classify;
        if (classify) {
            this.classifyShow = classify;
        } else {
            if (this.classfyList.length) {
                this.classifyShow = this.classfyList[0].goodsClassifyId;
            }
        }
        if (this.classfyList.length) {
            let activeIndex = findIndex(this.classfyList, { goodsClassifyId: Number(classify) }) + 1;
            if (this.swiper) {
                this.swiper.slideTo(activeIndex)
            }
        }
    }
    changeShop(e, id) {
        let _this = this;
        console.log(id);
        _this.classifyShow = id;
        this.$props.onchangeShop(e, id);
        this.$router.replace({ path: "cms_purchase_classify", query: { classify: id } });
    }
}
