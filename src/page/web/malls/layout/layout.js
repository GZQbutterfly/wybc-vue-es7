import { Component, Vue, Watch } from 'vue-property-decorator';
import { isArray } from 'lodash';

import layoutService from './layout.service';

import shopCarGoodsService from '../shop_car/getShopCarCount';
import { interval, isNotLogin, toLogin, timeout } from 'common.env';

import { debounce } from 'lodash';

// ==>
import './layout.scss';
@Component({
    template: require('./layout.html')
})
export class Layout extends Vue {
    list = [];
    isCreatedMenu = true;
    isHead = false;
    isHeadSearch = false;
    shopkeeper = {};
    isFollow = false;//未关注
    followName = '关注';
    data() {
        return {
            activeName: this.$route.name
        };
    }

    mounted() {
        //TODO  do some Adaptive
        let params = this.$route.query;
        let meta = this.$route.meta;
        this.isCreatedMenu = params.noMenu || meta.noMenu ? false : true;
        this.isHead = meta.head;
        this.isHeadSearch = !meta.noSearch;

        this._$service = layoutService(this.$store);

        let _self = this;
        this.$nextTick(() => {
            _self.list = _self._$service.list;
            // 请求购物车 商品数量
            _self.refreshServer(_self);
            //禁止ios/微信的默认可下拉
            _self.$refs.warpRef.addEventListener('touchmove', function (event) {
                event.preventDefault();
            });

            let _user = this.$route.query.user;
            if (isNotLogin() && _user == 'own') {
                _self.$store.state.giftVO.show = false;
                toLogin(_self.$router, { toPath: "home", realTo: "home?user=own" });
            }

            this._$service.shopInfo();
            if (!isNotLogin()) {
                this.isFollowWd();
            }
        });
    }

    @Watch('$route')
    watchRoute(newRoute, oldRoute) {
        this.isCreatedMenu = newRoute.query.noMenu || newRoute.meta.noMenu ? false : true;
        this.activeName = newRoute.name;
        if (isNotLogin() && newRoute.name == 'home') {
            this.isFollow = false;
            this.followName = '关注';
        }
    }

    loadedShopId = '';
    async updated() {
        let _self = this;
        this.isHead = this.$route.meta.head;
        this.isHeadSearch = !this.$route.meta.noSearch;

        if (/user_order/i.test(this.$route.name)) {
            this.refreshServer(this);
        }
    }

    refreshServer = debounce((_self) => {
        _self.$nextTick(() => {
            // 请求购物车 商品数量
            let _routerName = _self.$route.name;
            if (['home', 'classify', 'information', 'userinfo'].includes(_routerName)) {
                shopCarGoodsService(this.$store).getShopcarGoodsesList();
            }

        });
    }, 1000);

    //搜索页面
    goSearch(routerName) {
        this.$router.push({
            path: 'search',
            query: {
                origin: routerName
            }
        });
    }

    async isFollowWd() {
        let _shopId = await this.getShopId();
        let _result = (await this._$service.followShop({ shopId: _shopId })).data;
        if (!_result.errorCode) {
            this.isFollow = _result.attentionState;
            if (this.isFollow) {
                this.followName = "已关注";
            } else {
                this.followName = "关注";
            }
        }
    }
    destroyed() {
        this.$store.state.giftVO.show = false;
    }


    async getShopId() {
        let _query = this.$route.query.shopId;
        if (!_query) {
            let shopId = (await this.$store.dispatch('CHECK_WD_INFO')).infoId;
            _query = shopId;
        }
        if (isArray(_query)) {
            _query = _query[0];
        }
        return _query;
    }

    followShop() {
        let _self = this;
        let dialog = this.$store.state.$dialog;
        if (this.isFollow) {
            let dialogObj = {
                title: '提示',
                content: '是否取消关注' + _self.$store.state.env_state.cache.currentShop.wdName + '?',
                assistBtn: '取消',
                mainBtn: '确定',
                type: 'info',
                assistFn() { },
                mainFn() {
                    _self.$store.dispatch('CANCEL_FOLLOW_SHOP').then(flag => {
                        _self.isFollow = flag;
                        if (flag) {
                            _self.followName = "已关注";
                        } else {
                            _self.followName = "关注";
                        }
                    });
                }
            };
            dialog({ dialogObj });
        } else {
            let flag = isNotLogin();
            if (flag) {
                let dialogObj = {
                    title: '提示',
                    content: '登录后才能关注店铺，是否登录?',
                    assistBtn: '取消',
                    mainBtn: '确定',
                    type: 'info',
                    assistFn() { },
                    mainFn() {
                        toLogin(_self.$router, { toPath: "home" });
                    }
                };
                dialog({ dialogObj });
            } else {
                this._$service.queryUserFollowNum().then(res => {
                    if (!res.data.errorCode) {
                        if (res.data.count >= 20) {
                            let dialogObj = {
                                title: '关注失败',
                                content: '关注数量已达上限(20个)，请取消部分店铺关注后再试！',
                                assistBtn: '',
                                mainBtn: '知道了',
                                type: 'info',
                                assistFn() { },
                                mainFn() { }
                            };
                            dialog({ dialogObj });
                        } else {
                            _self.$store.dispatch('ADD_FOLLOW_SHOP').then(flag => {
                                _self.isFollow = flag;
                                if (!_self.isFollow) {
                                    _self.followName = "关注";
                                } else {
                                    _self.followName = "已关注";
                                }
                            });
                        }
                    }
                })
            }
        }



        //  this.$store.dispatch('CANCEL_FOLLOW_SHOP',{shopId:119});//取消店铺
    }
}
