
import { Component } from 'vue-property-decorator';
import  Swiper  from 'swiper';
import  BaseVue  from 'base.vue';
import helperService from './helper.service';
import './helper.scss';

@Component({
    template: require('./helper.html')
})

export class Helper extends BaseVue {
    _$service;
    dataList = [];
    swiper;

    mounted() {
        //注册服务
        this._$service = helperService(this.$store);
        let _self = this;
        this.$nextTick(() => {
            document.title = "联系客服";
            this._$service.queryAllHelper().then((res) => {
                console.log('客服列表',res.data.data)
                _self.dataList = res.data.data;
                _self.swiper = new Swiper(_self.$refs.helperSwiper, {
                    slidesPerView: 1,
                    slidesPerColumn: 1,
                    observer: true,
                    spaceBetween: 160,
                    //初始化随机显示 后台反优先级就不用
                    // initialSlide: Math.floor(Math.random()*_self.dataList.length),
                    pagination: {
                        el: '.swiper-pagination',
                        type: 'fraction',
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }
                });
            });
            _self.updateWxShare();
        });
    }
}
