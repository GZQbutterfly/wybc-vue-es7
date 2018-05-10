import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import './payresult.scss';

@Component({
    template: require('./payresult.html'),
})

export class PayResult extends BaseVue{

    orderInfo = {};

    mounted(){
        this.orderInfo = this.$route.query;
    }

    ok(){
        this.$router.replace({path:'user_order'});
    }
}