<template lang="html">
    <div class="scroller-layout" ref="scrollerLayout"
      @touchstart="touchStart($event)"
      @touchmove="touchMove($event)"
      @touchend="touchEnd($event)"
      >
      <scroller :on-refresh="onRefresh" ref="my_scroller" :on-infinite="onInfinite" class="scroller" v-if="show" :LRShakeflag="LRShakeflag" 
                :monitoringMove="monitoringMoveFn" :showNoData="showNoData">
        <div slot="refresh-spinner" style="height:160px;">
          <img :src="pulImgSrc" alt="" style="height:0.3rem;width:0.2rem;">
        </div>
        <slot></slot>
        <div id="main" class="spinner" slot="infinite-spinner">
          <div class="loadingBox">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </scroller>
      <!-- bg-c-f2f2f2 -->
      <div v-if="createPage && currentPage.page" 
           v-show="showPage"
           class="scroller-pages text-c-fff bg-c-b8b8b8 text-center text-s-15" 
           :style="{bottom: defaultPages.bottom}">
           {{currentPage.page}}/{{currentPage.maxPage}}
      </div>
	</div>	
</template>

<script>
import {getParentDomHeight, timeout} from 'common.env';
import {debounce} from 'lodash';
export default {
  props: {
	  refresh: {
		  type: Function,
		  default: ()=>{}
	  },
	  infinite: {
		  type: Function,
		  default: null
	  },
	  LRShakeflag: {
		  type: Boolean,
		  default: false
	  },
	  monitoringMove: {
		  type: Function,
		  default: ()=>{}
	  },
	  pages: {
		  type: Object,
		  default: ()=>{ return {page: 1, total: 0}}
    },
    showNoData:{
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      show: false,
      onRefresh() {},
      onInfinite: null,
      currentPage: {page: 1, total: 10, maxPage: 1},
      createPage: false,
      showPage: false,
      pulImgSrc: require("../../../../static/images/newshop/pul.gif")
    };
  },
  mounted() {
    let _self = this;
    this.$nextTick(() => {

      this._refreshC = debounce(_self.refreshC, 10).bind(this);
      this._infiniteC = debounce(_self.infiniteC, 10).bind(this);

      _self.preWithTabsBd();
      _self.onRefresh = _self.$props.refresh ? this._refreshC : null;
      // _self.onInfinite = _self.$props.infinite ? _self.infiniteC : null;
      if(_self.$props.infinite){
        _self.$set(_self, 'onInfinite',  this._infiniteC);
      }
    
      _self.show = true;
      setTimeout(()=>{
          _self.myScroller = _self.$refs.my_scroller;
      }, 500);
      _self.swtichPage();
      _self.defaultPages = {..._self.pages};
      let _page = (+_self.pages.page) || 0;
      _self.currentPage =  {page: _page, total: _self.pages.total, maxPage: _page + 1};
      _self.pageReaArr = [0, 0];
      _self.$watch('pages.total', _self.watchTotal);
      // _self.$watch('pages.page', _self.watchPage);
    });
  },
  methods: {
    // 处理tabs 内容体的高度异常
    preWithTabsBd() {
      // 在某些低版本的浏览器内核，导致父元素的高度，子元素不继承，现做以下处理 :pages="{page:page, total: classfyGoodsList.length}"
      setTimeout(() => {
        let _scrollerLayout = this.$refs.scrollerLayout;
        if (_scrollerLayout && !_scrollerLayout.offsetHeight) {
          let _height = getParentDomHeight(_scrollerLayout.parentElement);
          _scrollerLayout.style.height = _height + "px";
        }
      }, 10);
    },
    refreshC(done) {
      let _self = this;
      if (_self.$props.refresh) {
        _self.$props.refresh(done);
        _self.checkPage();
      }
    },
    infiniteC(done) {
      let _self = this;
      if (_self.$props.infinite) {
        _self.$props.infinite(done);
        _self.checkPage();
      }
    },
    monitoringMoveFn(offset) {
      //   console.log(offset);
      this.monitoringMove && this.monitoringMove(offset);
      if(!this.showPage){
        return;
      }
      let top = offset.top;
      let index = this.diffPageTop(top);
      // console.log('diff page: ', index, top, this.pageReaArr);
      this.currentPage.page = index;
    },
    diffPageTop(top){
      let _self = this;
      let _arr = _self.pageReaArr;
      let num = 1;
      if(!_arr.length || top < 0){
        return num;
      }
      let _len = _arr.length  - 1;
      num = _len;
      let isFind = false;
      for(let i = _len; i >=0 ; i--){
        let _v = _arr[i];
        let _top = top + 20;
        let _i = i - 1;
        // console.log(_top, _i , _arr[_i], i);
        if(_top < _v && _top > _arr[_i]){
          num = i;
          isFind = true;
          break;
        }
      }
      // console.log(num, top, _arr[num], _arr, isFind);
      isFind ? num-- : num ;
      let page = this.pages.page;
      num = num > page ? page : num;
      return num  || 1;
    },
    checkPage(){
      if(!this.showPage){
        return;
      }
      let _self = this;
      setTimeout(()=>{
        let page = this.pages.page;
        let offset = this.myScroller.getPosition();
        if(!_self.pageReaArr[page]){
          _self.pageReaArr[page] = offset.top;
          _self.currentPage.maxPage = page;
        }
      }, 500);	
    },
    watchPage(newVal, oldVal){
      console.log('change pages: ', newVal, oldVal, this.pages.page);
      if(newVal != oldVal){

      }
    },
    watchTotal(newVal, oldVal){
      if(newVal != oldVal){
        this.currentPage.total = newVal;
      }
      this.swtichPage();
    },
    swtichPage(){
      let _self = this;
      if(_self.pages.total){
        _self.createPage = true;
        // _self.showPage = true;
        // timeout(()=>{
        //   _self.showPage = false;
        // }, 500);
      }
    },
    closeInfinite(){
      this.$set(this, 'onInfinite', null);
    },
    openInfinite(){
      this.$refs.my_scroller.resetLoadingState();
      this.$set(this, 'onInfinite',  this._infiniteC);
    },
    touchStart(e){

    },
    touchMove(e){
      let _self = this;
      if(_self.pages.total){
        _self.showPage = true;
      }
    },
    touchEnd(e){
      let _self = this;
      timeout(()=>{
        _self.showPage = false;
      }, 1500);
    },
  }
};
</script>

