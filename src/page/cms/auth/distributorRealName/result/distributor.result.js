// 实名认证结果页面
import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';

import './distributor.result.scss';
@Component({
    template: require('./distributor.result.html'),
})
export class RealNameResult extends BaseVue {
    types = ['default', 'pending', 'reject', 'error', 'resolve'];
    resultType = '';// 返回结果 认证通过（ resolve ）;认证不通过（ reject ）; 认证等待( pending )
    result = {};
    _$dialog;
    mounted() {
        this._$dialog = this.$store.state.$dialog;
        this.$nextTick(() => {
            document.title = '实名认证';
            this.renderResult();
        });
    }
    renderResult() {
        let _self = this;
        this.result = this.$route.query.result;
        if(this.result.data){
            this.resultType = this.types[this.result.data.state || '1'];
        }else{
            // this._$dialog({
            //     dialogObj: {
            //         title: '提示',
            //         type: 'error',
            //         content: '服务异常',
            //         mainBtn: '确定',
            //         mainFn() {
                        _self.$router.push('cms_home');
            //         }
            //     }
            // });
        }
    }
    toForm() {
        this.$router.push('realname_form');
    }
    toHome() {
        this.$router.push('cms_home');
    }
}
