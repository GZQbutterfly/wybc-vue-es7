import { Component, Vue, Prop, Watch } from 'vue-property-decorator';


import { timeout, getLocalUserInfo } from 'common.env';


import './unauthorized.scss';
@Component({
    template: require('./unauthorized.html'),
})
export class Unauthorized extends Vue {
    @Prop({ type: Function, default: () => { } })
    close;

    @Prop({ type: Boolean, default: true })
    showAuth;

    show = false;

    mounted() {
        this.$nextTick(() => {
            this.showContent();
        });
    }

    @Watch('showAuth')
    watchShowAuth(newVal, oldVal) {
        if (newVal) {
            this.showContent();
        }
    }

    showContent() {
        timeout(() => {
            this.show = true;
        }, 100);
    }



    closeSelf() {
        this.show = false
        timeout(() => {
            this.close();
        }, 400);
    }

    noTouchMove(e) {
        e.preventDefault();
        return false;
    }
}