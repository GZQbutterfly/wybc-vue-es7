<template lang="html">
    <div class="loadding-container app-dialog">
        <div class="weui-mask"></div>
        <div class="loadding-content">
            <i class="weui-loading"></i>{{msg}}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        show: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            msg: '加载中...'
        }
    },
    mounted() {
        this.$nextTick(() => {

        });
    }
}
</script>

<style lang="scss" scoped>
.loadding-container {

    .weui-mask {
        opacity: 0.5;
    }
    .loadding-content {
        position: fixed;
        z-index: 5000;
        left: 40%;
        top: 45%;
        color: #fff;
        .weui-loading {
            width: 50px;
            height: 50px;
        }
    }
}
</style>