<style lang="scss">
.scroller-layout {
  position: relative;
  .scroller-pages {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 60px;
    margin: auto;
    width: 68px;
    height: 18px;
    line-height: 18px;
    border-radius: 10px;
    opacity: 0.7;
  }
}

.scroller {
  .pull-to-refresh-layer .spinner-holder {
    img {
      position: relative;
      top: 0.15rem;
    }
  }
  #main {
    width: 100%;
    height: 0.4rem;
    display: inline-block;
    a {
      display: block;
      text-align: center;
      font-size: 15px;
    }
    .loadingBox {
      width: 1.5rem;
      height: 0.1rem;
      margin: 0 auto;
      text-align: center;
    }
    .loadingBox span {
      display: inline-block;
      width: 0.1rem;
      height: 0.1rem;
      margin-right: 0.05rem;
      background: lightgreen;
      -webkit-animation: load 1.04s ease infinite;
      animation: load 1.04s ease infinite;
    }
    .loadingBox span:last-child {
      margin-right: 0px;
    }
    @-webkit-keyframes load {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    @keyframes load {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    .loadingBox span:nth-child(1) {
      -webkit-animation-delay: 0.13s;
      animation-delay: 0.13s;
    }
    .loadingBox span:nth-child(2) {
      -webkit-animation-delay: 0.26s;
      animation-delay: 0.26s;
    }
    .loadingBox span:nth-child(3) {
      -webkit-animation-delay: 0.39s;
      animation-delay: 0.39s;
    }
    .loadingBox span:nth-child(4) {
      -webkit-animation-delay: 0.52s;
      animation-delay: 0.52s;
    }
    .loadingBox span:nth-child(5) {
      -webkit-animation-delay: 0.65s;
      animation-delay: 0.65s;
    }
  }
}
</style>
