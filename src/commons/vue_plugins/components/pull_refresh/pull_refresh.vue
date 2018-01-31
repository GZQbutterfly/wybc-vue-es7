<template lang="html">
    <scroller :on-refresh="onRefresh" ref="my_scroller" :on-infinite="onInfinite" class="scroller" v-if="show" :LRShakeflag="LRShakeflag">
        <div slot="refresh-spinner" style="height:160px;">
            <img :src="pulImgSrc" alt="" style="height:0.3rem;width:0.2rem;">
        </div>
        <slot></slot>
        <div id="main" class="spinner" slot="infinite-spinner">
            <div class="loadingBox">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </scroller>
</template>



<script>
export default {
	props: ['refresh', 'infinite', 'LRShakeflag'],
	data(){
		return {show: false,onRefresh(){},onInfinite(){}, pulImgSrc: require('../../../../static/images/newshop/pul.gif') }
	},
    mounted(){
		let _self = this;
		this.$nextTick(()=>{
			_self.onRefresh = _self.$props.refresh ? _self.refreshC : null;
			_self.onInfinite = _self.$props.infinite ? _self.infiniteC : null;
			_self.show = true;
		});
    },
    methods:{
        refreshC(done) {
            let self = this;
            if (self.$props.refresh) {
                self.$props.refresh(done);
            }
        },
        infiniteC(done) {
            let self = this;
            if (self.$props.infinite) {
                self.$props.infinite(done);
            }
        }
    }
}
</script>



<style lang="scss" scoped>
.scroller{
	.pull-to-refresh-layer .spinner-holder
	{
		img{
			position: relative;
			top: .15rem;
		}
	}
	#main{
			width: 100%;
			height: 0.4rem;
			display: inline-block;
		a{
			display: block;
			text-align: center;
			font-size: 15px;
		}
		.loadingBox{
			width: 1.5rem;
			height: 0.1rem;
			margin: 0 auto;
			text-align: center;
		}
		.loadingBox span{
			display: inline-block;
			width: 0.1rem;
			height: 0.1rem;
			margin-right: 0.05rem;
			background: lightgreen;
			-webkit-animation: load 1.04s ease infinite;
			animation: load 1.04s ease infinite;
		}
		.loadingBox span:last-child{
			margin-right: 0px;
		}
		@-webkit-keyframes load{
			0%{
				opacity: 1;
			}
			100%{
				opacity: 0;
			}
		}
		@keyframes load{
			0%{
				opacity: 1;
			}
			100%{
				opacity: 0;
			}
		}
		.loadingBox span:nth-child(1){
			-webkit-animation-delay:0.13s;
			animation-delay:0.13s;
		}
		.loadingBox span:nth-child(2){
			-webkit-animation-delay:0.26s;
			animation-delay:0.26s;
		}
		.loadingBox span:nth-child(3){
			-webkit-animation-delay:0.39s;
			animation-delay:0.39s;
		}
		.loadingBox span:nth-child(4){
			-webkit-animation-delay:0.52s;
			animation-delay:0.52s;
		}
		.loadingBox span:nth-child(5){
			-webkit-animation-delay:0.65s;
			animation-delay:0.65s;
		}

	}
}

</style>
