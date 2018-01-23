import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { timeout, getLocalUserInfo } from 'common.env';

import './sideslip_menu.scss';
@Component({
    template: require('./sideslip_menu.html'),
})
export class SlideslipMenu extends Vue {
    @Prop({ type: Function, default: () => { } })
    close;

    @Prop({ type: Boolean, default: true })
    showMenu;

    show = false;
    defaultUserImg = '/static/images/pic-login.png';
    data() {
        return { user: getLocalUserInfo() };
    }

    mounted() {
        this.$nextTick(() => {
            this.showContent();
        });
    }

    @Watch('showMenu')
    watch(newVal, oldVal) {
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
    
    imgError(e) {
        e.target.src = this.defaultUserImg;
    }
}