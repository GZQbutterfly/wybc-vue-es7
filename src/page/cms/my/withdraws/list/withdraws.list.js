
import { Component } from 'vue-property-decorator';
import  BaseVue  from 'base.vue';
import withdrawsService from './withdraws.list.service';
import './withdraws.list.scss';

@Component({
    template: require('./withdraws.list.html')
})

export class WithdrawsList extends BaseVue {
    withdrawsData = [];
    withdrawsStatusData = [
        {
            name: '提现审核中',
            desc: 'doing'
        },
        {
            name: '提现成功',
            desc: 'success'
        },
        {
            name: '提现失败',
            desc: 'error'
        },
        {
            name: '异常',
            desc: 'warning'
        }
    ];


    _$service;

    mounted() {
        //注册服务
        this._$service = withdrawsService(this.$store);

        this.$nextTick(() => {
            document.title = "提现账单";
            this.reload();
        });
    }

    /**
     * 重加载
     * @param cb
     */
    reload(cb = null) {
        this.setWithdrawsData();
        cb && cb();
    }

    /**
     * 设置提现列表数据
     */
    setWithdrawsData() {
        let _self = this;
        this._$service.queryWithdrawsData().then((res) => {
            console.log('列表', res.data.data)
            _self.withdrawsData = res.data.data;
        });
    }

    /**
     * 跳转到提现记录详情
     * @param id
     */
    goWithdrawsDetail(id) {
        this.$router.push({ path: 'withdraws_detail', query: { id: id } })
    }

    refresh(done) {
        let _self = this;
        setTimeout(function () {
            _self.reload(done);
        }, 500);
    }

    infinite(done) {
        done(true)
    }
}
