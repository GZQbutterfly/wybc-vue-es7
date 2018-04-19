import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { findIndex } from 'lodash';

const QRCode = require('../../../../../commons/assets/qrcode/qrcode');

import html2canvas from '../../../../../commons/assets/html2canvas/html2canvas';


import './templ.scss';
@Component({
    template: require('./templ.html')
})
export class CouponTempl extends Vue {

    @Prop({ type: Array, default: [] })
    list;

    @Prop({ type: Object, default: () => { return {} } })
    showItem;

    coupon = {};

    activatedIndex = -1;

    show = false;
    webpath;

    mounted() {
        this.webpath = location.origin;
        this.shopId = this.$store.state.workVO.user.userId;
        console.log('CouponTempl: ', this.list);
        window.html2canvas= html2canvas;
        // this.$nextTick(()=>{
        // });
    }

    @Watch('showItem')
    watchShowItem(newVal, oldVal) {
        console.log('watchShowItem ', newVal, oldVal);
        if (newVal) {
            this.coupon = newVal;
            this.show = true;
            this.showQRContent();
        } else {
            this.activatedIndex = -1;
            this.show = false;
        }
    }

    showQRContent() {
        if (this.show) {
            this.activatedIndex = findIndex(this.list, { couponId: this.coupon.couponId });
            let _qrDom = this.$refs.qrRef[this.activatedIndex];
            let _qrimgDom = this.$refs.qrimgRef[this.activatedIndex];
            console.log('showQRContent: ', this.activatedIndex, _qrDom);
            this.makeQRCode(_qrDom, _qrimgDom);
        }
    }

    close() {
        this.$emit('close');
    }

    imgLoading() {
        console.log('图片加载成功');
    }

    cachMap = {};

    makeQRCode(dom, imgDom) {
        let _self = this;
        let _couponId = _self.coupon.couponId;
        if (_self.cachMap[_couponId]) {
            return;
        }
        let text = `${_self.webpath}/gift_pack?giftType=coupon&couponId=${_couponId}&shopId=${_self.shopId}`;
        new QRCode(dom, {
            text: text,
            width: dom.offsetWidth,
            height: dom.offsetHeight,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.L
        });
        // window._qrcode =  this.qrcode;
        _self.cachMap[_couponId] = true;
    
        let templImgDom = _self.$refs.coupon_pic_copy;
        html2canvas(_self.$refs.contentRef,{
            width: templImgDom.offsetWidth,
            height: templImgDom.offsetHeight
        }).then(function(canvas) {
            imgDom.style.width = templImgDom.offsetWidth + 'px';
            imgDom.style.height = templImgDom.offsetHeight + 'px';
            imgDom.src = canvas.toDataURL("image/png");
        });
    }


}