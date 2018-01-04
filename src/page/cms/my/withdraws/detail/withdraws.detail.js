
import { Component } from 'vue-property-decorator';
import  BaseVue  from 'base.vue';
import withdrawsService from './withdraws.detail.service';
import './withdraws.detail.scss';

@Component({
    template: require('./withdraws.detail.html')
})

export class WithdrawsDetail extends BaseVue {
    withdrawId = '';
    withdrawData = {};
    _$service;

    mounted() {
        //注册服务
        this._$service = withdrawsService(this.$store);
        this.withdrawId = this.$route.query.id;

        this.$nextTick(() => {
            document.title = "提现账单";
            this.reload();
        });
    }

    /**
     * 重加载
     * @param cb
     */
    reload(cb = null){
        let _self = this;
        this._$service.getWithdrawInfo(this.withdrawId).then((res) => {
            console.log('提现记录详情',res);
            if(res.data.errorCode){
                let _dialog = _self.$store.state.$dialog;
                _dialog({
                    dialogObj: {
                        title: '提示',
                        content: res.data.msg,
                        assistBtn: '',
                        mainBtn: '确定',
                        type: 'error',
                        mainFn() {
                            this.$router.push('withdraws_list')
                        }
                    }
                });
            }else{
                _self.withdrawData = res.data;
                cb && cb();
            }
        });
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
