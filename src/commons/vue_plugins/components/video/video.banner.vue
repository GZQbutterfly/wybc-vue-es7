<template lang="html">
    <div class="swiper-container" ref="swiperRef">
        <div class="swiper-wrapper">
            <div class="swiper-slide" v-if="hasVideo">
                <fsvideo :playerOptions="playerOptions" ></fsvideo>
            </div>
             <div class="swiper-slide" v-for="(item,index) in dataList" :key="index">
                <img :src="item" alt="">
            </div>
        </div>
    </div>
</template>

<script>
import Swiper from 'swiper';
import VueVideo from './video.vue';
export default {
    props: {
        selectItem: {
            type: Function,
            default: () => {}
        },
        dataList: {
            type: Array,
            default: [],
        },
        playerOptions: {
            default: () => {return {muted: true}}
        },
        hasVideo: {
            type: Boolean,
            default: false,
        }
    },
    components: {
        fsvideo: VueVideo,
    },
    data() {
        return {
        }
    },
    mounted() {
        let _self = this;
        _self.$nextTick(() => {
            _self.swiperUi = new Swiper(this.$refs.swiperRef, {
                centeredSlides: true,
                observer: true,
                observeParents: true,
                loopAdditionalSlides: 1,
                on: {
                    click: function(event) {
                        _self.clickedItem(this.activeIndex);
                    }
                }
            });
        });
    },
    methods: {
        clickedItem(index) {
            if (this.selectItem) {
                this.selectItem(index);
            }
        }
    }
}
</script>

<style lang="scss">
.swiper-container {
    width: 100%;
    height: 100%;
    .swiper-wrapper {
        width: 100%;
        height: 100%;
    }
    .swiper-slide {
        background-position: center;
        background-size: cover;
        width: 100%;
        height: 100%;
        img {
            width: 100%;
            height: 100%;
        }
    }
    .swiper-pagination-bullet {
        width: 10px;
        height: 10px;
        display: inline-block;
        background: #7c5e53;
    }
}
</style>
