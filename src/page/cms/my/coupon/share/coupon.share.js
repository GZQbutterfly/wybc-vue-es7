import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import './coupon.share.scss';
const QRCode = require('../../../../../commons/assets/qrcode/qrcode');

@Component({
    template: require('./coupon.share.html'),
    props: [
        "coupon",
        "close",
    ]
})

export class CouponShare extends BaseVue {
    shopId;
    imgLoadOver = false;

    mounted() {
        let _self = this;
        _self.shopId = _self.$store.state.workVO.user.userId;
        _self.$nextTick(() => {
            let _change = () => {
                if (_self.$props.coupon) {
                    _self.drawQrCode();
                }
            };
            _self.$watch('coupon', () => {
                _change();
            });
        });
    }

    show = false;
    drawQrCode() {
        let _self = this;
        _self.show = false;
        let _showBox = _self.$refs.showBox;
        let _price1 = _self.$refs.price1;
        let _price2 = _self.$refs.price2;
        let _wdName = _self.$refs.wdName;
        let _qrCode = _self.$refs.qrCode;
        let _canvas = _self.$refs.canvas;
        let _image = _self.$refs.coupon_pic_copy;
        let qrcode = new QRCode(_qrCode, {
            text: location.origin + '/gift_pack?giftType=coupon&couponId=' + _self.coupon.couponId + '&shopId=' + _self.shopId,
            width: _qrCode.offsetWidth,
            height: _qrCode.offsetHeight,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.L
        });

        setTimeout(() => {
            _canvas.width = _showBox.offsetWidth;
            _canvas.height = _showBox.offsetHeight;
            var ctx = _canvas.getContext("2d");
            let draw = function(){
                if(!_self.imgLoadOver){
                    console.log('等待图片加载完毕...');
                    setTimeout(() => {
                        draw();
                    }, 30);
                    return;
                }
                console.log('drawing...');
                ctx.drawImage(_image, 0, 0, _showBox.offsetWidth, _showBox.offsetHeight);
                ctx.drawImage(qrcode._oDrawing._elImage, _qrCode.offsetLeft, _qrCode.offsetTop, _qrCode.offsetWidth, _qrCode.offsetHeight);
                ctx.fillStyle = "#e74143";
                ctx.textAlign = "center";
                ctx.font = "26px microsoft yahei";
                ctx.fillText((_self.coupon.moneyPrice / 100).toFixed(2) + "元", _showBox.offsetWidth / 2, _price1.offsetTop + _price1.offsetHeight);
                ctx.font = "13px microsoft yahei";
                if(_self.coupon.minOrderPrice){
                    ctx.fillText("满" + (_self.coupon.minOrderPrice / 100).toFixed(2) + "减" + (_self.coupon.moneyPrice / 100).toFixed(2), _showBox.offsetWidth / 2, _price2.offsetTop + _price2.offsetHeight + 2);
                }else{
                    ctx.fillText("立减" + (_self.coupon.moneyPrice / 100).toFixed(2), _showBox.offsetWidth / 2, _price2.offsetTop + _price2.offsetHeight + 2);
                }
                ctx.fillStyle = "#fff";
                ctx.font = "21px microsoft yahei";
                ctx.fillText(_self.coupon.wdName, _showBox.offsetWidth / 2, _wdName.offsetTop + _wdName.offsetHeight);
                _self.$refs.coupon_pic.src = _canvas.toDataURL("image/png");
                _self.show  = true;
            }
            draw();
        }, 150);
    }

    imgLoading() {
        let _self = this;
        _self.imgLoadOver = true;
        console.log('图片加载完毕...');
    }

    deactivated() {
        this.close();
    }

}