<template lang="html">
    <div :class="{'weui-skin_android': android}" class="app-dialog tip-dailog" ref="dialogRef">
        <div class="weui-mask"></div>
        <transition name="popup">
            <div class="dialog-container weui-flex flex-align-m">
                <div class="weui-dialog" v-if="dialogObj" :style="dialogStyleObj">
                    <div class="weui-dialog__hd">
                        <div class="dialog_info_img"
                            :class="dialogObj.type"
                            v-if="dialogObj.type"
                            >
                            <i class="icon iconfont"
                            :class="{'icon-zhengque': dialogObj.type == 'success', 'icon-cuowu': dialogObj.type == 'error', 'icon-tanhao2': dialogObj.type == 'info'}"
                            ></i>
                        </div>
                        <strong class="weui-dialog__title">{{dialogObj.title}}</strong>
                    </div>
                    <div class="weui-dialog__bd" v-html="dialogObj.content">
                    </div>
                    <div class="weui-dialog__ft">
                        <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default dialog-first" v-if="dialogObj.assistBtn" @click="cbFn(dialogObj.assistFn)">{{dialogObj.assistBtn}}</a>
                        <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary dialog-last" @click="cbFn(dialogObj.mainFn)">{{dialogObj.mainBtn}}</a>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import {timeout} from 'common.env';
import childMixin from '../../../mixins';


export default {
    mixins: [childMixin],
    props: {
        android: {
            type: Boolean,
            default: false
        },
        dialogObj: {
            type: Object,
            default: () => {}
        },
        type: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            show: true,
            dialogStyleObj: {}
        }
    },
    mounted() {
        this.$nextTick(() => {
            timeout(() => {
                // this.getDialogStyleObj();
                let _dialogRef = this.$refs.dialogRef;
                _dialogRef.addEventListener('touchmove', function(e) {
                    e.preventDefault()
                });
            });
        });
    },
    methods: {
        cancel() {
            this.show = false;
            document.body.style.overflow = '';
            this.$emit('hide');
            'remove' in window.Element.prototype ? this.$el.remove() : this.$el.parentNode.removeChild(this.$el);
        },
        cbFn(fn) {
            fn && fn();
            this.cancel();
        },
        getDialogStyleObj() {
            let _self = this;
            _self.dialogStyleObj = {
                'top': _self.type ? '30%' : '45%'
            };
        }
    }
}
</script>

<style lang="scss">
.popup-enter-active,
.popup-leave-active {
    transition: all 0.2s;
}

.popup-enter,
.popup-leave-active {
    opacity: 0;
}

.dialog-container{
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 91000;
}

.weui-dialog {
    position: relative;
    // left: 10%;
    // top: 20%;
    top: 0;
    left: 0;
    margin: auto;
    max-width: none;
    transform: scale3d(1, 1, 1);
    border-radius: 10px;
    
    .weui-dialog__hd {
        background-color: #fff;
    }

    .weui-dialog__bd {
        background-color: #fff;
        line-height: 25px;
    }
    .dialog_info_img {
        height: 55px;
        width: 55px;
        // line-height: 55px;
        margin: auto;
        border-radius: 30px;
        margin-bottom: 10px;
    }
    .error {
        border: 2px solid #f8b9b9;
        .icon {
            font-size: 36px;
            color: #f27474;
            font-weight: bold;
        }
    }
    .success {
        border: 2px solid #bae496;
        .icon {
            font-size: 36px;
            color: #7ecc44;
            font-weight: bold;

        }
    }
    .info {
        border: 2px solid #fac1a5;
        .icon {
            font-size: 36px;
            color: #f6834b;
        }
    }
    .dialog-first {
        height: 100%;
        display: inline-block;
        background-color: #f5f5f5;
        color: #8f8f8f;
    }
    .dialog-last {
        height: 100%;
        display: inline-block;
        background-color: #7ecc44;
        color: #e5f4da;
    }
    .weui-dialog__ft {
        bottom: 0;
    }
}


.tip-dailog{
    .weui-mask {
        opacity: 0.5;
        z-index: 90000;
    }
}
</style>
