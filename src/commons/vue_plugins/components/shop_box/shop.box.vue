<template lang="html">
    <div class="shop-box">
        <div class="shop-box_hd">
            <img :src="shopIcon" alt="店铺图片">
        </div>
        <div class="shop-box_bd weui-flex">
            <div class="user-img"><img v-lazy="data.wdImg || defaulUserImg" alt="用户头像" @error="imgError"></div>
            <div class="user-shop">
               <div class="shopname text-ellipsis">{{data.wdName}}</div>
               <div class="schoolname">{{data.school}}</div>
            </div>
        </div>
    </div>
</template>
  
<script>
export default {
    props:['data'],
    data(){
        return {
            defaulUserImg: require('../../../../static/images/pic-login.png'),
            shopIcon: require('../../../../static/images/lead/che.png')
        }
    },
    mounted () {
        
    },
    methods: {
        imgError(e) {
            e.target.src = this.defaulUserImg;
        }
    }
};
</script>


<style lang="scss" scoped>
.shop-box{
    display: flex;
    flex-direction: column;
    background-color: #ebf6ff;
    border-radius: 5px;
    padding: 14px 12px;
    .shop-box_hd{
        flex:1;
        text-align: center;
        img{
            width: 76px;
            height: 72px;
        }
    }
    .shop-box_bd{
        align-items: center;
        margin-left: 10%;
        .user-img{
            width: 45px;
            height: 45px;
            margin-right: 10px;
        }
        img{
            width:inherit;
            height:inherit;
            border-radius: 50%;
        }
        .user-shop{
            color:#333;
            text-align: left;
            .shopname{
               font-size: 15px;
               max-width: 200px;
            }
            .schoolname{
               font-size: 12px;
            }
        }
    }
}
</style>



