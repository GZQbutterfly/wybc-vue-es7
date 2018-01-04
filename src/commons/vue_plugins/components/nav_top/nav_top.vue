<template lang="html">
    <div class="weui-flex">
      <div class="weui-flex__item">
        <div class="home" @click="goHome">
          <i class="iconfont icon-shouye"></i>
          <span>首页</span>
        </div>
      </div>
      <div class="weui-flex__item text-right">
        <div class="order" @click="goMine">
          <i class="iconfont icon-wode-"></i>
          <span>我的</span>
        </div>
      </div>
    </div>
</template>

<script>
export default {
    methods: {
        goHome() {
            this.$router.push({
                path: 'home',
            });
        },
        goMine() {
            this.$router.push({
                path: 'userinfo'
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.home {
    color: #ffd480;
}
.order {
    color: #6d9dff;
}
.home,
.order {
    display: inline-block;
    padding: 0 0.1rem;
    i {
        display: block;
        &::before {
            margin-left: 0;
            font-size: 0.23rem;
        }
    }
    span {
        margin-top: -.05rem;
        display: block;
        font-size: 0.115rem;
    }
}
</style>
