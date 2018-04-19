import { Component, Vue } from 'vue-property-decorator';
import { isEmpty, findIndex } from 'lodash';
import Swiper from 'swiper';
import './navScroll.scss';

@Component({
    props: ['classifyNav', 'currentClassifyId'],
    template: require('./navScroll.html')
})

export class NavScrollc extends Vue {
    swiper;
    isInit = true;//是否为swiper初始化
    _$service;//当前显示下标 只在swiper初始化用
    showIndex = 0;//为真实数据下标
    mounted() {
        let _self = this;
        _self.$nextTick(() => {
            _self.setSwiperInit();
        });
    }
    activated () {     
        // this.$nextTick(()=>{
            this.setCurrentClassifyId(this.$props.classifyNav);
        // })   
    }
    setSwiperInit(){
        let _self = this;
        _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
            slidesPerGroup: 1,
            slidesPerView: 4.5,
            observer: true,
            // on: {
            //     transitionEnd() {
            //         if (_self.isInit) {
            //             this.slideTo(_self.showIndex);
            //             _self.isInit = false;
            //         }
            //     }
            // }
        });
        this.setCurrentClassifyId(this.$props.classifyNav);
    }
    setCurrentClassifyId(classifyNav) {
        let _classify = this.$route.query.classify;
        if (_classify) {
            this.showIndex = classifyNav.findIndex((v, i) => {
                if (v.goodsClassifyId == _classify) {
                    return i;
                }
            });
            if (this.showIndex==-1){
                this.showIndex = 0;
            }
        } else {
            this.showIndex = 0;
        }
       this.swiper.slideTo(this.showIndex);  
    }
    swichTabs(id,index){
        this.$emit("swichTab",id,index);
    }
}