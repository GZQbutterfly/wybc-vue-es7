import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { timeout } from 'common.env';
import { merge } from 'lodash';

import './top.notice.scss';
@Component({ template: require('./top.notice.html') })
export class TopNotice extends Vue {

    @Prop({ type: Object, default: {} })
    msgOpts;
    msgConfig = { list: [], delay: 3000, speed: 0 };
    msgList = [];
    msgObj = { img: '/static/images/pic-login.png', msg: '', flag: '' };
    show = false;
    showAnimation = false;
    stopRunFlag = false;

    mounted() {
        this.$nextTick(() => {
            timeout(() => {
                this.initPage();
            }, 500);
        });
    }

    initPage() {
        let _self = this;
        merge(_self.msgConfig, _self.msgOpts);
        _self.msgList = _self.msgConfig.list;
        _self.stopRunFlag = true;
        timeout(() => {
            _self.stopRunFlag = false;
            _self.msgList.length && _self.start();
        }, _self.msgConfig.delay);
    }

    @Watch('msgOpts.list', { immediate: false })
    watchMsg(newVal, oldVal) {
        this.msgList.push(...newVal);
        if (!this.stopRunFlag) {
            this.start();
        }
    }

    start() {
        if (!this.msgList.length || this.stopRunFlag) {
            return;
        }
        this.msgObj = this.msgList.shift();
        this.show = true;
        this.stopRunFlag = true;
        timeout(() => {
            this.runAnimation().then(() => {
                this.show = false;
                let randomSpeed = this.msgConfig.speed || (Math.random() * 5 + 1) * 1000;
                // console.log(randomSpeed);
                timeout(() => {
                    this.stopRunFlag = false;
                    this.start();
                }, randomSpeed);
            });
        }, 10);
    }

    runAnimation() {
        return new Promise((resolve) => {
            let _self = this;
            let _boxRefDom = _self.$refs.boxRef;
            let _bw = _boxRefDom.clientWidth;
            let _contentDom = _self.$refs.msgRef;
            let contentWidth = _contentDom.getBoundingClientRect().width;
            if (contentWidth < _bw + 2) {
                timeout(() => {
                    resolve(true);
                }, 2000);
            } else {
                let onceTime = (contentWidth / 30) * 1000;
                this.setAnimationDuration(_contentDom, onceTime);
                timeout(() => {
                    this.setAnimationDuration(_contentDom, 0);
                    resolve(true);
                }, onceTime + 50);
            }
        });
    }

    setAnimationDuration(dom, time) {
        if (dom.setAttribute) {
            dom.setAttribute('style', `animation-duration: ${time}ms;-webkit-animation-duration: ${time}ms;`);
        } else {
            dom.style['animation-duration'] = time + 'ms';
            dom.style['-webkit-animation-duration'] = time + 'ms';
        }
        // 部分浏览器无法滚动，须将功能样式移除再添加就ok了
        this.showAnimation = false;
        timeout(() => {
            this.showAnimation = true;
        });
    }

    beforeDestroy() {
        this.msgList.length = 0;
    }
}
