import { Component } from 'vue-property-decorator';
import Swiper from 'swiper';
import BaseVue from 'base.vue';
import { isEmpty, get } from 'lodash';
import { isNotLogin, toLogin, pageNotAccess, interval, timeout } from 'common.env';
import { TopNotice } from '../../sys/notice/top/top.notice';
import homeServer from './home.service';
import './home.scss';

@Component({
    template: require('./home.html'),
    components: {
        'app-topnotice': TopNotice
    }
})

export class CmsHome extends BaseVue {
    userLogin = false;
    //用户头像
    user_img = '/static/images/pic-login.png';
    userInfo;
    userLevel;
    userMoney = '0';
    userIncome = '0';
    userCouponCount = '0';
    systemMsg = [];
    radioMsg = [];
    gridsData = [];
    shopData = {
        vip: '0',
        wdName: '？？？',
        vipName: '？？？',
        school: '？？？'
    };
    bannerData = [];
    msgNum = 0;
    realNameInfo = {
        data: { state: 0 }
    };
    realNameStateList = [
        '未实名认证',
        '实名认证审核中',
        '实名认证失败',
        '实名认证异常',
        '已实名认证',
    ];
    distributorRealNameInfo = {
        'checkState': 0
    };
    distributorRealNameStateList = [
        '未认证配送员',
        '配送员认证审核中',
        '已认证配送员',
        '配送员认证失败',
    ];
    _$service;
    msgOpts = {
        list: []
    };
    pageLife = true;    //当前页面是否活动中(用于关闭消息的定时器)
    shopDeliveryState = 0;

    mounted() {
        document.title = "学惠店管理端";
        let _self = this;
        _self._$service = homeServer(_self.$store);
        _self.$nextTick(() => {
            _self.queryUserInfo();
        })
    }
    destroyed() {
        this.pageLife = false;
    }

    /**
     * 获取用户的信息
     */
    queryUserInfo() {
        let _self = this;
        if (!isNotLogin()) {
            this.userLogin = true;
            this.userInfo = this.$store.state.workVO.user;
            this.user_img = this.userInfo.headimgurl || '/static/images/pic-login.png';

            //用户钱包
            _self.queryUserMoney();
            //店铺等级
            _self.queryShopInfo().then(() => {
                //实名
                _self.queryRealName();
                //系统消息
                _self.querySystemMsg();
            });
            //用户收益
            _self.queryMyIncome();
            //九宫格
            _self.queryGridsData();
            //banner
            _self.queryBannerData();
            //快速仓
            _self.queryShopDeliveryState();
        }
    }

    /**
     * 获取用户实名认证
     */
    queryRealName() {
        let _self = this;
        this._$service.queryRealName().then((res) => {
            console.log('用户实名认证信息', res.data);
            _self.realNameInfo = res;
            if (_self.realNameInfo.data.state == 4) {
                // //配送员认证
                _self.queryDistributorRealName();
            }
        });
    }

    /**
     * 获取配送员用户实名认证
     */
    async queryDistributorRealName() {
        let _self = this;
        let result = await this._$service.queryDistributorRealName();
        result = result.data;
        if (result.errorCode) {
            if (result.errorCode == 222) {
                result = {
                    'checkState': 0
                };
            } else {
                result = {
                    'checkState': -1
                };
            }
        } else if (isEmpty(result)) {
            result = {
                'checkState': 0
            };
        }
        _self.distributorRealNameInfo = result;
    }

    /**
     * 获取用户钱包余额
     */
    queryUserMoney() {
        this._$service.queryUserMoney().then((res) => {
            console.log('用户钱包余额', res.data.money);
            this.userMoney = res.data.money;
        });
    }

    /**
     * 获取店铺等级信息
     */
    queryShopInfo() {
        let _self = this;
        return this._$service.queryShopInfo().then((wdVipInfo) => {
            console.log('店铺信息', wdVipInfo)
            _self.shopData.wdName = wdVipInfo.wdName || '？？？';
            _self.shopData.vip = wdVipInfo.wdVipGrade || '0';
            _self.shopData.vipName = wdVipInfo.gradeName || '';
            _self.shopData.school = wdVipInfo.school || '';
        });
    }

    /**
     * 获取系统消息数据
     */
    querySystemMsg() {
        let _self = this;
        timeout(() => {
            _self._$service.querySystemMsg().then((res) => {
                let _result = res.data;
                if (_result.errorCode) {
                    return;
                }
                let _newList = [];
                for (let i = 0, len = _result.length; i < len; i++) {
                    _newList.push({ img: '', msg: _result[i], flag: '' });
                }
                _self.msgOpts.list = _newList;
            });
        }, 1000);


        _self._$service.queryMessageNum().then((res) => {
            let _result = res.data;
            if (_result.errorCode) {
                return;
            }
            _self.msgNum = _result > 999 ? '999+' : _result;
        });

    }

