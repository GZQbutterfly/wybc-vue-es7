<template  lang="html">
  <div class="password-keyboard">
        <ul>
          <li @click="keyUpHandle($event)" v-for="val in keys"  :key="val">
            {{ val }}
          </li>
          <li class="del " @click="delHandle"><i class="icon iconfont icon-shanchu"></i></li>
        </ul>
    </div>
</template>
<script>
export default {
    data() {
        return {
        keys:[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0]
        };
    },
    props:[ 
        'keyUp',
        'del'
    ],
     methods: {
         keyUpHandle(event){
            let text = event.currentTarget.innerText
            if (this.$props.keyUp) {
                this.$props.keyUp(text);
            }
         },
         delHandle(){
            if (this.$props.del) {
                this.$props.del();
            }
         }
     }
    
}
</script>

<style lang="scss" scoped>
.password-keyboard {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        ul {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          li {
            width: 33.3333%;
            height: .55rem;
            line-height: .55rem;
            text-align: center;
            border-right: 1px solid #aeaeae;
            border-bottom: 1px solid #aeaeae;
            font-weight: bold;
            &:nth-child(1), &:nth-child(2), &:nth-child(3) {
              border-top: 1px solid #eee;
            }
            &:nth-child(3), &:nth-child(6), &:nth-child(9), &:nth-child(12) {
              border-right: none;
            }
            &:nth-child(10), &:nth-child(11), &:nth-child(12) {
              border-bottom: none;
            }
            &:nth-child(10), &:nth-child(12), &:active {
              background-color: #d1d4dd;
            }
            &:nth-child(12):active {
              background-color: #fff;
            }
          }
        }
      }
</style>