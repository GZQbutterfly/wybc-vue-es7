/**
 * 礼包
 */
import { Component, Prop, Watch } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { timeout } from 'common.env';

import { NewGift } from './new_gift/new_gift';

import { GiftDetail } from './detail/detail';

import service from './gift_pack.service';

import './gift_pack.scss';

@Component({
    template: require('./gift_pack.html'),
    components: {
        'new-gift': NewGift,
        'gift-detail': GiftDetail
    }
})
export class GiftPack extends BaseVue {

    @Prop({ type: Object, default: () => { return { giftType: 'coupon', data: {} } } })
    opts;

    show = false;

    mode = false;

    newGift = false;

    giftDetail = false;

    _$service;

    _$user;

    mounted() {
        this._$service = service(this.$store);
        this._$user = this.$store.state.workVO.user;

        this.$nextTick(() => {
            this.initPage();
        });

    }

    initPage() {
        let _route = this.$route;
        // 当前路由
        if (_route.name == 'gift_pack') {
            let _query = _route.query;
            if (_query.giftType == 'coupon') {
                if (_query.couponId == sessionStorage.__takeValue) {
                    // 已经领取该优惠券
                    this.closeSelf();
                    return;
                }
                // 扫码 优惠券  进入当前页面，， 第一步拆礼包
                this.opts.giftType = 'couponGfit';
                this.opts.data = { couponId: _query.couponId, shopId: _query.shopId };
                this.opts.dialog = true;
            }
            console.log('当前路由需要获取优惠券');
        } else {
            this.mode = true;
        }

        this.checkGiftStatus();

        this.showContent();
    }

    checkGiftStatus() {
        let _giftType = this.opts.giftType;
        if (_giftType == 'newGift') {
            // 新手礼包
            if (this.opts.dialog) {
                this.newGift = true;
            } else {
                this.giftDetail = true;
            }
        } else if (_giftType == 'couponGfit') {
            // 扫码优惠券
            if (this.opts.dialog) {
                this.newGift = true;
            } else {
                this.giftDetail = true;
            }
        } else {
            // 礼包 优惠券 明细
            this.giftDetail = true;
        }
    }

    showContent() {
        timeout(() => {
            this.show = !this.show;
        }, 300);
    }

    /**
     * 
     * @param {*} type newGift 新手礼包  couponGift 优惠券
     * @param {*} couponId 
     */
    takeGift(type, couponId, shopId) {
        let _self = this;
        // console.log(type, this._$user.userId, shopId);
        if (type != 'newGift' && this._$user.userId == shopId) {
            // 不能领取自己的店铺
            _self.dialog('不能领取自己店铺优惠券！');
            return;
        }
        if (type) {
            _self.newGift = false;
            _self._$service[type == 'newGift' ? 'takeGiftPack' : 'takeCounpon'](couponId, shopId).then((res) => {
                let _result = res.data;
                if (_result && !_result.errorCode) {
                    if (type == 'newGift') {
                        _self.opts.data = _result.gifts;
                    } else {
                        _self.opts.data = [_result.coupon];
                    }
                    _self.giftDetail = true;
                } else {
                    _self.dialog(_result && _result.msg);
                }
            })
            console.log('gift_pack 拆礼包： ', couponId);
        } else {

        }
    }

    closeSelf() {
        let _route = this.$route;
        if (['home', 'classify'].includes(_route.name)) {
            this.$store.state.giftVO.show = false;
        } else {
            this.$router.replace({ path: 'home', query: { shopId: _route.query.shopId } })
        }
    }

    dialog(msg) {
        let _self = this;
        _self.alertDialog({
            title: '提示',
            type: 'error',
            content: msg || '抱歉！领取失败',
            assistBtn: '',
            mainBtn: '知道啦',
            assistFn() { },
            mainFn() { _self.closeSelf(); }
        })
    }


    alertDialog(dialogObj) {
        this._$dialog({ dialogObj });
    }

}