    /**
     * 设置系统消息动画
     * @param data   消息数据
     * @param isLoop 是否循环广播
     */
    setSysMsgAnim(data, isLoop = false) {
        let i = 0;
        let _self = this;
        let dom = _self.$refs.cmsHomeHeadMsg;
        //消息总条数
        let len = data.length;
        //换消息之间的间隔(这时设置的数值是第一次显示的时间)
        let offset = 3000;
        //得到数值间的伪随机数(含左不含右 ms)
        let getRandom = function (min, max) {
            return min + Math.floor(Math.random() * (max - min));
        }
        //设置单条消息
        let setMsg = function (offset) {
            console.log('第' + i + '条消息', '显示延迟', offset + 'ms');
            setTimeout(() => {
                _self.systemMsg = data[i];
                dom.style.display = 'inline-block';
                //华丽入场
                dom.style.animation = 'msgIn .3s';
                offset = 6000;
                console.log('第' + i + '条消息', '显示时间', offset + 'ms');
                setTimeout(() => {
                    //黯然离场
                    dom.style.animation = 'msgOut .3s';
                    setTimeout(() => {
                        //设置下一次单条消息
                        dom.style.display = 'none';
                        offset = getRandom(1000, 3000);
                        (++i == len && !isLoop && (offset = 0)) || (_self.pageLife && offset && setMsg(offset));
                    }, 300);
                }, offset);
            }, offset);
        }
        //start
        len && setMsg(offset);
    }

    /**
     * 获取用户收益数据
     */
    queryMyIncome() {
        let _self = this;
        _self._$service.queryMyIncome().then((res) => {
            _self.userIncome = res.data.totalMoney;
            _self.userCouponCount = res.data.couponCount;
        });
    }

    /**
     * 获取九宫格数据和小圆点数量
     */
    queryGridsData() {
        let _self = this;
        let res = [
            {
                href: 'cms_purchase',
                icon: '/static/images/minishop/s1.png',
                title: '我要进货',
                toDo: _self.visit,
                canVisit: true,
                redRidus:false,
                redRidusNum:0
            },
            {
                href: 'cms_out_order',
                icon: '/static/images/minishop/s10.png',
                title: '出货订单',
                toDo: _self.visit,
                canVisit: true,
                redRidus: true,
                redRidusNum: 0,
                
            },
            {
                href: 'cms_stock_order',
                icon: '/static/images/minishop/jinhuodindan.png',
                title: '进货订单',
                toDo: _self.visit,
                canVisit: true,
                redRidus: true,
                redRidusNum: 0
            },
            {
                href: 'my_inventory_list',
                icon: '/static/images/minishop/s3.png',
                title: '我的库存',
                toDo: _self.visit,
                canVisit: true,
                redRidus: false,
                redRidusNum: 0
            },
            {
                href: 'delivery_m_order',
                icon: '/static/images/minishop/s11.png',
                title: '店长配送',
                toDo: _self.visit,
                canVisit: true,
                redRidus: true,
                redRidusNum: 0
            },
            {
                href: 'delivery_order',
                icon: '/static/images/minishop/ps.png',
                title: '抢单配送',
                toDo: _self.checkRealname,
                canVisit: true,
                redRidus: true,
                redRidusNum: 0
            },
            {
                href: 'my_spread',
                icon: '/static/images/minishop/s5.png',
                title: '我要推广',
                toDo: _self.visit,
                canVisit: true,
                redRidus: false,
                redRidusNum: 0
            },
            {
                href: 'my_team',
                icon: '/static/images/minishop/s8.png',
                title: '我的团队',
                toDo: _self.visit,
                canVisit: true,
                redRidus: false,
                redRidusNum: 0
            },
            {
                href: '/information',
                icon: '/static/images/minishop/s4.png',
                title: '资讯',
                toDo: _self.visit,
                canVisit: true,
                redRidus: false,
                redRidusNum: 0
            },
            {
                href: 'helper',
                icon: '/static/images/minishop/skefu.png',
                title: '联系客服',
                toDo: _self.visit,
                canVisit: true,
                redRidus: false,
                redRidusNum: 0
            },
        ];
        this._$service.getRedRidusNum().then(redRidusNum=>{
            let _result = redRidusNum.data;
            if(!_result.errorCode){
                res[1].redRidusNum = _result.outOrderCount;
                res[2].redRidusNum = _result.wholeOrderCount;
                res[4].redRidusNum = _result.waitDeliveryCount;
                res[5].redRidusNum = _result.robDeliveryCount;
            }
            for (var i = 0, len = res.length; i < len; i += 6) {
                _self.gridsData.push(res.slice(i, i + 6));
            }
            _self.renderGridsSwiper();
        })
       
    }

