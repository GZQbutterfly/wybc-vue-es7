import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './deposit.service';
import './deposit.scss';
@Component({
    template: require('./deposit.html'),
})
export class Deposit extends BaseVue {
    // 支付选择面板
    payList = [];
    payActive = '';
    _$service;
    mounted() {
        // 注册服务
        this._$service = service(this.$store);
        // 页面标题
        document.title = '配送员押金';
        this.$nextTick(() => {
            this.queryPays();
        });
    }
    /**
     * 获取支付方式
     */
    queryPays() {
        this._$service.queryPays().then((datas) => {
            this.payList = datas;
            this.payActive = datas[0].type;
        });
    }
    // 支付选择
    swtichPay(item) {
        this.payActive = item.type;
    }
    toPay() {
        let _self = this;
        this._$service.toPay({
            url: location.href,
            combinOrderNo: "25206364189052"
        }, this.payActive).then((res) => {
            if (res) {
               // this.queryShopSteps();
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
