<template>
    <div class="scrolltab-component-container">
        <ul class="scrolltab-nav" ref="navbox">
            <li 
               class="scrolltab-item"
               v-for="(item, key) in navList"
               :key="key"
               :ref="`tabitem_${key}`"
               :class="activeIndex == key ? 'scrolltab-active' : ''"
               @click="scrollTo(key)">
                <label class="scrolltab-title">{{item.label}}</label>
            </li>
        </ul>
        <div class="scrolltab-content" ref="scrollView">
            <div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">
    import BScroll  from '../../../assets/bscroll/bscroll';
    import { findIndex } from 'lodash';
    export default {
        name: 'app-scrolltab',
        data() {
            return {
                scrolling: false,
                navList: [],
                activeIndex: this.index,
                timer: null,
                navtop: 0,
                topList: [],
                firstItemTop: 0
            }
        },
        props: {
            index: {
                validator(val) {
                    return /^(([1-9]\d*)|0)$/.test(val);
                },
                default: 0
            },
            callback: {
                type: Function
            }
        },
        methods: {
            init() {
                this.scrollView = this.$refs.scrollView;

                const scroll = this.scrollUI = new BScroll(this.scrollView,{
                    probeType: 3,
                    scrollbar: {
                        fade: true,
                        interactive: false,
                        width: 3 
                    },
                    click:true
                });

                scroll.on('scroll', this.scroll);

                this.contentOffsetTop = this.scrollView.getBoundingClientRect().top;

                this.bindEvent();
            },
            scroll(pos){
                let y = Math.abs(pos.y);
                let mY = -this.scrollUI.maxScrollY;
                let _index = -1;
                if(y >= mY - 10){
                    _index = this.topList.length - 1;
                }else{
                    for(let i = this.topList.length - 1; i > 0; i--){
                        let _a = this.topList[i].top;
                        let _b = this.topList[i-1].top;
                        if( y <= _a && y > _b ){
                            _index = i - 1;
                            break;
                        }
                    }
                    _index =  _index;
                }
                if(_index != -1){
                   this.activeIndex = _index;
                }
            },
            scrollTo(index){
                this.activeIndex = index;
                let mY = -this.scrollUI.maxScrollY;
                let y = this.topList[index].top;
                y = y > mY ? mY : y;
                this.scrollUI.scrollTo(0, -y);
            },
            addItem(panel, itemRef) {
                this.navList.push(panel);
                setTimeout(()=>{
                    let _top = itemRef.getBoundingClientRect().top;
                    if(this.firstItemTop){
                       let _diffTop = _top - this.firstItemTop;
                       let mY = -this.scrollUI.maxScrollY;
                       _diffTop = _diffTop > mY ? mY : _diffTop;
                       this.topList.push({dom: itemRef, top: _diffTop});
                    }else{
                       this.topList.push({dom: itemRef, top: 0});
                       this.firstItemTop = _top;
                    }
                }, 100);
            },
            refreshItemHeight(){
                setTimeout(()=>{
                    let _currentY = -this.scrollUI.y;
                    let _newList = [];
                    _newList.push(this.topList[0]);
                    // console.log('before', this.topList, _currentY);
                    for(let i = 1, len = this.topList.length ; i <len; i++ ){
                        let _item = this.topList[i];
                        let _dom = _item.dom;
                        if(_dom){
                            let _top = _dom.getBoundingClientRect().top;
                            let _diffTop = _top - this.firstItemTop + _currentY;
                            let mY = -this.scrollUI.maxScrollY;
                            _diffTop = _diffTop > mY ? mY : _diffTop;
                            _newList.push({dom: _dom, top: _diffTop});
                        }
                    }
                    // console.log('after', _newList);
                    this.topList = _newList;
                }, 100);      
            },
            getPanels() {
                return this.$children.filter(item => item.$options.name === 'app-scrolltab-panel');
            },
            bindEvent() {
                this.scrollView.addEventListener('scroll', this.scrollHandler);
                window.addEventListener('resize', this.scrollHandler);
            },
            setDefault() {
                this.getPanels().every((panel, index) => {
                    if (this.activeIndex === index) {
                        this.moveHandler(index);
                        return false;
                    }
                    return true;
                });
            },
            moveHandler(index) {
                this.activeIndex = index;

                this.scrollContent(index);
            },
            scrollContent(index) {
                if (this.scrolling) return;
                this.scrolling = true;

                const itemOffsetTop = this.getPanels()[index].$el.getBoundingClientRect().top;
                this.scrollView.scrollTop = itemOffsetTop + this.scrollView.scrollTop - this.contentOffsetTop + 2;

                setTimeout(() => {
                    this.scrolling = false;
                }, 10);
            },
            navInView(index = 0) {
                const navitem = this.$refs['tabitem_' + index][0];
                const height = ~~navitem.offsetHeight;

                if (navitem.offsetTop - height <= this.navtop) {
                    this.navtop -= height;
                } else {
                    if (navitem.offsetTop + height * 3 >= this.scrollView.offsetHeight) {
                        this.navtop += height;
                    }
                }

                this.$refs.navbox.scrollTop = this.navtop;
            },
            scrollHandler() {
                if (this.scrolling) return;

                const panels = this.getPanels();
                const panelsLength = panels.length;
                const scrollBox = this.scrollView;
                const scrollBoxHeight = scrollBox.offsetHeight;
                const scrollBoxTop = scrollBox.scrollTop;
                const panelItemHeight = panels[0].$el.offsetHeight;

                if (scrollBoxTop >= panelItemHeight * panelsLength - scrollBoxHeight) {
                    this.activeIndex = panelsLength - 1;
                    return;
                }

                panels.forEach((panel, index) => {
                    if (panel.$el.getBoundingClientRect().top <= this.contentOffsetTop) {
                        this.activeIndex = index;
                    }
                });
            }
        },
        watch: {
            navList() {
                this.setDefault();
            },
            activeIndex(index) {
                this.navInView(index);
                this.callback && this.callback(index);
            },
            index(index) {
                this.scrollContent(index);
                this.activeIndex = index;
            }
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            this.scrollView.removeEventListener('scroll', this.scrollHandler);
            window.removeEventListener('resize', this.scrollHandler);
        }
    }
</script>

<style lang="scss">
@import './scrolltab.scss';
</style>