    /**
     * 设置九宫格swiper
     */
    renderGridsSwiper() {
        let _self = this;
        _self.swiper = new Swiper(_self.$refs.gridsSwiper, {
            slidesPerView: 1,
            slidesPerColumn: 1,
            observer: true,
            followFinger: false,
            speed: 400,
            spaceBetween: 30,
            // swipeHandler: '.ttttttttttttttt',//禁止用户滑动行为
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            }
        });
    }

    /**
     * 获取banner数据
     */
    queryBannerData() {
        let _self = this;
        this._$service.queryBannerData().then((res) => {
            console.log('微店管理端banner', res.data.data);
            _self.bannerData = res.data.data;
            _self.bannerData.length > 1 && _self.renderBannerSwiper();
        });
    }

    /**
     * 获取快速仓开启状态
     */
    async queryShopDeliveryState() {
        let _self = this;
        let res = await _self._$service.queryShopDeliveryState();
        res = res.data;
        console.log(111, res)
        if (!res.errorCode) {
            _self.shopDeliveryState = res.state;
        }
    }

    /**
     * 设置banner的swiper
     */
    renderBannerSwiper() {
        let _self = this;
        _self.swiper = new Swiper(_self.$refs.cmsBannerSwiper, {
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            loop: true,
            observer: true,
            speed: 800,
            spaceBetween: 10,
        });
    }

    /**
     * 切换账号
     */
    userOptions() {
        this.$router.push('options');
    }


    // 去 升级VIP等级
    toLevelPage() {
        this.$router.push('grade');
    }

    // 去 实名认证
    async toAuthPage() {
        let _self = this;
        let result = await this._$service.queryRealName();
        result = result.data;
        if (result.state == 0 || result.state == 3) {
            this.$router.push('realname');
        } else {
            this.$router.push({ path: 'realname_result', query: { result: result } });
        }
    }

    // 去 配送员 实名认证
    async toDistributorAuthPage() {
        let _self = this;
        let result = await this._$service.queryDistributorRealName();
        result = result.data;
        if (result && result.errorCode) {
            if (result.errorCode == 222) {
                // 实时改变 实名认证状态
                this.toAuthPage();
                return;
            } else {
                result = {
                    'checkState': -1
                };
            }
        } else if (isEmpty(result)) {
            result = {
                'checkState': 0
            };
        }
        if (result.checkState == -1) {
            let _self = this;
            let dialogObj = {
                title: '提示',
                content: '系统错误',
                type: 'error',
                assistBtn: '',
                mainBtn: '确认',
                assistFn() {
                },
                mainFn() {
                }
            };
            this.$store.state.$dialog({ dialogObj });
        } else if (result.checkState == 0) {
            this.$router.push('distributor_realname');
        } else {
            this.$router.push({ path: 'distributor_realname_result', query: { result: result } });
        }
    }

    //常规路由跳转
    visit(path, canVisit) {
        if (!canVisit) {
            pageNotAccess();
            return;
        }
        this.$router.push(path);
    }

    //去我的配送 路由跳转
    async checkRealname(path, canVisit) {
        if (!canVisit) {
            pageNotAccess();
            return;
        }
        let _self = this;
        let result = await _self._$service.queryRealName();
        result = result.data;
        if (result.errorCode) {
            let dialogObj = {
                title: '提示',
                content: result.msg || '系统错误',
                type: 'error',
                assistBtn: '',
                mainBtn: '确认',
                assistFn() {
                },
                mainFn() {
                }
            };
            _self.$store.state.$dialog({ dialogObj });
            return;
        }
        if (result.state == 4) {
            _self.$router.push(path);
        } else {
            let dialogObj = {
                title: '提示',
                content: '请先进行实名认证!',
                type: 'info',
                assistBtn: '取消',
                mainBtn: '确认',
                assistFn() {
                },
                mainFn() {
                    _self.toAuthPage();
                }
            };
            _self.$store.state.$dialog({ dialogObj });
        }
    }

    // 去 我的钱包
    toWallet() {
        this.$router.push('my_wallet');
    }
    // 去 我的收益
    toIncome() {
        // pageNotAccess();
        this.$router.push('my_income');
    }

    toCoupon() {
        this.$router.push('cms_my_coupon');
    }

    imgError() {
        console.log(' ! ! ! ! ! ! ! ! ! ', 'user pic error ...');
        this.user_img = '/static/images/pic-login.png';
    }

    goUrl(linkType, linkTarget, id) {
        if (linkType) {
            location.href = linkTarget;
            return;
        }
        this.$router.push({ path: 'cms_purchase_goods_detail', query: { goodsId: id } })
    }
    toMessageNotice() {
        this.$router.push('message_notice');
    }
    toQuickFlag() {
        this.$router.push({ path: 'fast_store' })
    }
}
