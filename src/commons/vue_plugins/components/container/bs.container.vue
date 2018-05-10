<template>
    <div class="bs-layout-container">
        <slot name="header"></slot>
        <div class="bs-layout-main" ref="mainRef" @click="clickDom">
            <div class="bs-layout-content">
                <slot></slot>
            </div>
        </div>
        <slot name="footer"></slot>
    </div>
</template>

<script>
import BScroll from '../../../assets/bscroll/bscroll';
export default {
    props:{
        scrollbar: {
            type: Boolean,
            default: false
        }
    },
    mounted () {
        this.$nextTick(()=>{
            this.initPage();
        });
    },
    methods: {
        initPage(){
            const scroll = this.scroll = new BScroll(this.$refs.mainRef,{
                click:true,
                bounce: false
            });

            scroll.on('click', ()=>{
               
            });
        },
        clickDom(){
            console.log(12312313);
            // this.scroll.stop();// 立即停止动画
        }
    }

}
</script>

<style lang="scss">
.bs-layout-container{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    .bs-layout-main{
        height: 100%;
        width: 100%;
    }
}
</style>
