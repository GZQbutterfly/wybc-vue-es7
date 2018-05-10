<template lang="html">
    <div>
        <input type="number" maxlength="6" @input="textInput()" pattern="[0-9]*" class="vir-input" ref="virInput"  v-model="password"  v-focus>
        <div class="password-inputs">
            <!--  -->
            <div @click="weakupKeybord" class="item" v-for="i in passwordItem" :key="i">{{password[i]!=null?'●':''}}</div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
         passwordItem: {
            type: Array,
            default: () => [0,1,2,3,4,5]
        },
        over:{
            type: Function,
        }
    },
    data(){
        return {
            password:[],
        }
    },
    mounted(){
    },
    methods:{
        textInput(){
            if (this.password.length == 6) {
                this.$props.over(this.password);
                this.password = [];
            } 
        },
        weakupKeybord(){
            this.$refs.virInput.focus();
        }
    },

  
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
    .vir-input{
        position: absolute;
        width: 10px;
        line-height: 0;
        right: -100px;
        top: -100px;
        color:transparent;
        z-index: -10000;
    }
</style>
