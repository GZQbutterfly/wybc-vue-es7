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
    classfyList = [];//分类数据
    classfyId = [];//分类id
    swiper;
    isInit = true;//是否为swiper初始化
    _$service;//当前显示下标 只在swiper初始化用
    showIndex = 0;//为真实数据下标(swiper渲染项第一个不包括)

    mounted() {
        let _self = this;
        _self._$service = navScrollService(this.$store);
        _self.$nextTick(() => {
            _self.queryClassifyList();
            _self.setSwiperInit();
        });
    }

    /**
     * 再次打开时(不包括刷新)
     */
    activated() {
        this.queryClassifyList();
    }

    /**
     * 获取分类数据
     * 根据url参数设置显示项下标
     */
    async queryClassifyList(val = 0) {
        let _self = this;
        let classifyId = val ? val : _self.$route.query.classify;
        let _res = await _self._$service.classfyList();
        _self.showIndex = 0;
        if (_res.data.errorCode) {
            return val;
        }
        let _data = _res.data.data;
        if (classifyId) {
            _self.showIndex = findIndex(_data, { goodsClassifyId: Number(classifyId) });
            if(_self.showIndex == -1){
                _self.showIndex = 0;
            }
        }
        _self.classfyList = _data;
        if(!_self.isInit){
            _self.swiper.slideTo(_self.showIndex + 1);
        }
        return _self.classfyList[_self.showIndex].goodsClassifyId;
    }

    setSwiperInit(){
        let _self = this;
        _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
            slidesPerGroup: 1,
            slidesPerView: 4.5,
            observer: true,
            on: {
                transitionEnd() {
                    if (_self.isInit) {
                        this.slideTo(_self.showIndex + 1);
                        _self.isInit = false;
                    }
                }
            }
        });
    }

    async changeShop(classifyId) {
        if(classifyId == this.showIndex){
            return;
        }
        let _self = this;
        let id = await _self.queryClassifyList(classifyId);
        id && _self.$props.onchangeShop(id);
        _self.$router.replace({ path: "classify", query: { classify: id } }); 
    }
}