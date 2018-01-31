import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './distributor_detail_service';
import './distributor_detail.scss';
@Component({
    template: require('./distributor_detail.html'),
})
export class DistributorDetail extends BaseVue {
    data = { money: 200, from: '北京', fromAddress: '北京天安门', to: '成都', toAddress: '成都天府广场' };
    orderInfo = { orderState: 5 }
    mounted() {

    }

    /**
    * 得到订单状态全名称
    */
    getOrderStateName() {
        return ['',
            '等待配送店长抢单......',
            '等待配送店长取货......',
            '仓库中心分拣中......',
            '配送店长正在配送.......',
            '用户确认收货，订单成功送达！',
            '订单已取消，转由分仓配送......'][this.orderInfo.orderState]      
    }
    /**
     *刷新
     */
    refresh(done){
        setTimeout(() => {
            done()
        }, 300);
    }
}