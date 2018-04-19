// 右侧滑出菜单
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { timeout, getLocalUserInfo } from 'common.env';

import service from '../delivery.service';

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
    defaultUserImg = require('../../../../../static/images/delivery/pstouxiang.png');

    _$service;
    menuList = [
        { imgSrc: require('../../../../../static/images/delivery/renwu.png'), label: '已完成订单', to: 'delivery_m_finish_list' },
        { imgSrc: require('../../../../../static/images/delivery/qianbao.png'), label: '我的钱包', to: 'my_wallet' },
        { imgSrc: require('../../../../../static/images/delivery/shouyi.png'), label: '收支明细', to: 'my_income' },
        { imgSrc: require('../../../../../static/images/delivery/shouye.png'), label: '管理端首页', to: 'cms_home' },
    ]
    data() {
        return { user: getLocalUserInfo() };
    }

    mounted() {
        this._$service = service(this.$store);
        this.$nextTick(() => {
            this.showContent();
        });
    }

    @Watch('showMenu')
    watchShowMenu(newVal, oldVal) {
        if (newVal) {
            this.showContent();
        }
    }

    showContent() {
        // 获取配送员信息 async
        // let _result = await this._$service.queryDelivererInfo({});

        // console.log(_result);

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

    toPath(event, item) {
        this.$router.push(item.to);
        this.close();
    }

    noTouchMove(e) {
        e.preventDefault();
        return false;
    }
}