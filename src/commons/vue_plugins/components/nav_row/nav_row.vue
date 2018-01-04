<template lang="html">
    <div class="navRow">
        <div class="swiper-container" ref="navSwiper">
            <div class="swiper-wrapper">
                <div class="swiper-slide" v-for="(item,index) in navList">
                    <div :class="[activatedIndex==index?'active':'']" @click="itemSelect(index,item)">
                        <img :src="activatedIndex==index?item.selectedImgUrl:item.unselectedImgUrl" />
                        <b >{{item.classifyName}}</b>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script >
import Swiper from 'swiper';

export default {
    props: ['navList', 'constIndex', 'excludeIndex'],
    data() {
        return {
            activatedIndex: 0
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.swiper = new Swiper(this.$refs.navSwiper, {
                slidesPerView: 4.5,
                observer: true,
                freeMode: true,
            });
        });
    },
    methods: {
        itemSelect(index, data) {
            if (!this.$props.constIndex && this.$props.excludeIndex != index) {
                this.activatedIndex = index;
                if (this.swiper) {
                    this.swiper.slideTo(index)
                }
            } else if (this.activatedIndex != index) {
                this.$emit('on-change', index, data);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.navRow {
    height: 0.5rem;
    width: 100%;
    .swiper-container {
        width: 100%;
        height: 100%;
        .swiper-wrapper {
            width: 100%;
            height: 100%;
        }
        .swiper-slide {
            height: 100%;
            div {
                height: 0.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                img {
                    width: 0.18rem;
                    height: 0.18rem;
                }
                b {
                    font-weight: normal;
                    font-size: 0.15rem;
                    display: block;
                    height: 0.2rem;
                    line-height: 0.22rem;
                }
            }
            .active {
                color: #7dcc43;
            }
        }
    }
}
</style>
