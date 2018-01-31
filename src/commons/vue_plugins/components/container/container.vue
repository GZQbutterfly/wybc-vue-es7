<template>
    <div class="app-container" @touchstart="touchStart($event)" @touchmove="touchMove($event)" @touchend="touchEnd($event)" ref="containerRef">
        <slot name="header"></slot>
        <div class="app-container__bd" ref="contentRef">
            <div class="app-container__main" v-show="showContent" ref="mainRef">
                <slot></slot>
            </div>
        </div>
        <slot name="footer"></slot>
    </div>
</template>



<script>
import Scroller from '../../../assets/scroller/core';
import getContentRender from '../../../assets/scroller/render';
import {debounce} from 'lodash';


export default {
    props: {
        width: {
            type: Number,
            default: 0
        },
        height: {
            type: Number,
            default: 0
        },
        callBack:{
            type: Function,
            default:()=>{}
        }
    },
    data() {
        return {showContent: false};
    },
    mounted () {
        this.$nextTick(() => {
            this.initContainer();
            this.showContent = true;
        });
    },
    beforeDestroy() {
        let _self = this;
        window.clearInterval(_self.resizeTimer);
        window.removeEventListener('resize', _self.debounceArea);
    },
    methods: {
        initContainer() {
            let _self = this;
            let _$refs = _self.$refs;
            _self.container = _$refs.containerRef;
            if (_self.width) {
                _self.container.style.width = _self.width;
            }
            if (_self.height) {
                _self.container.style.height = _self.height;
            }
            _self.content = _$refs.contentRef;
            // 设置内容体的最小高度
            _self.mainRef = _$refs.mainRef;
            if(_self.mainRef.childElementCount == 1){
                _self.mainRef.firstChild.style.minHeight = _self.content.offsetHeight + 'px';
            }
            // ==>
            let render = getContentRender(_self.content);
            _self.scroller = new Scroller(render, {
                scrollingX: false,
                snapping: false,
                animating: true,
                animationDuration: true,
                bouncing: false
            });
            // setup scroller
            let rect = _self.container.getBoundingClientRect();
            _self.scroller.setPosition(rect.left + _self.container.clientLeft, rect.top + _self.container.clientTop);
            const getContentSize = () => {return {width: _self.content.offsetWidth,height: _self.content.offsetHeight};};
            let _contentSize = getContentSize();
            _self.getContentSize = getContentSize;
            _self.content_width = _contentSize.width;
            _self.content_height = _contentSize.height;
            _self.debounceArea = debounce(_self.reArea, 500);
            _self.isResize = false;
            window.addEventListener('resize',()=>{
                _self.isResize = !_self.isResize;
                _self.debounceArea();
            });
        },
        reArea() {
            let _self = this;
            let { width, height } = _self.getContentSize();
            if (width !== _self.content_width || height !== _self.content_height) {
                _self.content_width = width;
                _self.content_height = height;
                _self.resize();
            }         
        },
        resize() {
            let _self = this;
            let container = _self.container;
            let content = _self.content;
            _self.scroller.setDimensions(container.clientWidth, container.clientHeight, content.offsetWidth, content.offsetHeight);
        },
        scrollTo(x, y, animate) {
            let _self = this;
            _self.scroller.scrollTo(x, y, animate);

        },
        scrollBy(x, y, animate) {
            let _self = this;
            _self.scroller.scrollBy(x, y, animate);
        },
        touchStart(e) {
            let _self = this;
            // Don't react if initial down happens on a form element
            if (e.target.tagName.match(/input|textarea|select/i)) {             
                return;
            };
            _self.reArea();
            _self.scroller.doTouchStart(e.touches, e.timeStamp);
        },
        touchMove(e) {
            let _self = this;
            e.preventDefault();
            let activeElement = document.activeElement;
            if (/input/i.test(activeElement.tagName) && !_self.isResize) {
                _self.callBack();
            }
            _self.scroller.doTouchMove(e.touches, e.timeStamp);
        },
        touchEnd(e) {
            let _self = this;
            _self.scroller.doTouchEnd(e.timeStamp);
        }
    }
}
</script>


<style lang="scss" scoped>
.app-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    user-select: none;
    &__bd {
        width: 100%;
        min-height:100%;
        transform-origin: left top;
        transform: translateZ(0);
    }
}
</style>
