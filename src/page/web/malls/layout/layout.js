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
        });
    }

    @Watch('$route')
    watchRoute(newRoute, oldRoute) {
        this.isCreatedMenu = newRoute.query.noMenu || newRoute.meta.noMenu ? false : true;
        this.activeName = newRoute.name;
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
            if (['home', 'classify', 'information', 'userinfo'].includes(_routerName)){
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


}
