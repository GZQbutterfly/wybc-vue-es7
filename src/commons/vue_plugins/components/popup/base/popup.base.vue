<template lang="html">
    <div class="popup-layout app-dialog" ref="dialogRef">
        <div class="popup-mode" v-if="options.mode"></div>
        <div class="popup-container" :style="popupContainerStyle" ref="popupContainer">
            <!-- header -->
            <header class="popup-header" :class="{'layout-horizontal':options.direction=='h', 'layout-vertical': options.direction=='v'}">
                <div class="header" slot="header">
                    <div class="popup-header_hd">
                        <i :class="options.icon" v-if="options.icon"></i>
                    </div>
                    <div class="popup-header_bd" v-if="options.title">
                        <strong class="weui-dialog__title">{{options.title}}</strong>
                    </div>
                    <div class="popup-header_ft" v-if="options.close">
                        <i class="icon iconfont icon-cuowu" @click="fn(options.closeFn)"></i>
                    </div>
                </div>
            </header>
            <!-- content :style="popupBodyStyle"-->
            <section class="popup-body" >
                <div class="swiper-container popup-content" ref="popupSwiper">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide">
                            <slot></slot>
                        </div>
                    </div>
                    <div class="swiper-scrollbar" ref="popupSwiperScorllbar"></div>
                </div>
            </section>
            <!-- footer -->
            <footer class="popup-footer">
                <div class="toolbar" slot="footer">
                    <button class="popup-btn  default" v-if="options.assistBtn" @click="fn(options.assistFn)">
                        {{options.assistBtn}}
                    </button>
                    <button class="popup-btn main" v-if="options.mainBtn" @click="fn(options.mainFn)">
                        {{options.mainBtn}}
                    </button>
                </div>
            </footer>
        </div>
    </div>
</template>

<script>
import {
    merge
} from 'lodash';
import {
    timeout
} from 'common.env';
import Swiper from 'swiper';

export default {
    props: {
        options: {
            type: Object,
            default: {}
        }
    },
    data() {
        return this.popupInit();
    },
    mounted() {
        let _self = this;
        // this.setHTMLScollerYHidden(true);
        this.$nextTick(() => {
            this.renderSwiper();
            timeout(() => {
                let _dialogRef = this.$refs.dialogRef;
                _dialogRef.addEventListener('touchmove', function(e) {
                    e.preventDefault()
                });
            });
        });
    },
    methods: {
        renderSwiper() {
            let _self = this;
            // 渲染 swiper
            _self.swiper = new Swiper(_self.$refs.popupSwiper, {
                direction: 'vertical',
                slidesPerView: 'auto',
                freeMode: true,
                autoHeight: true,
                scrollbar: {
                    el: _self.$refs.popupSwiperScorllbar
                },
                observer: true,
                on: {
                    init() {
                        //console.log(this, this.params.swipeHandler);
                        setTimeout(() => {
                            if (this.scrollbar.el.style.display === 'none') {
                                // 滚动条隐藏的 添加不可滚动的属性
                                // console.log('滚动条隐藏的');
                                this.params.swipeHandler = '.swipe-handler';
                            }
                        }, 10);
                    }
                }
            });
        },
        popupInit() {
            let _self = this;
            let _bH = window.innerHeight;
            let _bW = window.innerWidth;
            let width = Math.ceil(_bW * 0.7);
            let height = Math.ceil(_bH * 0.50);
            let cH = _self.options.height * 0.6;

            if (_self.options.height <= 1) {
                cH = cH * _bH;
                _self.options.height = _self.options.height * 100 + '%';
            }
            let maxWidth = width > _self.options.width ? (width + 5): _self.options.width;


            return {
                popupContainerStyle: merge({
                    width: _self.options.width,
                    // height: _self.options.height,
                    // 'max-height': (height + 5) + 'px',
                    'max-width': maxWidth + 'px',
                }, _self.setAlgin(_self.options, width, _bW, height, _bH)),
                popupBodyStyle: {
                    height: cH + 'px'
                }
            };
        },
        setAlgin(options, w, bW, h, bH) {
            let _self = this;
            let _algin = options.algin;
            let _result = {};
            if (_algin == 'top') {

            } else if (_algin == 'right') {

            } else if (_algin == 'bottom') {

            } else if (_algin == 'left') {

            } else {
                // center
                // _result.left = _self.getRate(w, bW) + '%';
                // _result.top = _self.getRate(h, bH) + '%';
            }
            return _result;
        },
        getRate(s, t) {
            //console.log(s, t, (1 - (s / t)));
            return Math.ceil((1 - (s / t)) * 100) / 2;
        },
        //获取元素的纵坐标
        // getTop(e) {
        //     let offset = e.offsetTop;
        //     if (e.offsetParent != null) offset += this.getTop(e.offsetParent);
        //     return offset;
        // }
        resizePopup() {
            let _self = this;
            _self.options.resize && _self.options.resize();
            //console.log('resize popup ........ ');
        },
        fn(callBack) {
            this.close();
            callBack && callBack(this);
        },
        close() {
            this.$el.remove();
        }
    }
}
</script>

<style lang="scss">
.popup-layout {
    font-size: 18px;
    box-sizing: content-box;
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 5050;
    display: flex;
    align-items: center;
    .popup-mode {
        // background-color: #ccc;
        opacity: 0.5;
        background: rgba(0, 0, 0, 0.6);
        left: 0;
        bottom: 0;
        right: 0;
        top: 0;
    }
    .popup-container {
        position: relative;
        margin: auto;
        background-color: #fff;
        border-radius: 10px;
        .swiper-container {
            width: 100%;
            height: 100%;
            .swiper-slide {
                height: auto;
            }
        }
    }
    .popup-header {
        padding: 10px 0;
        .header {
            display: flex;
            align-items: flex-start;
            position: relative;
        }
        // .popup-header_hd {
        //     }
        .popup-header_bd {
            flex: 1;
            text-align: center;
        }
        .popup-header_ft {
            position: absolute;
            right: 15px;
            top: 1px;
        }
        .icon {
            position: relative;
            top: -8px;
        }
    }
    .popup-body {
        padding-left: 10px;
        padding-right: 10px;
        word-wrap: break-word;
        word-break: break-all;
        color: #999;
        font-size: 15px;
        height: 60%;
        padding-bottom: 60px;
    }
    .popup-footer {
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        // border-top: 1px solid #d5d5d6;
        // z-index: 7000;
        .toolbar {
            display: flex;
            width: 100%;
        }
        button {
            text-align: center;
            font-size: 18px;
            border: none;
            height: 48px;
            background-color: #fff;
            &:active {
                background-color: #EEE;
            }
            &:focus {
                outline: none;
            }
            &:only-child {
                border-bottom-left-radius: 10px;
                border-bottom-right-radius: 10px;
            }
        }
        .popup-btn {
            flex: 1;
            &.default {
                //border-right: 1px solid #d5d5d6;
                background-color: #f5f5f5;
                color: #8f8f8f;
                border-bottom-left-radius: 10px;
            }
            &.main {
                background-color: #7ecc44;
                color: #e5f4da;
                border-bottom-right-radius: 10px;
            }
        }
    }
}

/* 子元素 水平*/

.layout-horizontal {
    .popup-header_hd {
        text-align: left;
    }
    .popup-header_bd {
        text-align: left;
    }
    .popup-header_ft {
        text-align: right;
    }
}

/* 子元素 垂直*/

.layout-vertical {
    text-align: center;
}

.not-scoller-y {
    overflow-y: hidden;
}
</style>
