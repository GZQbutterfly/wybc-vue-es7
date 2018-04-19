import { Component, Vue } from 'vue-property-decorator';

import Swiper from 'swiper';



import './nav_scroll.scss';

@Component({
    props: ['iconsList', 'config'],
    template: require('./nav_scroll.html')
})
export class IconsList extends Vue {

    data() {
        return {}
    }
    mounted() {
        let _self = this;
        _self.$nextTick(() => {
            _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
                slidesPerGroup: 1,
                slidesPerView: 4,
                observer: true,
                resistanceRatio: 0,
            });
        });
    }
    goPage(e, item) {
        // if (item.iconName=="每日任务"){
        //     let dialogObj = {
        //         title: '提示',
        //         content: '该功能暂未开放！',
        //         assistBtn: '',
        //         mainBtn: '确定',
        //         type: 'info',
        //         assistFn() {
        //         },
        //         mainFn() {
        //         }
        //     };
        //     this.$store.state.$dialog({ dialogObj });
        //     return;
        // }
        let _url = item.linkLocation;
        if (/http/.test(_url)) {
            location.href = item.url;
        } else {
            this.$router.push({ path: _url });
        }
    }

}
