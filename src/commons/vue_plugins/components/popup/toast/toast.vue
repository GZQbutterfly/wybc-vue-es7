<template lang="html">
    <div v-if="show" class="toast-container app-dialog">
        <div class="weui-mask_transparent" v-if="mode"></div>
        <div class="weui-toast" :style="{'max-width':width+'px'}">
            <i class="weui-icon_toast" :class="iconClass" v-if="iconClass">
            </i>
            <p class="weui-toast__content text-s-14" :class="{'noicon': !iconClass}">{{title}}</p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        show: {
            type: Boolean,
            default: true
        },
        title: {
            type: String,
            default: ''
        },
        time: {
            type: Number,
            default: 2000
        },
        success: {
            type: Boolean,
            default: true
        },
        mode: {
            type: Boolean,
            default: false
        },
        width:{
            type: Number,
            default: 200
        }
    },
    data(){
        return {
            iconClass: 'icon iconfont icon-cha1'
        }
    },
    mounted() {
       this.$nextTick(() => {
           if(this.$props.success !== null){
                this.iconClass = this.$props.success ? 'weui-icon-success-no-circle' : 'icon iconfont icon-cha1'
           }else{
                this.iconClass = '';
           }
           this.timer = window.setTimeout(() => {
               this.show = false;
           }, this.time);
       })
   },
   destroyed() {
       window.clearTimeout(this.timer);
   }
}
</script>

<style lang="scss">
.toast-container {
    position: fixed;
    z-index: 30;
    left: 0;
    top: 0;
    right: 0;
    z-index: 7000;
    .weui-toast {
        width: inherit;
        max-width: 150px;
        min-width: 80px;
        min-height: 50px;
        left: inherit;
        margin: 0 auto;
        right: inherit;
        .icon {
            font-size: 25px;
        }
        .weui-toast__content {
            margin: 5px 15px;
            word-wrap: break-word;
            // line-height: 50px;
            padding-bottom: 15px; 
        }
        .noicon {
            margin-top: 20px;
        }
    }
}
</style>
