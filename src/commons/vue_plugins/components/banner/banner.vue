<template lang="html">
    <div class="banner-container">
        <div class="swiper-container" ref="bannerSwiper">
            <div class="swiper-wrapper">
                <div class="swiper-slide" v-for="(str, index) in listImg" :key="index">
                    <div @click="goDetile(str)" v-if="index == 0">
                        <template>
                            <!-- <img :src="str.url"> -->
                            <progressive-img :src="str[imgField]" :placeholder="str[imgField]" />
                        </template>
                    </div>
                    <template v-if="index != 0">
                        <!-- <img :src="str.url">  -->
                        <img v-lazy="str[imgField]" @click="goDetile(str)" />
                        <!-- <img class="swiper-lazy" :data-src="str.url" :data-srcset="str.url + ' 2x'">
                        <div class="swiper-lazy-preloader"></div> -->
                    </template>
                </div>
            </div>
            <div class="swiper-pagination"></div>
        </div>
    </div>
</template>

<script>
import Swiper from 'swiper';

export default {
    props: {
        listImg:{
            type: Array,
            default: []
        },
        imgField:{
            type: String,
            default: 'url'
        },
         orgin:{
            type: String,
            default: ''
        }
    },
    data() {
        return {}
    },
    mounted() {
        let _self = this;
        let _config = _self.config || {};
        _self.$nextTick(() => {
             setTimeout(() => {
                _self.swiper = new Swiper(_self.$refs.bannerSwiper, {
                    centeredSlides: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false,
                    },
                    observer: true,
                    observeParents: true,
                });
             }, 500);
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
        goDetile(item) {
            if (!item.goodsId || item.linkType == 1) {
                if (item.linkTarget.indexOf(location.host)!=-1) {//当前web应用
                    let _result = item.linkTarget.split(/\:\/\/|\/|\?/g);//[http,host,pathName,queryStr];
                    let _path = '/';
                    if (_result.length>2) {
                        _path = _result[2]?_result[2]:'/';
                        if (_result.length>3) {
                            _path = _path + '?' + _result[3];
                        }
                    }
                   this.$router.push({path:_path});
                }else{
                    location.href = item.linkTarget;
                }
            } else {
                if(this.$props.orgin=='home'){
                    this.$emit("toDetaile",item);
                    return;
                }
                let pathname = location.pathname;
                let toPath = /cms/.test(pathname) ? 'cms_purchase_goods_detail' : 'goods_detail';
                this.$router.push({path: toPath, query: {goodsId:item.goodsId }});
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.banner-container{
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
}
</style>
