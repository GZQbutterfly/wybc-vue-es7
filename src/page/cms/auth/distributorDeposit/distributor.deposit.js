import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isEmpty } from 'lodash';
import service from './distributor.deposit.service';
import './distributor.deposit.scss';


@Component({
    template: require('./distributor.deposit.html'),
})

export class DistributorDeposit extends BaseVue {
    payList = [];
    payActive = '';
    _$service;
    pledgeMoney = 0;  //需要缴纳的押金
    steps = [
        {
            name: '缴纳押金',
            success: false,
        },
        {
            name: '提交审核',
            success: false
        }
    ];

    mounted() {
        let _self = this;
        _self._$service = service(_self.$store);
        document.title = '配送员押金';
        _self.$nextTick(() => {
            _self.queryPays();
            _self.queryMoney();
        });
    }

    /**
     * 查询押金金额
     */
    async queryMoney() {
        let _self = this;
        let res = await _self._$service.queryMoney();
        res = res.data;
        if (res.errorCode) {
            let dialogObj = {
                title: '提示',
                content: res.msg || '系统错误',
                type: 'error',
                mainBtn: '确定',
                mainFn() { }
            };
            _self.$store.state.$dialog({ dialogObj });
        } else {
            _self.pledgeMoney = res.pledgeMoney;
        }
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
        let loadding = _self.$store.state.$loadding();
        let query = {
            url: '/#/cms/distributor_realname',
            combinOrderNo: "234234234232"
        };
        _self._$service.toPay(query, _self.payActive).then(async (res) => {
            if (res) {
                _self.$router.push('distributor_realname_form');
            } else {
                //取消支付、支付时报错等
                let dialogObj = {
                    title: '提示',
                    content: '您已取消支付',
                    type: 'info',
                    mainBtn: '知道啦',
                    mainFn() { 
                        _self.$router.push('cms_home');
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
            }
            loadding.close();
        });
    }
}
