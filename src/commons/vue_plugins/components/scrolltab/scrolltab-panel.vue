<template>
    <div class="scrolltab-content-item" ref="itemRef">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'app-scrolltab-panel',
    props: {
       opts: Object
    },
    mounted() {
        this.$nextTick(()=>{
            this.$parent.addItem(this.opts, this.$refs.itemRef);
        });
    }
}
</script>
