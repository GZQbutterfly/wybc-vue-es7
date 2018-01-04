import { Component, Vue} from 'vue-property-decorator';

import layoutService from './layout.service';
import shopCarGoodsService from '../classify/getShopCarCount';
import { debounce } from 'lodash';
import './layout.scss';

@Component({
    template: require('./layout.html')
})
export class CmsLayout extends Vue {
    list = layoutService.list;
    isCreatedMenu = true;
    activeName;
    data() {
        return {
            activeName: this.$route.name
        };
    }
    mounted() {
        this.$watch('$route', (newRoute, oldRoute) => {
            this.isCreatedMenu = newRoute.query.menu || newRoute.meta.menu ? true : false;
            this.activeName = newRoute.name;
        });
        //TODO  do some Adaptive
        let params = this.$route.query;
        let meta = this.$route.meta;
        this.isCreatedMenu = params.menu || meta.menu ? true : false;
        let _this = this;

        this.$nextTick(() => {
            // 请求购物车 商品数量
            this.refreshServer(this);

            //禁止ios/微信的默认可下拉
            this.$refs.cmsWarpRef.addEventListener('touchmove', function (event) {
                event.preventDefault();
            });
        });
    }

    updated() {
        if (/cmsStockOrder/i.test(this.$route.name)) {
            this.refreshServer(this);
        }
    }

    refreshServer = debounce((_self) => {
        _self.$nextTick(() => {
            // 请求购物车 商品数量
            shopCarGoodsService(this.$store).getShopcarGoodsesList();
        });
    }, 500);

}
