import {Component, Vue} from 'vue-property-decorator';
import Swiper from 'swiper';

import './banner.scss';

@Component({
    props: [
        'adList', 'itemClicked'
    ],
    template: require('./banner.html')
})
export class GoodsBanner extends Vue {

    mounted() {
        let _self = this;
        let _config = _self.config || {};
        _self.$nextTick(() => {
            _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
                autoplay: {
                    delay: 3500,
                    disableOnInteraction: false
                },
                observer: true,
                spaceBetween: 20
            });
        });
    }

    swiperClicked(target) {
        if (this.$props.itemClicked) {
            this.$props.itemClicked(target);
        }
    }
}
