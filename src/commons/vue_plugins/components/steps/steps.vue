<template>

    <div class="steps-list weui-flex" v-if="create">

        <div class="steps-item weui-flex__item flex-algin-m text-center" v-for="(item, index) in option.steps" :key="index" :style="{'width': rate}">
            <div>
                <i  :class="{'weui-icon-success': option.stepIndex == index, 'default': option.stepIndex < index, 'ok': option.stepIndex > index}"></i>
                <div class="step-line" v-if="index < len " :class="{'default-bgc': option.stepIndex <= index, 'ok-bgc': option.stepIndex > index}"></div>
            </div>
            <label >{{item.label}}</label>
        </div>
    </div>
  
</template>

<script>
export default {
  props: {
    option: {
      type: Object,
      default: { steps: [] }
    }
  },
  data() {
    return { create: false, len: this.$props.option.steps.length - 1, rate: (100/(this.$props.option.steps.length)) + '%' };
  },
  mounted() {
    this.$nextTick(() => {
      let _steps = this.$props.option.steps;
      _steps.length && (this.create = true);
    });
  }
};
</script>

<style lang="scss">
.steps-list {
  align-items: flex-end;
  .steps-item {
    position: relative;
    >div{
        height: 26px;
    }
    label {
      font-size: 12px;
      color: #808080;
    }
  }
  .default {
    position: relative;
    display: inline-block;
    margin: 12px 10px 0 10px;
    width: 6.5px;
    height: 6.5px;
    border-radius: 50%;
    background-color: #e6e6e6;
  }
  .default-bgc{
    background-color: #e6e6e6;
  }
  .ok {
    position: relative;
    display: inline-block;
    margin: 12px 10px 0 10px;
    width: 6.5px;
    height: 6.5px;
    border-radius: 50%;
    background-color: #7ecc44;
  }
  .ok-bgc{
    background-color: #7ecc44;
  }
  .step-line {
    display: inline-block;
    width: 75%;
    top: 30%;
    height: 2px;
    position: absolute;
  }
}
</style>
