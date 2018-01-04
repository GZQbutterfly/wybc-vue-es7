<template lang="html">
    <div v-if="show" class="toast-container app-dialog">
        <div class="weui-mask_transparent" v-if="mode"></div>
        <div class="weui-toast">
            <span>
                <i class="weui-icon_toast" :class="{'weui-icon-success-no-circle':success, 'icon iconfont icon-cha1': !success}">
                </i>
                <p class="weui-toast__content">{{title}}</p>
            </span>
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
        }
    },
    mounted() {
       this.$nextTick(() => {
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

<style lang="scss" scoped>
.toast-container {
    position: fixed;
    z-index: 30;
    left: 0;
    top: 0;
    right: 0;
    max-width: 200px;
    min-width: 120px;
    z-index: 7000;
    .weui-toast {
        width: inherit;
        max-width: 200px;
        min-width: 120px;
        left: inherit;
        margin: 0 auto;
        right: inherit;
        .icon {
            font-size: 25px;
        }
        .weui-toast__content {
            margin: 5px 15px;
            word-wrap: break-word;
        }
    }
}
</style>
