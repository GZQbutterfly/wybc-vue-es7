<template lang="html">
    <div class="password-inputs">
        <div class="item" v-for="i in passwordItem" :key="i">{{password[i]!=null?'●':''}}</div>
    </div>
</template>

<script>
export default {
    props: {
         passwordItem: {
            type: Array,
            default: () => [0,1,2,3,4,5]
        },
        password:{
            type: Array,
            default: () => []
        }
    }
}
</script>

<style lang="scss" scoped>
    .password-inputs{
        margin: 0 0.2rem;
        border: 1px solid #b9b9b9;
        display: flex;
        .item{
            flex: 1;
            line-height: .5rem;
            height: .5rem;
            text-align: center;
            border-right: 1px solid #b9b9b9;
            &:last-child {
                border-right: none;
            }
        }
    }
</style>
