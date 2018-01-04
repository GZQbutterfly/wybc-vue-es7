<template lang="html">
    <div class="swiper-container" ref="bannerSwiper">
        <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="(str, index) in listImg" :key="index">
                <div @click="goDetile($event,str.linkTarget,str.goodsId)" v-if="index == 0">
                    <template>
                        <!-- <img :src="str.url"> -->
                        <progressive-img :src="str.url" :placeholder="str.url" />
                    </template>
                </div>
                <template v-if="index != 0">
                    <!-- <img :src="str.url">  -->
                    <img v-lazy="str.url" @click="goDetile($event,str.linkTarget,str.goodsId,str.linkType)" />
                    <!-- <img class="swiper-lazy" :data-src="str.url" :data-srcset="str.url + ' 2x'">
                    <div class="swiper-lazy-preloader"></div> -->
                </template>
            </div>
        </div>
        <div class="swiper-pagination"></div>
    </div>
</template>

<script>
import Swiper from 'swiper';

export default {
    props: ['listImg', 'config'],
    data() {
        return {}
    },
    mounted() {
        let _self = this;
        let _config = _self.config || {};
        _self.$nextTick(() => {
            _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
                //disableOnInteraction: false,
                centeredSlides: true,
                autoplay: {
                    delay: 2500,
                    disableOnInteraction: false,
                },
                // lazy: {
                //     loadPrevNext: true,
                //     loadOnTransitionStart: true,
                //     loadPrevNextAmount: 0,
                // },
                observer: true,
                observeParents: true,
            });
        });
    },
    activated() {
        // 在渲染时执行一次，当路由组件keep-alive时，切换组件会默认触发一次
        let _self = this;
        let _swiper = _self.swiper;
        if (_swiper) {
            setTimeout(() => {
                if (!_swiper.slideNext()) {
                    _swiper.slideTo(0);
                }
            }, 2000);
        }
    },
    beforeUpdate() {
        let _self = this;
        let _swiper = _self.swiper;
        if (_swiper) {
            setTimeout(() => {
                if (!_swiper.slideNext()) {
                    _swiper.slideTo(0);
                }
            }, 2000);
        }
    },
    destroyed() {},
    methods: {
        goDetile(e, linkTarget, goodsId, linkType) {
            // alert(linkTarget);
            if (!goodsId || linkType == 1) {
                location.href = linkTarget;
            } else {
                let url = location.href;
                if (url.indexOf('cms') == -1) {
                    this.$router.push({
                        path: "goods_detail",
                        query: {
                            goodsId: goodsId
                        }
                    });
                    return;
                }
                this.$router.push({
                    path: "cms_purchase_goods_detail",
                    query: {
                        goodsId: goodsId
                    }
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
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
            display: block;
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
