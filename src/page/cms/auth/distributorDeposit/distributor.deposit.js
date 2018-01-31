import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './distributor.deposit.service';
import './distributor.deposit.scss';

@Component({
    template: require('./distributor.deposit.html'),
})

export class DistributorDeposit extends BaseVue {
    payList = [];
    payActive = '';
    _$service;

    mounted() {
        this._$service = service(this.$store);
        document.title = '配送员押金';
        this.$nextTick(() => {
            this.queryPays();
        });
    }

    /**
     * 查询支付方式列表
     */
    queryPays() {
        let _self = this;
        _self._$service.queryPays().then((res) => {
            _self.payList = res;
            _self.payActive = res[0].type;
        });
    }

    /**
     * 选择支付方式
     */
    swtichPay(item) {
        this.payActive = item.type;
    }

    /**
     * 支付
     */
    toPay() {
        let _self = this;
        let query = {
            url: location.href,
            combinOrderNo: "25206364189052"
        };
        this._$service.toPay(query, this.payActive).then((res) => {
            console.log(11111,res)
            if (res) {
                
            }
            else {
                let dialogObj = {
                    title: '提示',
                    content: '您已取消支付',
                    type: 'info',
                    mainBtn: '知道啦',
                    mainFn() { }
                };
                _self.$store.state.$dialog({ dialogObj });
            }
        });
    }
}
