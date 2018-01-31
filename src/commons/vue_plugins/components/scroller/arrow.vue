<template>
    <svg viewBox="0 0 63.657 63.657" style="enable-background:new 0 0 63.657 63.657;" xml:space="preserve" width="20px" height="20px">
        <polygon points="31.891,63.657 0.012,35.835 2.642,32.821 31.886,58.343 61.009,32.824 63.645,35.832" :fill="fillColor"/>
        <rect x="29.827" width="4" height="60" :fill="fillColor"/>  
    </svg>
</template>
<script>
export default {
  props: {
    fillColor: {
      type: String,
      default: "#AAA"
    }
  }
};
</script>