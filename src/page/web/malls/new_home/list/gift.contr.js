import {
    isNotLogin,
    interval,
    timeout
} from 'common.env';
import homeService from './list.service';
/**
 *  首页相关依赖逻辑
 */
export default {
    init(vm) {
        timeout(() => {
            this._service = homeService(vm.$store);
            this._vm = vm;
            let _query = vm.$route.query;
            let _flagGift = sessionStorage.__takeFlag;
            let _couponId = _query.couponId;
            let _shopId = _query.shopId;
            // 新手大礼包 领取
            if (_flagGift) {
                if (_flagGift == 'takeNewGift') {
                    this.queryNewGiftPack();
                } else {
                    // 未登录状态 ->  登录后跳转 优惠券 扫码 领取
                    this.queryCounpon(_couponId, _shopId);
                }
            } else if (_couponId) {
                //登录状态 -> 优惠券 扫码 领取
                this.queryCounpon(_couponId, _shopId);
            } else {
                this.newHandBigGiftPack();
            }
        }, 1500);
    },
    async checkCheckHasGift() {
        //"ifNewUser" : false    //false:已经领取过; true:  还没有领取过
        let _result = (await this._service.queryCheckHasGift()).data;
        if (!_result || _result.errorCode || !_result.ifNewUser) {
            // 为领取状态
            return true;
        }
        return false;
    },
    async checksGiftAvalid() {
        //检测当前活动配置是否有效
        let _result = (await this._service.checksGiftAvalid()).data;
        console.log("状态数据", _result);
        if (_result && _result.state == 1) {
            // 为领取状态
            return true;
        }
        return false;
    },

    /**
     * 新手大礼包
     * 1， 未登录状态 -> 弹出新手大礼包 -> 
     *               1）拆 ->  登录  -> 首页 （自动领取） -> 弹出领取成功 (明细展示)
     *               2）不拆 -> 首页
     * 2， 登录状态  -> 弹出新手大礼包 -> 
     *               1）拆 -> 弹出领取成功(明细展示)
     *               2）不拆 -> 保持当前页
     */
    async newHandBigGiftPack() {
        if (sessionStorage.__dialogNewGiftFlag) {
            return;
        }
        let _flag = isNotLogin();
        if (!_flag) {
            // 登录状态
            let flag = await this.checkCheckHasGift();
            if (flag) {
                return;
            }
        } else {
            //检测当前礼包是否可用
            let flag = await this.checksGiftAvalid();
            if (!flag) {
                return;
            }
        }
        timeout(() => {
            let _route = this._vm.$route;
            if (!['home', 'classify'].includes(_route.name)) {
                console.log('首页礼包逻辑， 此时路由不在首页 分类， 关闭礼包弹框');
                return;
            }
            let _giftVO = this._vm.$store.state.giftVO;
            _giftVO.opts = {
                giftType: 'newGift',
                dialog: true
            };
            _giftVO.show = true;
            sessionStorage.__dialogNewGiftFlag = true;
            console.info('新手大礼包 ', _giftVO);
        }, 500);

    },
    /**
     * 领取新手礼包
     */
    queryNewGiftPack() {
        if(isNotLogin()){
            sessionStorage.removeItem('__takeFlag');
            return;
        }
        let _giftVO = this._vm.$store.state.giftVO;
        _giftVO.opts = {
            giftType: 'newGift',
            data: []
        };
        this._service.takeGiftPack().then((res) => {
            let _result = res.data;
            if (_result && !_result.errorCode) {
                _giftVO.opts.data = _result.gifts;
                _giftVO.show = true;
            } else {
                this.dialog(_result && _result.msg, _giftVO);
            }
            sessionStorage.removeItem('__takeFlag');
        });
    },
    /**
     * 领取优惠券
     * @param {String} couponId
     */
    queryCounpon(couponId, shopId) {
        if (couponId == sessionStorage.__takeValue) {
            this.newHandBigGiftPack();
            // 已经领取改优惠券
            return;
        }
        console.info('存在优惠券， 获取优惠券内容');
        let _giftVO = this._vm.$store.state.giftVO;

        if (this._vm.$store.state.workVO.user.userId == shopId) {
            // 不能领取自己的店铺
            this.dialog('不能领取自己店铺优惠券！', _giftVO);
            return;
        }
        _giftVO.opts = {
            giftType: 'coupon',
            data: []
        };
        sessionStorage.__takeFlag = 'takeCounpon';
        sessionStorage.__takeValue = couponId;
        this._service.takeCounpon(couponId, shopId).then((res) => {
            let _result = res.data;
            if (_result && !_result.errorCode) {
                _giftVO.opts.data = [_result.coupon];
                _giftVO.show = true;
                console.info('优惠券 ', _giftVO);
            } else {
                this.dialog(_result && _result.msg, _giftVO);
            }
            sessionStorage.removeItem('__takeFlag');
            this.loopCheckGift(_giftVO);
        });
    },
    /**
     * 用户领取的优惠券， 因无法判断用户是否领取过新手大礼包，需延迟轮询判断优惠券dialog关闭后请求一次新手礼包功能
     * @param {*} giftVO 
     */
    loopCheckGift(giftVO) {
        let timer = interval(() => {
            if (!giftVO.show) {
                this.newHandBigGiftPack();
                window.clearInterval(timer);
            }
        }, 3000);
    },
    dialog(msg, _giftVO) {
        let _self = this;
        _self._vm._$dialog({
            dialogObj: {
                title: '提示',
                type: 'error',
                content: msg || '抱歉！领取失败',
                assistBtn: '',
                mainBtn: '知道啦',
                assistFn() { },
                mainFn() {
                    _giftVO.show = false;
                }
            }
        });
    }

}