import { Component, Vue } from 'vue-property-decorator';


import { isEmpty, findIndex } from 'lodash';

import Swiper from 'swiper';



import navScrollService from './navScroll.service';



import './navScroll.scss';

@Component({
    props: ['config', 'onchangeShop'],
    template: require('./navScroll.html')
})
export class NavScrollc extends Vue {
    classifyShow = '';//图片显示
    classfyList = [];//分类数据
    classfyId = [];//分类id
    swiper;
    _$service;
    data() {
        return { };
    }
    created() {
        this._$service = navScrollService(this.$store);
       
        let _self = this;

        this.$nextTick(() => {
            _self.queryClassifyList();
            // this._$service.classfyList().then(res => {  //获取分类列表
            //     if (!res.data.errorCode) {
            //         _this.classfyList = res.data.data;
            //         if (classify) {
            //             let findClass = false;
            //             for (let i = 0, len = _this.classfyList.length; i < len; i++) {
            //                 if (classify == _this.classfyList[i].goodsClassifyId){
            //                     findClass = true;
            //                     break;
            //                 }
            //             }
            //             if(findClass){
            //               _this.classifyShow = classify;
            //             }else{
            //                 _this.classifyShow = _this.classfyList[0].goodsClassifyId;
            //             }
            //         } else {
            //             _this.classifyShow = _this.classfyList[0].goodsClassifyId;
            //         }
            //     }
            // });
        });
    }
    async queryClassifyList() {
        let _self = this;
        let classifyId = _self.$route.query.classify;
        let _res = await _self._$service.classfyList();
        let _result = _res.data;
        if (_result.errorCode) {
            return;
        }
        let _classfyList = _result.data;
        if (classifyId) {
            let findClass = false;
            for (let i = 0, len = _classfyList.length; i < len; i++) {
                if (classifyId == __classfyList[i].goodsClassifyId) {
                    findClass = true;
                    break;
                }
            }
            if (findClass) {
                _self.classifyShow = classifyId;
            } else {
                _self.classifyShow = _classfyList[0].goodsClassifyId;
            }
        } else {
            _self.classifyShow = _classfyList[0].goodsClassifyId;
        }
        _self.classfyList  = _classfyList;
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
        this.$router.replace({ path: "classify", query: { classify: id } });
    }
}
