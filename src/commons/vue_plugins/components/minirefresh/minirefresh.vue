<template>
   <div class="minirefresh-wrap" ref="minirefreshRef">
        <div class="minirefresh-scroll">
           <slot></slot>
        </div>
    </div>
</template>

<script>
import MiniRefresh from '../../../assets/minirefresh/debug/minirefresh';
import '../../../assets/minirefresh/debug/minirefresh.css';
export default {
    props: {
        refresh:{
            type:Function,
            default: ()=>{}
        },
        infinite:{
            type:Function,
            default: ()=>{}
        },
        autoLoad:{
            type: Boolean,
            default: true
        }
    },
    mounted () {
        this.$nextTick(()=>{
             this.renderMiniRefresh();
        });
    },
    methods: {
        renderMiniRefresh(){
            let _self = this;
            _self.miniRefresh = new MiniRefresh({
                    container: _self.$refs.minirefreshRef,//'#minirefresh',
                    down: {
                        callback() {
                           _self.refresh(_self.downLoadedDone);
                        }
                    },
                    up: {
                        toTop: { isEnable:false},
                        isAuto: _self.autoLoad,
                        callback () {
                           _self.infinite(_self.upLoadedDone);
                        }
                    }
            });
            _self.$refs.minirefreshRef.miniRefresh = _self.miniRefresh;
        },
        downLoadedDone(flag){
            flag && this.miniRefresh.endDownLoading();
        },
        upLoadedDone(flag){
            if(flag){
                this.miniRefresh.endUpLoading(true);
                setTimeout(()=>{
                    //this.miniRefresh.resetUpLoading();
                }, 500);
            }else{
                this.miniRefresh.endUpLoading(false);
            }
        }
    }
}
</script>

<style lang="scss">

</style>

