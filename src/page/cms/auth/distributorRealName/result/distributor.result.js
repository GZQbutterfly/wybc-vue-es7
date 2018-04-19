// 实名认证结果页面
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import './distributor.result.scss';

import service from '../distributor.real.name.service';

@Component({
    template: require('./distributor.result.html'),
})

export class DistributorRealNameResult extends BaseVue {
    types = ['default', 'pending', 'resolve', 'reject'];
    resultType = '';// 返回结果 认证等待(pending)、认证通过(resolve)、认证不通过(reject) 
    result = {};
    _$dialog;

    _$service;
    mounted() {
        this._$service = service(this.$store);
        this._$dialog = this.$store.state.$dialog;
        this.$nextTick(() => {
            document.title = '配送员实名认证';
            this.renderResult();
        });
    }

    async renderResult() {
        let _self = this;
        _self.result = _self.$route.query.result;
        if (!_self.result || !_self.result.checkState) {
            _self.result = (await _self._$service.queryDistributorRealName()).data;
        }
        if (_self.result && _self.result.checkState) {
            _self.result.checkState = _self.result.checkState;
            _self.resultType = _self.types[_self.result.checkState];
        } else {
            _self.toHome();
        }
    }

    toForm() {
        let _self = this;
        _self.$router.push('distributor_realname_form');
    }

    toHome() {
        this.$router.push('cms_home');
    }
}
