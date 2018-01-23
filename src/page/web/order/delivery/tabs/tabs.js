import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import Swiper from 'swiper';
import { timeout } from 'common.env';


import { RobOrder } from '../rob/rob';
import { Pickup } from '../pickup/pickup';
import { Delivering } from '../delivering/delivering';
import {SlideslipMenu} from '../sideslip_menu/sideslip_menu';

import './tabs.scss';
@Component({
    template: require('./tabs.html'),
    components: {
        'rob': RobOrder,
        'pickup': Pickup,
        'delivering': Delivering,
        'slideslip-menu': SlideslipMenu
    }
})
export class DeliveryTabs extends BaseVue {
    tabs = [
        { label: '待抢单', attr: 'robShow' },
        { label: '待取货', attr: 'pickupShow' },
        { label: '配送中', attr: 'deliveringShow' }
    ];
    headerIndex = 0;
    robShow = true;
    pickupShow = false;
    deliveringShow = false;
    menuShow = false;
    menuFirst = false;
    mounted() {
        this.$nextTick(() => {
            this.$refs.tabsRef.style.minHeight = document.body.offsetHeight + 'px';
            this.initPage();
        });
    }
    initPage() {
        this.renderSwiper();

    }

    renderSwiper() {
        let _self = this;

        this.swiper = new Swiper(this.$refs.bodyRef, {
            slidesPerView: 'auto',
            direction: 'horizontal',
            on: {
                slideChangeTransitionEnd() {
                    _self.swtichTab(null, this.activeIndex);
                }
            }
        });
    }


    swtichTab($event, index) {
        if (index !== this.headerIndex) {
            let item = this.tabs[index];
            this.headerIndex = index;
            this[item.attr] = true;
            this.swiper.slideTo(index);
        }
    }

    noTouchMove(e){
        e.preventDefault();
        return false;
    }

    toMenu(){
        this.menuFirst = true;
        this.menuShow = !this.menuShow;
    }
}