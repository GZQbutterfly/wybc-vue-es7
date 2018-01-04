import { Component, Vue, Watch } from 'vue-property-decorator';


import layoutService from './layout.service';

//import shopCarGoodsService from '../home/getShopCarCount';
//import { isWeiXin, interval, getAuthUser, isNotLogin, toLogin } from '../../commons/common.env';
import { debounce } from 'lodash';

// ==>
import './layout.scss';
@Component({
    template: require('./layout.html')
})
export class Layout extends Vue {
    list = [];
    isCreatedMenu = true;

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

        this._$service = layoutService();

        this.$nextTick(() => {
            this.list = this._$service.list;
            // 请求购物车 商品数量
            this.refreshServer(this);
            //禁止ios/微信的默认可下拉
            this.$refs.warpRef.addEventListener('touchmove', function (event) {
                event.preventDefault();
            });
        });
    }

    @Watch('$route')
    watchRoute(newRoute, oldRoute){
        this.isCreatedMenu = newRoute.query.noMenu || newRoute.meta.noMenu ? false : true;
        this.activeName = newRoute.name;
    }

    updated() {
        if (/user_order/i.test(this.$route.name)){
            this.refreshServer(this);
        }
    }
    
    refreshServer = debounce((_self)=>{
            _self.$nextTick(() => {
                // 请求购物车 商品数量
                //shopCarGoodsService(this.$store).getShopcarGoodsesList();
            });
    }, 500);

}
