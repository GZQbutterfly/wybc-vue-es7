import { Component, Vue, Prop } from 'vue-property-decorator';

import Swiper from 'swiper';

import './icon.list.scss';
@Component({
    template: require('./icon.list.html')
})
export class IconList extends Vue {
    @Prop({ type: Array, default: [] })
    list;

    mounted() {
        let _self = this;
        _self.$nextTick(() => {
            _self.renderSwiper();
        });
    }

    renderSwiper() {
        let _self = this;
        _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
            slidesPerGroup: 1,
            slidesPerView: _self.list.length > 4 ? 4.5 : 4,
            observer: true,
            resistanceRatio: 0
        });
    }

    goPage(e, item) {
        let _url = item.linkLocation;
        if (/http/.test(_url)) {
            location.href = item.url;
        } else {
            this.$router.push({ path: _url });
        }
    }
}
