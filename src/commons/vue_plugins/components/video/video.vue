<template lang="html">
    <div class="vue-video" ref="videoLayoutRef">
        <video-player class="video-js vjs-big-play-centered" 
                    :options="playerOptions" 
                    :playsinline="true"
                    @play="onPlayerPlay($event)"
                    @pause="onPlayerPause($event)"
                    v-if="show"
                    ></video-player>
  </div>
</template>

<script>
import {clientEnv, timeout} from 'common.env';
export default {
    props: ['playerOptions'],
    data(){
        return {show:false};
    },
    mounted () {
        this.$nextTick(()=>{
            this.show = true;
            this.setVideoDom();  
        });
    },
    methods: {
        setVideoDom(){
            if(clientEnv.android){
                 timeout(()=>{
                    let _videoLayoutRef = this.$refs.videoLayoutRef;
                    let _videDom = _videoLayoutRef.querySelector('video');
                    if(_videDom){
                        _videDom.setAttribute('x-webkit-airplay', 'true');
                        _videDom.setAttribute('playsinline', 'true');
                        _videDom.setAttribute('webkit-playsinline', 'true');
                        //_videDom.setAttribute('x5-video-player-type', 'h5');
                        _videDom.setAttribute('x5-playsinline', 'h5');
                        _videDom.setAttribute('x5-video-player-fullscreen', 'false');
                    }
                 },100);
            }
        },
        onPlayerPlay(player) {
            console.log('player play!', player);
            //player.enterFullWindow();
        },
        onPlayerPause(player) {
            console.log('player pause!', player);
            if(clientEnv.android){
                this.show=false;
                timeout(()=>{
                    this.show= true;
                    this.setVideoDom();  
                });
            }
        },
        // ...player event

        // or listen state event
        playerStateChanged(playerCurrentState) {
            // console.log('player current update state', playerCurrentState)
        },

        // player is ready
        playerReadied(player) {
            console.log('the player is readied', player)
            // you can use it to do something...
            // player.[methods]
        }
    }
}
</script>

<style lang="scss">
.vue-video {
    position: relative!important;
    width: 100%;
    height: 100%;
    .video-center {
        margin: 0;
    }
}

.video-js {
    width: 100%;
    height: 100%;
}

.video-js .vjs-big-play-button .vjs-icon-placeholder:before,
.video-js .vjs-modal-dialog,
.vjs-button > .vjs-icon-placeholder:before,
.vjs-modal-dialog .vjs-modal-dialog-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.video-js .vjs-big-play-button .vjs-icon-placeholder:before,
.vjs-button > .vjs-icon-placeholder:before {
    text-align: center;
}

.video-js .vjs-big-play-button .vjs-icon-placeholder:before,
.video-js .vjs-play-control .vjs-icon-placeholder,
// .vjs-icon-play {
//     font-family: VideoJS;
//     font-weight: normal;
//     font-style: normal;
// }
.video-js .vjs-big-play-button .vjs-icon-placeholder:before,
.video-js .vjs-play-control .vjs-icon-placeholder:before,
.vjs-icon-play:before {
    content: "\f101";
}

.video-js .vjs-big-play-button {
    font-size: 0.9rem;
    line-height: 0.9rem;
    height: 0.9rem;
    width: 0.9rem;
    display: block;
    position: absolute;
    padding: 0;
    cursor: pointer;
    opacity: 1;
    border: 2px solid #fff;
    background-color: #2B333F;
    background-color: rgba(43, 51, 63, 0.7);
    -webkit-border-radius: 0.45rem;
    -moz-border-radius: 0.45rem;
    border-radius: 0.45rem;
    -webkit-transition: all 0.4s;
    -moz-transition: all 0.4s;
    -ms-transition: all 0.4s;
    -o-transition: all 0.4s;
    transition: all 0.4s;
}

.vjs-big-play-centered .vjs-big-play-button {
    top: 50%;
    left: 50%;
    margin-top: -0.45rem;
    margin-left: -.45rem;
}

.video-js .vjs-big-play-button:focus,
.video-js:hover .vjs-big-play-button {
    border-color: #fff;
    background-color: #73859f;
    background-color: rgba(115, 133, 159, 0.5);
    -webkit-transition: all 0s;
    -moz-transition: all 0s;
    -ms-transition: all 0s;
    -o-transition: all 0s;
    transition: all 0s;
}

.vjs-controls-disabled .vjs-big-play-button,
.vjs-error .vjs-big-play-button,
.vjs-has-started .vjs-big-play-button,
.vjs-using-native-controls .vjs-big-play-button {
    display: none;
}

.vjs-has-started.vjs-paused.vjs-show-big-play-button-on-pause .vjs-big-play-button {
    display: block;
}
</style>
