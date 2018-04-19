/**
 * 签到 弹窗
 */

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { timeout } from 'common.env';
// ==>
import './popup.scss';
@Component({
    template: require('./popup.html')
})
export class Popup extends Vue {
    @Prop({ type: Boolean, default: false })
    showPopup;

    @Prop({ type: String, default: '' })
    signPopup;

    @Prop({ type: Object, default: () => { return {} } })
    info;

    show = false;

    record = {};

    data = {};

    mounted() {

        this.$nextTick(() => {
            this.watchInfo(this.info);
            this.showContent();
        });
    }

    @Watch('showPopup')
    watchShowPopup(newVal, oldVal) {
        if (newVal) {
            this.showContent();
        }
    }

    @Watch('info')
    watchInfo(newVal, oldVal) {
        let _msg = newVal.msg + '';
        newVal.msg = _msg.length > 150 ? _msg.substr(0, 150) + '...' : _msg;
        if (this.signPopup == 'sign') {
            this.record = newVal;
        } else {
            this.data = newVal;
        }
    }

    showContent() {
        timeout(() => {
            this.show = true;
        }, 100);
    }

    close() {
        timeout(() => {
            this.show = false;
            this.$emit('close');
        }, 100);

    }

}
