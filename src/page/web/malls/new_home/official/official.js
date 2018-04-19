/**
 * 官方商城
 */
import { Component, Vue } from 'vue-property-decorator';

import Swiper from 'swiper';

import { GoodsList } from '../../goods_list/goods_list';

import service from './official.service';
import carService from '../../shop_car/finishToCar';

import './official.scss';
@Component({
    template: require('./official.html'),
    components: {
        'goods-list': GoodsList
    }
})
export class OfficialMalls extends Vue {

    oo = {

    };

    showContent = false;

    _$service;

    mounted() {
        this._$carService = carService(this.$store);
        this._$service = service(this.$store);
        this.$nextTick(() => {
            this.initPage();
        });
    }

    initPage() {
        this.queryGoodsList();
       // this.renderSwiper();
    }

    loopLoadding() {
        this.queryGoodsList();
    }

    renderSwiper() {
        let _self = this;
        _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
            slidesPerView: 'auto',
            centeredSlides: true,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            observer: true
        });
    }

    async  queryGoodsList() {
        let _result = (await this._$service.queryGoodsList()).data;
        if (!_result || _result.errorCode) {

        }

        this.showContent = true;
        this.oo = _result;
    }

    joinCar(item) {
        this._$carService.finishToCar(this, item, 'home', 0);
    }


}